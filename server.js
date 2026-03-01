const express = require("express");
const OpenAI = require("openai");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Debug route to check if server is alive
app.get("/health", (req, res) => {
  res.send("Server is running");
});

// Frontend
app.get("/", (req, res) => {
  res.send("AI Server Running");
});

// Chat route
app.post("/chat", async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.json({
        reply: "OPENAI_API_KEY is missing in Render Environment Variables"
      });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "user", content: req.body.message }
      ],
    });

    res.json({
      reply: response.choices[0].message.content,
    });

  } catch (error) {
    console.error("REAL ERROR:", error);
    res.status(500).json({
      reply: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});