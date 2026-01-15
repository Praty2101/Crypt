# Crypt - AI-Powered Trading Analytics Platform

## Architecture Overview

This document describes the technical architecture of the Crypt platform.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USER INTERFACE                             │
│                    Next.js Dashboard (React + TypeScript)            │
│  ┌─────────┐ ┌────────────┐ ┌──────────┐ ┌─────────┐ ┌───────────┐  │
│  │ Market  │ │ Predictions│ │ Actions  │ │  Chat   │ │ Portfolio │  │
│  │Overview │ │   Table    │ │ Panel    │ │ Agent   │ │  Summary  │  │
│  └────┬────┘ └─────┬──────┘ └────┬─────┘ └────┬────┘ └─────┬─────┘  │
└───────┼────────────┼─────────────┼────────────┼────────────┼────────┘
        │            │             │            │            │
        └────────────┴─────────────┴────────────┴────────────┘
                                   │
                            REST API / WebSocket
                                   │
┌──────────────────────────────────┴──────────────────────────────────┐
│                          FastAPI BACKEND                             │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                        API Layer                              │   │
│  │  /market  │  /predictions  │  /agents  │  /portfolio  │ /auth │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                   │                                  │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                      Service Layer                            │   │
│  │  MarketService │ PredictionService │ PortfolioService│ Auth  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                   │                                  │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    AI Agent System                            │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐                │   │
│  │  │  Market    │ │   News     │ │   Risk     │                │   │
│  │  │  Analyst   │ │   Scout    │ │  Manager   │                │   │
│  │  └────────────┘ └────────────┘ └────────────┘                │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐                │   │
│  │  │ Strategy   │ │ Portfolio  │ │Orchestrator│                │   │
│  │  │   Coach    │ │    Bot     │ │            │                │   │
│  │  └────────────┘ └────────────┘ └────────────┘                │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
        │                    │                     │
        ▼                    ▼                     ▼
┌───────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐
│  PostgreSQL   │  │     Redis       │  │     External APIs           │
│  (User Data)  │  │  (Cache/Queue)  │  │ Yahoo Finance │ CoinGecko   │
│               │  │                 │  │ Alpha Vantage │ Binance     │
└───────────────┘  └─────────────────┘  │ NewsAPI       │ HuggingFace │
                                        └─────────────────────────────┘
```

## Component Breakdown

### Frontend (Next.js)

| Component | Purpose |
|-----------|---------|
| `MarketOverview` | Displays market indices, crypto prices, sentiment |
| `PredictionsTable` | Shows aggregated model predictions |
| `SuggestedActions` | Risk-based trading suggestions |
| `AgentChat` | Interactive AI chat interface |
| `PortfolioSummary` | Holdings, P/L, and analytics |

### Backend (FastAPI)

| API Route | Description |
|-----------|-------------|
| `/api/market/*` | Stock and crypto market data |
| `/api/predictions/*` | ML model predictions |
| `/api/agents/*` | AI agent interactions |
| `/api/portfolio/*` | Portfolio management |
| `/api/auth/*` | Authentication |

### AI Agent System

| Agent | Role | Key Functions |
|-------|------|---------------|
| Market Analyst | Technical analysis | Trend ID, indicators, patterns |
| News Scout | Sentiment analysis | News, social media, events |
| Risk Manager | Risk assessment | Volatility, VaR, danger signals |
| Strategy Coach | Strategy advice | Entry/exit, position sizing |
| Portfolio Bot | Portfolio tracking | P/L, rebalancing, diversification |
| Orchestrator | Coordination | Query routing, response synthesis |

## Data Flow

### Market Data Flow
```
External APIs → MarketService → Redis Cache → API Response → Frontend
```

### Prediction Flow
```
Market Data → Feature Extraction → ML Models → Aggregation → Consensus → Suggested Action
```

### Agent Query Flow
```
User Query → Orchestrator → Route to Agents → Parallel Processing → Synthesis → Response
```

## Technology Decisions

### Why FastAPI?
- Async support for high-performance API
- Automatic OpenAPI documentation
- Type hints and validation with Pydantic
- Easy integration with Python ML ecosystem

### Why LangChain?
- Abstraction for LLM interactions
- Built-in memory management
- Tool/function calling support
- Easy agent orchestration

### Why Next.js?
- React with SSR/SSG capabilities
- API routes for BFF pattern
- Excellent developer experience
- Easy deployment to Vercel

### Why PostgreSQL + Redis?
- PostgreSQL: Reliable relational data storage
- Redis: Fast caching and rate limiting
- Together: Scalable data layer

## Security Considerations

1. **Authentication**: JWT tokens with refresh mechanism
2. **Rate Limiting**: Redis-based per-user limits
3. **Input Validation**: Pydantic models for all requests
4. **CORS**: Configured for specific origins
5. **Data Encryption**: TLS for all communications

## Scalability

- **Horizontal**: Stateless API can scale horizontally
- **Caching**: Redis reduces API calls to external services
- **Async**: Non-blocking I/O for high concurrency
- **Queue**: Celery for background tasks (predictions, alerts)

## Deployment

| Component | Platform |
|-----------|----------|
| Frontend | Vercel |
| Backend | Railway / AWS ECS |
| Database | Railway PostgreSQL / AWS RDS |
| Redis | Railway Redis / AWS ElastiCache |
