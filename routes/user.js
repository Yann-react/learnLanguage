const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  resetPassword,
} = require("../controllers/user");

router.post("/", registerUser);
router.post("/login", loginUser);
router.post("/logoutUser", logoutUser);
router.post("/resetPassword", resetPassword);

module.exports = router;
