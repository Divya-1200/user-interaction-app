const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const Tag  = require("../models/tagModel"); 
const nodemailer = require('nodemailer');


//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
const allMessages = asyncHandler(async (req, res) => {
  try {
    var messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("tags")
      .populate("reply")
      .populate("chat");

      messages = await User.populate(messages, {
        path: "reply.sender",
        select: "name pic email",
      });

    res.json(messages);
  } catch (error) {
    res.status(400);
    console.log(error);
    throw new Error(error);
  }
});

//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected
const sendMessage = asyncHandler(async (req, res) => {
  const { content, tags, chatId, priority, users, replyingTo } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }
  let updatedTags = [];
for (const tag of tags) {
  if (!tag._id) {
    const tagFind = await Tag.findOne({ tag });
    
    if (tagFind) {
      updatedTags.push(tagFind);
    } else {
      const newTag = await Tag.create({ tag });
      updatedTags.push(newTag);
    }
  } else {
    updatedTags.push(tag);
  }
}
  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
    tags: updatedTags,
    reply: replyingTo,
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic").execPopulate();
    message = await message.populate("chat").execPopulate();
    message = await message.populate("reply").execPopulate();
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });
    message = await User.populate(message, {
      path: "reply.sender",
      select: "name pic email",
    });
    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }

  if(priority){
    sendPriorityMessageEmail(users, content, req.user.name);
  }

});

const sendPriorityMessageEmail = async (users, content, sender) => {
  const userEmails = users.map((user) => {
    return user.user.email;
  });
  try {
    await sendEmail({
      to: userEmails,
      subject: 'Priority Message',
      body: `A priority message has been sent from ${sender} : ${content}`,
    })
    .then(() => console.log('Email sent successfully'))
    .catch((error) => console.error('Failed to send email:', error.message));
  } catch (error) {
    console.error('Error sending priority message email: ', error.message);
  }
};

const sendEmail = async ({ to, subject, body }) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", 
    port: 587, 
    secure: false, 
    auth: {
      user: 'd123j45mail@gmail.com',
      pass: 'redgnncenmzdgqre', 
    },
  });

  // Setup email data
  const mailOptions = {
    from: 'd123j45mail@gmail.com',
    to, 
    subject, 
    text: body, 
  };

  try {
    // Send the email
    const info = await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email: ', error);
    throw new Error('Error sending email');
  }
};


module.exports = { allMessages, sendMessage };
