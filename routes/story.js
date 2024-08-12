const express = require("express");
const router = express.Router();
const { createStory } = require("../controllers/story");
const verifyToken = require("../middleware");

router.post("/:userId", verifyToken, createStory);

module.exports = router;
