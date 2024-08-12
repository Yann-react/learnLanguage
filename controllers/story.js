const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createStory = async (req, res) => {
  try {
    const { name, description, initialPrompt, targetLanguage } = req.body;
    const { userId } = req.params;
    if (!name || !description || !initialPrompt || !targetLanguage || !userId) {
      return res
        .status(400)
        .json({ error: "veillez remplie tout les champs requis" });
    }
    const baseLang = await prisma.user.findFirst({
      where: {
        id: parseInt(userId),
      },
    });
    const story = await prisma.story.create({
      data: {
        name,
        description,
        initialPrompt,
        baseLanguage: baseLang ? baseLang.nativeLang : "FRENCH",
        targetLanguage,
        userId: parseInt(userId),
      },
    });
    res.status(201).json(story);
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Erreur serveur." });
  }
};

const getAllStory = async (req, res) => {
  try {
    const stories = await prisma.story.findMany({});
    res.status(201).json(stories);
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Erreur serveur." });
  }
};

const getInfoStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const story = await prisma.story.findFirst({
      where: {
        id: parseInt(storyId),
      },
    });
    res.status(201).json(story);
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Erreur serveur." });
  }
};
module.exports = {
  createStory,
  getAllStory,
  getInfoStory,
};
