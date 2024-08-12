const { PrismaClient } = require("@prisma/client");

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.API_GEMINI);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const prisma = new PrismaClient();

const getAllMessageByChat = async (req, res) => {
  try {
    const { userId, chatId } = req.params;

    const messages = await prisma.message.findMany({
      where: {
        userId: parseInt(userId),
        chatId: parseInt(chatId),
      },
    });
    res.status(201).json(messages);
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Erreur serveur." });
  }
};

const existenceChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const existence_chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
      },
    });
    if (existence_chat) {
      const resumePrompt = existence_chat.resumePrompt;
      console.log(resumePrompt);
      res(201).json(resumePrompt);
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Erreur serveur." });
  }
};
// const conversation = async (req, res) => {
//   try {
//     const { chatId } = req.params;
//     const existence_chat = await prisma.chat.findFirst({
//         where: {
//           id: chatId,
//         },
//         story:{
//             select
//         }
//       });

//     const chat = model.startChat({
//       history: [
//         {
//           role: "user",
//           parts: [
//             {
//               text: "On vas jouer a un jeux de role ou tu seras le docteur et moi le patient",
//             },
//           ],
//         },
//         // {
//         //   role: "model",
//         //   parts: [{ text: "Great to meet you. What would you like to know?" }],
//         // },
//       ],
//       generationConfig: {
//         maxOutputTokens: 100,
//       },
//     });

//     const { msg } = req.body;

//     const result = await chat.sendMessage(msg);
//     const response = await result.response;
//     const text = response.text();
//     console.log(text);
//   } catch (e) {
//     console.log(e);
//   }
// };
const conversation = async (req, res) => {
  try {
    const { chatId, userId } = req.params;
    console.log(chatId, userId, "AAA")

    // Find the chat and associated story
    const chat = await prisma.chat.findFirst({
      where: {
        id: parseInt(chatId),
        userId: parseInt(userId),
      },
      include: {
        story: true,
        message: {
          where: {
            userId: parseInt(userId),
          },
        },
      },
    });

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    let history = [];

    // Check if there are any existing messages by the user
    if (chat.message.length === 0) {
      // No messages found, use the initial prompt
      history.push({
        role: "user",
        parts: [
          {
            text: chat.story.initialPrompt,
          },
        ],
      });
    } else {
      // Messages exist, use the resume prompt
      history.push({
        role: "user",
        parts: [
          {
            text: `voici ce dont on a parler la derniere fois je souhaite qu'on continue :${chat.resumePrompt}`,
          },
        ],
      });
    }

    // Start the chat with the generated history
    const modelChat = model.startChat({
      history: history,
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    const { msg } = req.body;

    // Send the user's message and get the response
    const result = await modelChat.sendMessage(msg);
    const response = await result.response;
    const text = await response.text();
    const message = await prisma.message.create({
      data: {
        userId: parseInt(userId),
        chatId: parseInt(chatId),
        contentUser: msg,
        contentSystem: text,
      },
    });

    console.log(text);

    res.json({ ReponseAI: text, message });
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .json({ error: "An error occurred during the conversation" });
  }
};
const resumeConversation = async (req, res) => {
  try {
    const { chatId, userId } = req.params;
    const messages = await prisma.message.findMany({
      where: {
        userId: parseInt(userId),
        chatId: parseInt(chatId),
      },
    });

    if (messages.length === 0) {
      return res.status(201).json({ response: "Aucune donnée à résumer" });
    }

    let conversation = "";

    messages.forEach((message) => {
      conversation += `l'utilisateur a dit: ${message.contentUser}\n`;
      conversation += `docteur a dit: ${message.contentSystem}\n`;
    });

    const prompt = `fait un resumer de cette conversation: ${conversation}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log(text);
    const chat = await prisma.chat.update({
      where: {
        id:parseInt(chatId)
      },
      data: {
        resumePrompt: text,
      },
    });
    res.json(chat);
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .json({ error: "An error occurred during the conversation" });
  }
};

module.exports = {
  conversation,
  getAllMessageByChat,
  resumeConversation,
};
