const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");
const Tag  = require("../models/tagModel"); 
const nodemailer = require('nodemailer');
//@description     Create or fetch One to One Chat
//@route           POST /api/chat/
//@access          Protected
const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }
  const isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { 'users.user': { $eq: req.user._id } },
      { 'users.user': { $eq: userId } },
    ],
  }) .populate({
    path: "users.user",
    select: "name pic email",
  })
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
      path: "users.user",
      select: "name pic email",
  });
  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

//@description     Fetch all chats for a user
//@route           GET /api/chat/
//@access          Protected
const fetchChats = asyncHandler(async (req, res) => {
  console.log(req.user);
  try {
    Chat.find({"users.user": req.user._id  })
    .populate({
      path: "users.user",
      select: "name pic email",
    })
      .populate("groupAdmin", "-password")
      .populate("tags","-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "users.user",
          select: "name pic email",
        });
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name pic email",
        });
        res.status(200).send(results);
      });
  } catch (error) {
    console.log(error);
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Create New Group Chat
//@route           POST /api/chat/group
//@access          Protected
const createGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please Fill all the feilds" });
  }
  var users = JSON.parse(req.body.users);
  var tags = JSON.parse(req.body.tags);
  if (users.length < 1) {
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");
  }
  users.push(req.user);
  try {
    
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users.map(user => ({
        user,
        status: user === req.user ? "accepted" : "pending"
      })),
      isGroupChat: true,
      groupAdmin: req.user,
      groupDescription: req.body.description,
      tags: tags,

    });

    const invitePromises = users.map(async (user) => {
      if (user !== req.user) {
        await sendInvitationEmail(user, groupChat, req.user);
      }
    });
    await Promise.all(invitePromises);

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users.user", "-password")
      .populate("groupAdmin", "-password");
    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});
const sendInvitationEmail = async (user, groupChat, invitor) => {
  console.log("invitor ",invitor)
  const invitationLink = `http://localhost:3000/accept/${user._id}/${groupChat._id}`;
  try {
    await sendEmail({
      to: user.email,
      subject: `You're Invited to Join ${groupChat.chatName}`,
      body: `Hello,
     You have been invited to join the group chat "${groupChat.chatName}" by !
     Click the following link to accept the invitation: ${invitationLink}
     Thank you!`,
    })
    .then(() => console.log('Email sent successfully'))
    .catch((error) => console.error('Failed to send email:', error.message));
  } catch (error) {
    console.error('Error sending priority message email: ', error.message);
    // Handle the error accordingly
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
    const info = await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email: ', error);
    throw new Error('Error sending email');
  }
};

// @desc  
// @route  /api/chat/accept/:id
// @access  Protected
const acceptInvitation = asyncHandler (async (req, res) => {
  const chatId  = req.params.chatId;
  const userId   = req.params.userId 
  console.log('userId: ', userId);
  try {
    const chat = await Chat.findByIdAndUpdate(
      chatId,
      { $set: { 'users.$[elem].status': 'accepted' } },
      {
        arrayFilters: [{ 'elem.user': userId }],
        new: true, 
      }
    );
    console.log('chat: ', chat);
    if (!chat || !chat.users.some(user => user.user._id.toString() === userId)) {
      res.status(404).json({ message: 'User ID not found in the chat.' });
      return;
    }
    res.status(200).json({ message: 'Invitation accepted successfully.' });
  } catch (error) {
    res.status(400).json({ message: 'Failed to accept invitation.' });
    throw new Error(error.message);
  }
});

// @desc Update group chat
// @route PUT/ /api/chat/description
// @access protected
const updateDescription = asyncHandler(async (req, res) => {
  const { chatId, groupDescription } = req.body;

  const updatedDescription = await Chat.findByIdAndUpdate(
    chatId, 
    {
      groupDescription: groupDescription,

    },
    {
      new : true,
    }
  )
  .populate("users.user", "-password")
  .populate("groupAdmin", "-password");

  if (!updatedDescription) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(updatedDescription);
  }
});

// @desc    Rename Group
// @route   PUT /api/chat/rename
// @access  Protected
const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName: chatName,
    },
    {
      new: true,
    }
  )
  .populate({
    path: "users.user",
    select: "name pic email",
  })
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(updatedChat);
  }
});

// @desc    Remove user from Group
// @route   PUT /api/chat/groupremove
// @access  Protected
const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: { user: userId } },
    },
    {
      new: true,
    }
  )
  .populate({
    path: "users.user",
    select: "name pic email",
  })
    .populate("tags","-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    console.log("error occured");
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(removed);
  }
});

const removeFromTag = asyncHandler(async(req, res) => {
  const {chatId, tagId} = req.body;
  const removedTag = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { tags: tagId },
    },
    {
      new: true,
    }
    )
    .populate("users.user", "-password")
    .populate("tags","-password")
    .populate("groupAdmin", "-password");

    if(!removedTag){
      console.log("error occured");
      res.status(404);
      throw new Error("Chat Not Found");
    } else {
      res.json(removedTag);
    }
});

// @desc    Add user to Group / Leave
// @route   PUT /api/chat/groupadd
// @access  Protected
const addToGroup = asyncHandler(async (req, res) => {
  const { chat, user } = req.body;
  // check if the requester is admin
  try{
    const added = await Chat.findByIdAndUpdate(
      chat._id,
      {
        $push: { users: { user: user._id } },
      },
      {
        new: true,
      }
    )
    .populate({
      path: "users.user",
      select: "name pic email",
    })
    .populate("groupAdmin", "-password")
    .populate("tags",  "-password");

    sendInvitationEmail(user, chat);
    if (!added) {
      res.status(404);
      throw new Error("Chat Not Found");
    } else {
      res.json(added);
    }
  }
  catch(error){
    console.log("error", error);
    throw new Error(error);
  }
  


});

// @desc  addFromTag
// @route  tag/add
// @access  Protected
const addFromTag  = asyncHandler(async (req, res) => {
  const { chatId, tag } = req.body;
  var tagId;
  if(tag._id){
    tagId = tag._id;
  }
  else{
    const tagFind = await Tag.findOne({tag:tag}); // Chance of inserting duplicate tag
    if(tagFind){
      tagId = tagFind._id;
    }
    else{
      const newTag = await Tag.create({
       tag,
      });
      tagId = newTag._id;
    }
  }
  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { tags: tagId },
    },
    {
      new: true,
    }
  )
  .populate({
    path: "users.user",
    select: "name pic email",
  })
    .populate("tags",  "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(added);
  }
});

const getGroupName = asyncHandler(async (req, res) => {
  try {
    const chats = await Chat.find();
    res.status(200).json(chats);
    console.log(chats);
  } catch (error) {
    console.error("Error retrieving chats:", error);
    res.status(500).json({ message: "Server Error" });
  }
});


module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
  updateDescription,
  removeFromTag,
  addFromTag,
  acceptInvitation,
  getGroupName,
};
