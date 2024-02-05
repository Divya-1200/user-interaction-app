const express = require("express");
const cors = require("cors");
const {
  accessChat,
  fetchChats,
  createGroupChat,
  removeFromGroup,
  addToGroup,
  renameGroup,
  updateDescription,
  removeFromTag,
  addFromTag,
  acceptInvitation,
} = require("../controllers/chatControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(cors());
router.route("/").post(protect, accessChat);
router.route("/").get(protect, fetchChats);
router.route("/group").post(protect, createGroupChat);
router.route("/rename").put(protect, renameGroup);
router.route("/description").put(protect, updateDescription);
router.route("/groupremove").put(protect, removeFromGroup);
router.route("/tag/remove").put(protect, removeFromTag);
router.route("/tag/add").put(protect, addFromTag);
router.route("/groupadd").put(protect, addToGroup);
router.route("/accept").get( acceptInvitation);
module.exports = router;
