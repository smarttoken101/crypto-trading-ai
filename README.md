# 🤖 Multi-Agent Crypto Trading AI System

A sophisticated Next.js application that uses 6 specialized AI agents to provide comprehensive cryptocurrency and forex trading analysis. Each agent contributes unique insights, with the final Hedge Fund Trader agent making informed BUY/SELL/HOLD decisions based on all previous analyses.

## 🚀 Live Demo

**Website**: [https://crypto-ai-analysis.lindy.site](https://crypto-ai-analysis.lindy.site)

## ✨ Features

### 🎯 Multi-Agent Architecture
- **6 Specialized AI Agents** working in sequence
- **Sequential Workflow** where each agent builds upon previous analyses
- **Comprehensive Final Decision** based on all agent reports

### 🤖 AI Agents

1. **🔍 Researcher Agent** - Technical & fundamental analysis
2. **💭 Sentiment Agent** - Market sentiment analysis from social media
3. **📰 News Agent** - Latest market news and events
4. **🌍 Macro Agent** - Macroeconomic factors and trends
5. **📈 Bull Agent** - Bullish case arguments
6. **📉 Bear Agent** - Bearish case arguments
7. **💼 Hedge Fund Trader** - Final trading decision (reviews ALL previous reports)

### 🛠️ Technical Features

- **Next.js 15** with TypeScript
- **PostgreSQL** database for analysis storage
- **shadcn/ui** components with Tailwind CSS
- **OpenAI GPT-4** and **Google Gemini** API support
- **Real-time progress tracking**
- **Professional trading reports**
- **Responsive design** for desktop and mobile

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Researcher    │───▶│   Sentiment     │───▶│      News       │
│     Agent       │    │     Agent       │    │     Agent       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│      Macro      │───▶│      Bull       │───▶│      Bear       │
│     Agent       │    │     Agent       │    │     Agent       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                    ┌─────────────────────┐
                    │  Hedge Fund Trader  │
                    │  (Final Decision)   │
                    └─────────────────────┘
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- OpenAI API key or Google Gemini API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/smarttoken101/crypto-trading-ai.git
cd crypto-trading-ai
```

2. **Install dependencies**
```bash
bun install
```

3. **Set up PostgreSQL database**
```bash
createdb -h localhost crypto_trading_ai
```

4. **Configure environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
PGUSER=your_postgres_user
PGPASSWORD=your_postgres_password
PGDATABASE=crypto_trading_ai
PGHOST=localhost
PGPORT=5432
```

5. **Run the development server**
```bash
bun run dev
```

6. **Configure API Keys**
- Visit `/settings` in your browser
- Add your OpenAI or Google Gemini API key
- Select your preferred AI provider

## 📊 How It Works

### Sequential Multi-Agent Workflow

1. **Input**: User enters asset pair (e.g., BTC/USD, EUR/USD)
2. **Analysis Pipeline**: 
   - First 5 agents create individual research reports
   - Each agent specializes in different market aspects
   - Reports are stored in PostgreSQL database
3. **Final Decision**: 
   - Hedge Fund Trader agent reads ALL previous reports
   - Makes comprehensive BUY/SELL/HOLD decision
   - Provides detailed reasoning and risk assessment

### Key Features

- ✅ **"Run Complete Analysis"** - Executes all agents automatically
- ✅ **Real-time Progress** - Track which agents are completed
- ✅ **Individual Reports** - View detailed analysis from each agent
- ✅ **Professional Output** - Trading reports with risk management
- ✅ **Multiple Assets** - Supports crypto and forex pairs

## 🛠️ API Endpoints

- `POST /api/analysis/create` - Create new analysis session
- `POST /api/analysis/[sessionId]/run-all` - Run all agents sequentially
- `GET /api/analysis/[sessionId]/[agent]` - Get individual agent report
- `POST /api/settings` - Save API configuration

## 🎨 UI Components

Built with modern, responsive design:

- **Homepage** - Asset input and agent overview
- **Complete Analysis** - Multi-agent pipeline dashboard  
- **Individual Agent Pages** - Detailed reports from each agent
- **Settings** - API key configuration
- **Progress Tracking** - Real-time status updates

## 🔧 Technology Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Lucide React icons
- **Backend**: Next.js API routes, PostgreSQL
- **AI Integration**: OpenAI GPT-4, Google Gemini
- **Deployment**: Vercel-ready configuration

## 📈 Sample Analysis Flow

```
1. User enters "BTC/USD"
2. Researcher Agent: Analyzes technical charts and fundamentals
3. Sentiment Agent: Evaluates social media and market psychology  
4. News Agent: Compiles recent market-moving news
5. Macro Agent: Assesses economic factors and trends
6. Bull Agent: Arguments for buying BTC
7. Bear Agent: Arguments for selling BTC
8. Hedge Fund Trader: Reviews all reports → Final Decision: BUY/SELL/HOLD
```

## 🚀 Deployment

The application is deployment-ready for Vercel:

```bash
vercel deploy
```

Make sure to configure environment variables in your deployment platform.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- AI powered by [OpenAI](https://openai.com/) and [Google Gemini](https://ai.google.dev/)
- Icons by [Lucide](https://lucide.dev/)

## 📞 Support

For support, email a_nojoumi@keywa.io or create an issue in this repository.

---

**⚠️ Disclaimer**: This application is for educational and informational purposes only. It does not constitute financial advice. Cryptocurrency and forex trading involves significant risk. Always consult with qualified financial advisors before making investment decisions.
