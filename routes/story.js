const express = require("express");
const router = express.Router();
const { createStory, getAllStory, getStory } = require("../controllers/story");
const verifyToken = require("../middleware");

router.post("/:userId", verifyToken, createStory);
router.get("/:userId", verifyToken, getAllStory);
router.get("/:userId/:storyId", verifyToken, getStory);

module.exports = router;
