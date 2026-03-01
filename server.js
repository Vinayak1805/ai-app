const express = require("express");
const Groq = require("groq-sdk");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Frontend
app.get("/", (req, res) => {
  res.send(`
  <!DOCTYPE html>
  <html>
  <head>
    <title>AI App Live (Groq)</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <style>
      body {
        margin: 0;
        font-family: Arial;
        background: #0f172a;
        color: white;
        display: flex;
        flex-direction: column;
        height: 100vh;
      }
      header {
        padding: 20px;
        text-align: center;
        background: #111827;
        font-size: 22px;
        font-weight: bold;
      }
      #chat {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
      }
      .message {
        padding: 12px;
        margin-bottom: 12px;
        border-radius: 12px;
        max-width: 75%;
      }
      .user {
        background: #2563eb;
        align-self: flex-end;
      }
      .bot {
        background: #374151;
        align-self: flex-start;
      }
      #inputArea {
        display: flex;
        padding: 15px;
        background: #111827;
      }
      input {
        flex: 1;
        padding: 12px;
        border-radius: 8px;
        border: none;
        outline: none;
      }
      button {
        padding: 12px 20px;
        margin-left: 10px;
        border-radius: 8px;
        border: none;
        background: #22c55e;
        color: white;
        cursor: pointer;
        font-weight: bold;
      }
    </style>
  </head>
  <body>
    <header>AI App Live (Groq)</header>
    <div id="chat"></div>
    <div id="inputArea">
      <input id="messageInput" placeholder="Type your message..." />
      <button onclick="sendMessage()">Send</button>
    </div>
    <script>
      const chat = document.getElementById("chat");

      function addMessage(text, type) {
        const div = document.createElement("div");
        div.className = "message " + type;
        div.innerText = text;
        chat.appendChild(div);
        chat.scrollTop = chat.scrollHeight;
      }

      async function sendMessage() {
        const input = document.getElementById("messageInput");
        const message = input.value.trim();
        if (!message) return;

        addMessage(message, "user");
        input.value = "";

        try {
          const response = await fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
          });

          const data = await response.json();
          addMessage(data.reply, "bot");
        } catch (err) {
          addMessage("Error: " + err.message, "bot");
        }
      }
    </script>
  </body>
  </html>
  `);
});

// Chat route
app.post("/chat", async (req, res) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      return res.json({
        reply: "GROQ_API_KEY missing in Render environment variables"
      });
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "user", content: req.body.message }
      ],
      model: "llama3-8b-8192",
    });

    res.json({
      reply: completion.choices[0].message.content,
    });

  } catch (error) {
    console.error("Groq Error:", error);
    res.status(500).json({
      reply: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});