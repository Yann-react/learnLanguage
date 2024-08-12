require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");

const message = require("./routes/message");
const story = require("./routes/story");
const chat = require("./routes/chat");
const user = require("./routes/user");
const app = express();
app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
  res.json("tessssst");
});

app.use("/message", message);
app.use("/story", story);
app.use("/chat", chat);
app.use("/user", user);

module.exports = app;
