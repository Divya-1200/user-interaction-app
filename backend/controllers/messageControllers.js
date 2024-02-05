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
console.log("tags: " + tags);
for (const tag of tags) {
  if (!tag._id) {
    const tagFind = await Tag.findOne({ tag });
    
    if (tagFind) {
      updatedTags.push(tagFind);
      console.log("Found tag ID: " + tagFind._id);
    } else {
      const newTag = await Tag.create({ tag });
      updatedTags.push(newTag);
      console.log("Newly added tag ID: " + newTag._id);
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
//  console.log("users ",users);
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
    console.log(message);
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
  console.log(users);
  const userEmails = users.map((user) => {
    console.log(`User: `, user.user.email);
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
  // to = 'divya.perumal120@gmail.com';
  console.log('here in send mail ', to);
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // Your SMTP server host
    port: 587, // Your SMTP server port (this can vary, check with your email provider)
    secure: false, // Use SSL/TLS if true, false for other ports
    auth: {
      user: 'd123j45mail@gmail.com', // Your email address
      pass: 'redgnncenmzdgqre', // Your email password
    },
  });

  // Setup email data
  const mailOptions = {
    from: 'd123j45mail@gmail.com', // Sender address
    to, // List of recipients
    subject, // Subject line
    text: body, // Plain text body
  };

  try {
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('here in send mail 123');
    console.log('Email sent: ', info.response);
  } catch (error) {
    console.error('Error sending email: ', error);
    throw new Error('Error sending email');
  }
};


module.exports = { allMessages, sendMessage };
