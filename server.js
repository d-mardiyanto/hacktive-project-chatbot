import 'dotenv/config';
import express from 'express';
import path from 'path';
import cors from 'cors';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const GEMINI_MODEL = 'gemini-2.0-flash'; // Fixed to use a valid version if 2.5 was a typo or preview

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/api/chat', async (req, res) => {
  const { conversation } = req.body;

  try {
    if (!Array.isArray(conversation)) throw new Error('Conversation must be an array');

    const content = conversation.map(({ role, text }) => ({
      role: role,
      parts: [
        {
          text: text
        }
      ]
    }));

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: content,
      config: {
        temperature: 0.8,
        systemInstruction: "You are a cute, friendly, and professional 3D chibi AI mascot assistant for a modern AI SaaS platform. Your name is 'Lumi'. You use a light blue and white color palette. You are helpful, polite, and sometimes use emojis to feel more friendly. You answer questions about the product, which is an AI-powered productivity suite. Keep responses concise and engaging.",
      }
    });

    res.status(200).json({ result : response.text });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ message : error.message });
  }
});

// Keep other endpoints for utility if needed, but primary is /api/chat
app.post('/generate-text', async (req, res) => {
  const {prompt} = req.body;
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });
    res.status(200).json({ result : response.text });
  } catch (error) {
    res.status(500).json({ message : error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
