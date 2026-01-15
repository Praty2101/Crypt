# Crypt AI Trading Platform

> AI-Powered Trading Analytics with Multi-Agent System

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green)
![Python](https://img.shields.io/badge/Python-3.11+-yellow)

## 🚀 Overview

Crypt is an AI-powered trading analytics platform that combines multi-model predictions with a team of specialized AI agents to provide comprehensive market analysis and trading suggestions.

### Key Features

- 📈 **Market Overview** - Real-time indices, crypto prices, and sentiment
- 🤖 **5 AI Agents** - Specialized agents for different aspects of trading
- 📊 **Model Predictions** - Aggregated predictions from multiple ML models
- 🎯 **Risk-Based Suggestions** - Tailored to your risk profile
- 💬 **AI Chat** - Natural language interaction with agents
- 💼 **Portfolio Tracking** - Holdings, P/L, and analytics

## 🏗️ Architecture

```
├── frontend/          # Next.js React application
│   ├── src/
│   │   ├── app/       # App router pages
│   │   ├── components/ # React components
│   │   └── services/  # API services
│
├── backend/           # FastAPI Python application
│   ├── api/           # API routes
│   ├── agents/        # AI agent implementations
│   ├── models/        # Database models
│   └── services/      # Business logic
│
├── ai/                # AI configuration
│   ├── prompts/       # Agent system prompts
│   └── tools/         # LangChain tools
│
└── docs/              # Documentation
```

## 🤖 AI Agents

| Agent | Role |
|-------|------|
| 📈 Market Analyst | Technical analysis, trends, patterns |
| 📰 News Scout | News aggregation, sentiment analysis |
| ⚠️ Risk Manager | Risk assessment, danger alerts |
| 🎯 Strategy Coach | Trading strategies, position sizing |
| 💼 Portfolio Bot | Portfolio tracking, rebalancing |

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS
- **Backend**: FastAPI, Python 3.11+
- **AI/ML**: LangChain, OpenAI GPT-4
- **Database**: PostgreSQL, Redis
- **APIs**: Yahoo Finance, CoinGecko, Alpha Vantage

## 📦 Installation

### Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL
- Redis

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python main.py
```

## 🔧 Configuration

### Environment Variables

**Frontend (.env.local)**
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

**Backend (.env)**
```
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/crypt_db
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=sk-your-key
```

## 📡 API Endpoints

### Market Data
- `GET /api/market/overview` - Market overview
- `GET /api/market/stocks/{symbol}` - Stock quote
- `GET /api/market/crypto/{symbol}` - Crypto quote

### Predictions
- `GET /api/predictions/asset/{symbol}` - Asset prediction
- `GET /api/predictions/top-picks` - Top picks

### AI Agents
- `POST /api/agents/chat` - Chat with agents
- `POST /api/agents/analyze/{symbol}` - Analyze asset
- `GET /api/agents/suggestions` - Get suggestions

### Portfolio
- `GET /api/portfolio/summary` - Portfolio summary
- `POST /api/portfolio/holdings` - Add holding
- `GET /api/portfolio/watchlist` - Get watchlist

## 🖥️ Screenshots

### Market Overview
Real-time market data with indices, crypto, and sentiment meters.

### AI Chat
Natural language interaction with specialized trading agents.

### Portfolio
Track holdings, P/L, allocation, and get rebalancing suggestions.

## 🚀 Deployment

### Vercel (Frontend)
```bash
cd frontend
vercel
```

### Railway (Backend)
```bash
cd backend
railway up
```

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📧 Contact

Questions? Open an issue or reach out!

---

Built with ❤️ and AI
