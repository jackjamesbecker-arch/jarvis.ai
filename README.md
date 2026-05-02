# J.A.R.V.I.S — Just A Rather Very Intelligent System

An adaptive AI assistant with a holographic HUD interface, powered by Claude AI.

## Features
- 🤖 Adaptive AI with 12 modes (Analysis, Code, Research, Creative, Tactical, Math, Science, History, Debug, Translate, Debate, Summarize)
- 🎨 6 color themes + 4 UI styles
- 📱 PWA — installable as a mobile app
- 📧 Send emails via EmailJS
- 📲 Send & receive SMS via Twilio
- 👤 Operator profiles synced across devices via Supabase
- 💾 Cloud chat history, contacts, and preferences
- 🔒 Email-gated access with progress animation

## Deploy

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/jarvis-ai
```

### 2. Set environment variables in Netlify
```
ANTHROPIC_API_KEY      = your Anthropic API key
TWILIO_ACCOUNT_SID     = your Twilio account SID
TWILIO_AUTH_TOKEN      = your Twilio auth token
TWILIO_PHONE_NUMBER    = your Twilio phone number
SUPABASE_URL           = your Supabase project URL
SUPABASE_KEY           = your Supabase anon public key
```

### 3. Deploy to Netlify
Drag the folder into [netlify.com](https://netlify.com) or connect your GitHub repo directly.

## Tech Stack
- **Frontend** — Vanilla HTML/CSS/JS
- **AI** — Anthropic Claude (claude-sonnet-4-5)
- **Email** — EmailJS
- **SMS** — Twilio
- **Database** — Supabase (PostgreSQL)
- **Hosting** — Netlify (serverless functions)

## Environment Variables
All sensitive keys are stored as Netlify environment variables — never in the code.
