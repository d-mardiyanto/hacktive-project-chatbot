# Gemini Flash API — Chibi.ai Chatbot

A small Express server that wraps Google's **Gemini 2.5 Flash** model and serves a friendly chatbot UI ("Chibi.ai"). It exposes endpoints for text, image, document, and audio generation, plus a multi-turn `/api/chat` endpoint backed by a local knowledge base.

## Features

- **Multi-turn chat** at `POST /api/chat` with conversation history.
- **Knowledge base injection**: any `.txt` / `.md` file dropped into `knowledge/` is loaded at startup and injected into the system instruction (used for "Compare Plans", "About Me", etc.).
- **Multimodal endpoints**: text, image, document, and audio inputs.
- **EJS-rendered landing page** (`views/index.ejs`) with a floating chat widget.
- **Static assets** served from `public/` (CSS, JS, images).

## Tech Stack

- Node.js (ES Modules)
- Express 5
- EJS
- `@google/genai`
- multer, cors, dotenv

## Project Structure

```
.
├── index.js              # Express app + routes
├── views/
│   └── index.ejs         # Landing page + chat widget
├── public/
│   ├── css/style.css
│   ├── js/app.js         # Chat client (calls /api/chat)
│   └── img/chibi.png     # Mascot
├── knowledge/            # Pre-knowledge for the chatbot
│   ├── about.txt
│   └── pricing.txt
├── .env                  # GEMINI_API_KEY=...
└── package.json
```

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   Create a `.env` file in the project root:
   ```
   GEMINI_API_KEY=your_google_ai_studio_api_key
   PORT=3000
   ```
   Get a key from [Google AI Studio](https://aistudio.google.com/app/apikey).

3. **Run the server**
   ```bash
   node index.js
   ```
   Open <http://localhost:3000>.

## API Endpoints

### `POST /api/chat`
Multi-turn chat. Body:
```json
{
  "conversation": [
    { "role": "user",  "text": "Hi" },
    { "role": "model", "text": "Hello! 👋" },
    { "role": "user",  "text": "Compare Plans" }
  ]
}
```
Response:
```json
{ "result": "..." }
```

### `POST /generate-text`
Body: `{ "prompt": "..." }`

### `POST /generate-from-image` (multipart/form-data)
Fields: `prompt` (text), `image` (file)

### `POST /generate-from-document` (multipart/form-data)
Fields: `prompt` (text), `document` (file)

### `POST /generate-from-audio` (multipart/form-data)
Fields: `prompt` (text), `audio` (file)

## Adding Knowledge

Drop a `.txt` or `.md` file into `knowledge/` and restart the server. Its contents are appended to the chatbot's system instruction so it can answer questions grounded in that information.

Example: `knowledge/faq.md` → restart → ask the bot a question from the FAQ.

## Suggestion Buttons

The chat widget has quick-action buttons (`Compare Plans`, `About Me`) defined in `views/index.ejs`. Clicking one sends its label as the user message — the model uses the knowledge base to answer.

## Security Notes

- **Never commit `.env`** — it's already in `.gitignore`.
- The API key stays on the server; the browser only talks to `/api/chat`.

## License

ISC
