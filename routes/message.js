const express = require("express");
const router = express.Router();
const {
  conversation,
  getAllMessageByChat,
  resumeConversation,
} = require("../controllers/message");
const verifyToken = require("../middleware");

router.post("/:chatId/:userId", verifyToken, conversation);
router.get(
  "/getAllMessageByChat/:userId/:chatId",
  verifyToken,
  getAllMessageByChat
);
router.put(
  "/resumeConversation/:userId/:chatId",
  verifyToken,
  resumeConversation
);
// router.post("/getAllMessageByChat", getAllMessageByChat);

module.exports = router;
