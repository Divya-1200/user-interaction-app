const express = require("express");
const cors = require("cors");
const {
    allTags,
  } = require("../controllers/tagControllers");
const { protect } = require("../middleware/authMiddleware");


const router = express.Router();
router.use(cors());
router.route("/").get(protect, allTags);

module.exports = router;