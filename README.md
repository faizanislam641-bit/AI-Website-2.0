# 🤖 FAIZAN AI — Intelligent Chat Website

AI chat website powered by **Google Gemini** — supports text chat + image analysis (math, diagrams, code, text reading, translation) with 4D animated background, day/night mode, and animated UI.

## ✨ Features
- 🖼️ **Image analysis** — upload any image, AI solves it
- 💬 Text chat with memory (context-aware)
- 🌌 4D Tesseract animated background
- 🌙 Day/Night mode toggle
- 🎨 Animated border, buttons, input bar, glitch title
- 📱 Responsive
- 👤 Contact modal (FB, LinkedIn, WhatsApp, Portfolio, GitHub)

## 🚀 Deploy on GitHub Pages

1. Create a new GitHub repo (e.g., `ai-website`)
2. Upload `index.html`, `style.css`, `script.js`, `README.md`
3. Go to **Settings → Pages**
4. Source: `main` branch → `/root` → Save
5. Live at `https://YOUR-USERNAME.github.io/ai-website/`

## 🔑 Add Your Free Gemini API Key

1. Visit https://aistudio.google.com/apikey
2. Sign in with Google
3. Click **Create API Key**
4. Copy the key
5. Open `script.js` and replace:
   ```js
   const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';