const express = require("express");
const router = express.Router();
const { createChat } = require("../controllers/chat");
const verifyToken = require("../middleware");

router.post("/:storyId/:userId", verifyToken, createChat);

module.exports = router;
