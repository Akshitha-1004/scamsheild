# ScamShield AI — Source Code

## Quick Start

### Terminal 1 — Backend (port 5000)
cd backend
npm init -y
npm install express cors dotenv multer openai @anthropic-ai/sdk @google-cloud/translate franc
npm install --save-dev nodemon
cp .env.example .env   ← fill in your 3 API keys
npm run dev

### Terminal 2 — Frontend (port 3000)
cd frontend
npm create vite@latest . -- --template react
npm install
npm install firebase
cp .env.example .env   ← fill in Firebase config
npm run dev

Open: http://localhost:3000

## Required API Keys
1. Firebase       → console.firebase.google.com
2. OpenAI Whisper → platform.openai.com/api-keys
3. Anthropic      → console.anthropic.com
4. Google Cloud   → console.cloud.google.com (Translation API)

Read the Developer Guide .docx for full step-by-step instructions.
