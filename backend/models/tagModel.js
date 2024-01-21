const mongoose = require("mongoose");

const tagModel = mongoose.Schema(
  {
    tag: { type: String, trim: true },
    
  },
  { timestamps: true }
);

const Tag = mongoose.model("Tag", tagModel);

module.exports = Tag;