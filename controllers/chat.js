const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const createChat = async (req, res) => {
  try {
    const { resumePrompt, tokenNumber } = req.body;
    const { storyId, userId } = req.params;
    if ( !tokenNumber || !storyId || !userId) {
      return res
        .status(400)
        .json({ error: "veillez remplie tout les champs requis" });
    }
    const chat = await prisma.chat.create({
      data: {
        resumePrompt,
        tokenNumber:parseInt(tokenNumber),
        storyId: parseInt(storyId),
        userId: parseInt(userId),
      },
    });
    res.json(chat)
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Erreur serveur." });
  }
};

const getAllChatByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const chats = await prisma.chat.findMany({
      where: {
        userId: parseInt(userId),
      },
    });
    res.status(201).json(chats);
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Erreur serveur." });
  }
};

const getInfoChat = async (req, res) => {
  try {
    const { chatId, userId } = req.params;
    const chat = await prisma.chat.findFirst({
      where: {
        id: parseInt(chatId),
        userId: parseInt(userId),
      },
    });
    res.json(chat);
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Erreur serveur." });
  }
};
module.exports = {
  createChat,
  getAllChatByUser,
  getInfoChat,
};
