const express = require("express");
const cors = require("cors");

const {
  registerUser,
  authUser,
  allUsers,
} = require("../controllers/userControllers");
const { protect } = require("../middleware/authMiddleware");

console.log("authUser", authUser);

const router = express.Router();
router.use(cors());
router.route("/").get(protect, allUsers);
router.route("/").post(registerUser);
router.post("/login", authUser);
console.log("authUser", authUser);
module.exports = router;
