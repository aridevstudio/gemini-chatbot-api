import { GoogleGenAI } from "@google/genai";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import 'dotenv/config';
import process from "process";
import { fileURLToPath } from "url";

const app = express();
const port = process.env.PORT || 3000;

// Inisialisasi SDK Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

async function generate(prompt) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "system",
          parts: [
            { 
              text: "You are a helpful, energetic, and optimistic assistant for Aridev Studio. Do not answer any questions that are not related to the company. You will answer questions based on Aridev Studio's knowledge base and provide accurate information. Aridev Studio is a digital agency and website development company based in Sukabumi, Indonesia. We specialize in creating modern websites, digital marketing solutions, and IT consultation services. If you don't know the answer, you will say 'I don't know' instead of making up an answer. After each chat, you will always recommend the user to contact Aridev Studio for further assistance. You will also provide the company's contact information at the end of each chat: Website: https://www.aridevstudio.web.id, Phone: +62 82112348765, Address: Sukabumi, West Java, Indonesia."
            }
          ]
        },
        {
          role: "user",
          parts: [
            { text: prompt }
          ]
        }
      ],
    });

    return { output_text: response.response.text() };
  } catch (error) {
    throw new Error(`API error: ${error.message}`);
  }
}



  // Endpoint API untuk Client/Frontend
  app.post("/api/chat", async (req, res) => {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: "Prompt tidak boleh kosong" });
    }

    try {
      const result = await generate(prompt);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// Jalankan Express Server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});

// Eksekusi via CLI
const currentFilePath = fileURLToPath(import.meta.url);
if (process.argv[1] === currentFilePath) {
  const prompt = process.argv.slice(2).join(' ') || 'Tulis ringkasan singkat tentang AI.';
  generate(prompt)
    .then(resp => console.log("\n[CLI Output]:\n", JSON.stringify(resp, null, 2)))
    .catch(err => console.error('Error:', err.message));
}

export { generate };