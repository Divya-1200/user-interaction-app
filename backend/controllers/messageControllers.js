const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const Tag  = require("../models/tagModel"); 

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("tags")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected
const sendMessage = asyncHandler(async (req, res) => {
  const { content, tags, chatId } = req.body;

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
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic").execPopulate();
    message = await message.populate("chat").execPopulate();
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = { allMessages, sendMessage };
