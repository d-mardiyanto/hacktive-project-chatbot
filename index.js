import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load all .txt/.md files in /knowledge as pre-knowledge for the chatbot
function loadKnowledge() {
  const dir = path.join(__dirname, 'knowledge');
  if (!fs.existsSync(dir)) return '';
  return fs.readdirSync(dir)
    .filter(f => /\.(txt|md)$/i.test(f))
    .map(f => `--- ${f} ---\n${fs.readFileSync(path.join(dir, f), 'utf-8')}`)
    .join('\n\n');
}
const KNOWLEDGE_BASE = loadKnowledge();

const app = express();
const upload = multer();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const GEMINI_MODEL = 'gemini-2.5-flash';


app.use(cors());
app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index', { title: 'Chibi.ai - Friendly AI Assistant' });
});


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

app.post('/generate-from-image',upload.single('image'), async (req, res) => {
  const {prompt} = req.body;
  const base64image = req.file.buffer.toString('base64');

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          text: prompt
        },
        {
          inlineData: {
            mimeType: req.file.mimetype,
            data: base64image
          }
        }
      ],
    });
    
    res.status(200).json({ result : response.text });
  } catch (error) {
    res.status(500).json({ message : error.message });
  }
});


app.post('/generate-from-document',upload.single('document'), async (req, res) => {
  const {prompt} = req.body;
  const base64document = req.file.buffer.toString('base64');

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          text: prompt,
          type: 'text'
        },
        {
          inlineData: {
            mimeType: req.file.mimetype,
            data: base64document
          }
        }
      ],
    });
    
    res.status(200).json({ result : response.text });
  } catch (error) {
    res.status(500).json({ message : error.message });
  }
});

app.post('/generate-from-audio',upload.single('audio'), async (req, res) => {
  const {prompt} = req.body;
  const base64audio = req.file.buffer.toString('base64');

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          text: prompt,
          type: 'text'
        },
        {
          inlineData: {
            mimeType: req.file.mimetype,
            data: base64audio
          }
        }
      ],
    });
    
    res.status(200).json({ result : response.text });
  } catch (error) {
    res.status(500).json({ message : error.message });
  }
});

app.post('/api/chat', async (req, res) => {
  const {conversation} = req.body;

  try {
    if(!Array.isArray(conversation)) throw new Error('Conversation must be an array');
    
    const content = conversation.map(({role,text}) => ({
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
        temperature: 0.9,
        systemInstruction: [
          "You are Chibi, a friendly, playful AI assistant for Chibi.ai. Keep replies concise and engaging. Use emojis occasionally.",
          "Answer in the same language the user uses (Indonesian or English).",
          "Use the KNOWLEDGE BASE below as the source of truth for product/pricing questions. If the answer is not in it, say you are not sure.",
          "",
          "=== KNOWLEDGE BASE ===",
          KNOWLEDGE_BASE,
          "=== END KNOWLEDGE BASE ===",
        ].join('\n'),
      }
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