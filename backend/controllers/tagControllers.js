const asyncHandler = require("express-async-handler");
const Tag = require("../models/tagModel");


//@description     Get or Search all users
//@route           GET /api/user?search=
//@access          Public
const allTags = asyncHandler(async (req, res) => {
    const keyword = req.query.search

    try{
      const tags = await Tag.find({ tag: { $regex: new RegExp(keyword, 'i'), $ne: keyword } });
      console.log("tags ", tags);
      res.send(tags);
    }
    catch(err) {
      console.log(err);
    }
   
    
  });


  module.exports = { allTags };
