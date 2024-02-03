const mongoose = require("mongoose");

const chatModel = mongoose.Schema(
  {
    chatName: { type: String, trim: true },
    isGroupChat: { type: Boolean, default: false },
    users: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status: { type: String, default: "pending" },
      }
    ],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    groupDescription: {type: String, default: " " },
    tags :[{type: mongoose.Schema.Types.ObjectId, ref: "Tag"}] ,
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatModel);

module.exports = Chat;
