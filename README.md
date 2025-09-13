# Accelerator Zone - Mercedes AI Analysis Platform

A sophisticated, real-time volatility indices analysis platform for Deriv markets with AI-powered predictions and automated XML bot export capabilities.


## 🚀 Features

### Real-Time Market Analysis
- **Live WebSocket Connection** to Deriv API with automatic reconnection
- **Multi-Timeframe Support** for 1-minute and 5-minute analysis windows
- **Comprehensive Asset Coverage** including all Deriv volatility indices (10, 25, 50, 75, 100) and their 1-second variants
- **Real-Time Tick Streaming** with sparkline visualization and historical data retention

### AI-Powered Predictions
- **Exact Digit Analysis** with probability distribution for digits 0-9
- **Over/Under Band Predictions** for Over 2 and Under 7 scenarios
- **Multi-Run Consensus Logic** evaluating up to 4 analysis runs within 10-second windows
- **Confidence-Based Signal Generation** with configurable probability thresholds

### Advanced Risk Management
- **Market Shift Detection** using rolling z-score volatility analysis
- **Configurable Risk Limits** including max consecutive losses and daily loss limits
- **Real-Time Market Status Monitoring** with automatic trading halt capabilities
- **Drawdown Protection** with percentage-based stop-loss mechanisms

### Professional Trading Interface
- **Dark Theme Glass Morphism Design** with electric blue accents
- **Responsive 3-Column Layout** optimized for both desktop and mobile
- **Real-Time Data Visualization** with animated charts and live tick feeds
- **Interactive Risk Controls** with slider-based parameter adjustment

### XML Bot Integration
- **Binary Bot Compatible XML Export** with one-click download
- **Configurable Trading Parameters** including stake, duration, and strategy type
- **Automated Trade Signal Documentation** with full audit trail
- **Import-Ready Format** for immediate use in Deriv Bot platform

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript for type-safe development
- **Vite** for lightning-fast development and optimized builds
- **Tailwind CSS** with custom design system and semantic tokens
- **shadcn/ui** components with extensive customization
- **Lucide React** icons for professional UI elements

### Backend (Ready for Extension)
- **Node.js 18+** with Express.js framework
- **WebSocket Client** for real-time Deriv API connectivity
- **SQLite Database** for tick data persistence and signal history
- **Lightweight ML Engine** with statistical analysis and prediction models

### Analysis Engine
- **Feature Extraction Pipeline** with rolling window analysis
- **Multi-Run Consensus Algorithm** for signal validation
- **Statistical Modeling** with volatility and trend detection
- **Risk-Adjusted Signal Generation** with configurable thresholds

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm installed
- Modern web browser with WebSocket support
- Deriv demo account (recommended) or live account

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd accelerator-zone

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Environment Configuration

Create a `.env` file in the root directory:

```env
# Deriv API Configuration
DERIV_WS_URL=wss://ws.binaryws.com/websockets/v3?app_id=1089
DERIV_TOKEN=your_demo_token_here
DERIV_APP_ID=1089

# Application Settings
NODE_ENV=development
PORT=3000

# Optional: Telegram Integration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

## 📊 Usage Guide

### Getting Started
1. **Launch Application**: Start the development server and navigate to the dashboard
2. **Select Asset**: Choose from available volatility indices (R_10, R_25, R_50, etc.)
3. **Configure Risk Settings**: Set stake amount, risk limits, and probability thresholds
4. **Start Analysis**: Click "Start Analysis" to begin real-time market monitoring

### Asset Selection
- **Standard Indices**: R_10, R_25, R_50, R_75, R_100 (updated every ~2 seconds)
- **High-Frequency Indices**: R_10_1S, R_25_1S, etc. (updated every second)
- **Timeframe Options**: 1-minute or 5-minute analysis windows

### Risk Management
- **Probability Threshold**: Minimum confidence level for signal generation (50%-90%)
- **Required Runs**: Number of consensus runs needed (2-4 out of 4 total runs)
- **Stake Management**: Base stake amount with optional martingale progression
- **Loss Limits**: Maximum consecutive losses and daily loss caps

### Signal Generation
1. **Automatic Mode**: Signals generated when consensus and confidence thresholds are met
2. **Manual Mode**: Force signal generation for current top prediction
3. **Export Options**: Download Binary Bot XML for immediate import
4. **Signal History**: Track all generated signals with status updates

### XML Bot Integration
1. **Generate Signal**: Wait for high-confidence prediction or manually trigger
2. **Export XML**: Click "Export XML" button to download bot file
3. **Import to Deriv Bot**: Upload XML file directly to Binary Bot interface
4. **Execute Strategy**: Run the imported strategy with your configured parameters

## 🔧 Configuration Options

### Trading Parameters
- **Stake Amount**: Base trade amount in USD
- **Martingale Multiplier**: Multiplier for loss recovery (1.0x - 3.0x)
- **Contract Duration**: Automatic based on asset type (5 ticks for 1s, 10 ticks for standard)

### Analysis Settings
- **Probability Threshold**: 50% - 90% confidence requirement
- **Required Consensus**: 2-4 agreeing runs out of 4 total
- **Analysis Window**: Last 10-30 seconds of tick data
- **Feature Extraction**: Statistical indicators and trend analysis

### Risk Controls
- **Max Consecutive Losses**: 1-10 losing trades before halt
- **Daily Loss Limit**: Maximum daily loss in USD
- **Drawdown Protection**: 5%-50% portfolio protection
- **Market Shift Halt**: Automatic stop during high volatility

## 📈 Analysis Methodology

### Feature Extraction
The platform analyzes multiple statistical features from recent tick data:

- **Price Statistics**: Mean, standard deviation, variance
- **Trend Indicators**: Price deltas, velocity, direction changes
- **Volatility Measures**: Rolling volatility, spike detection
- **Digit Analysis**: Last digit frequency distribution
- **Market Conditions**: Trend strength, regime detection

### Prediction Models
- **Frequency Analysis**: Historical digit occurrence patterns
- **Trend Adjustment**: Recent price movement bias
- **Volatility Weighting**: High-volatility period adjustments
- **Ensemble Logic**: Multiple model consensus voting

### Signal Validation
- **Multi-Run Analysis**: 4 separate prediction runs every 2.5 seconds
- **Consensus Requirement**: Configurable agreement threshold (2-4 runs)
- **Confidence Filtering**: Minimum probability threshold enforcement
- **Risk Assessment**: Real-time market condition evaluation

## 🛡️ Security & Best Practices

### API Security
- **Demo Mode Default**: Application starts in safe demo mode
- **Environment Variables**: Secure token storage (never commit tokens)
- **Connection Encryption**: TLS-secured WebSocket connections
- **Rate Limiting**: Built-in connection throttling and backoff

### Risk Management
- **Conservative Defaults**: Safe initial risk parameters
- **Real-Time Monitoring**: Continuous market condition assessment
- **Automatic Halts**: Multiple circuit breakers for risk protection
- **Audit Trail**: Complete signal and trade history logging

### Data Protection
- **Local Storage**: Sensitive data stored locally only
- **No Data Transmission**: Prediction models run client-side
- **Privacy First**: No external analytics or tracking
- **Secure Defaults**: All risk settings start at conservative levels

## 🔄 Development & Deployment

### Development Setup
```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Run type checking
npm run type-check

# Build for production
npm run build
```

### Production Deployment
```bash
# Build optimized version
npm run build

# Preview production build
npm run preview

# Deploy to your hosting platform
npm run deploy
```

### Docker Support (Coming Soon)
```bash
# Build Docker image
docker build -t accelerator-zone .

# Run with Docker Compose
docker-compose up
```

## 📋 Roadmap

### Phase 1 (Current)
- ✅ Real-time Deriv WebSocket integration
- ✅ Multi-asset volatility index support
- ✅ AI-powered digit and band predictions
- ✅ Professional trading dashboard
- ✅ XML bot export functionality

### Phase 2 (Planned)
- 🔄 Backend API with database persistence
- 🔄 Advanced ML models (LightGBM integration)
- 🔄 Historical backtesting capabilities
- 🔄 Telegram notification system
- 🔄 Portfolio management tools

### Phase 3 (Future)
- ⏳ Multi-broker support expansion
- ⏳ Social trading features
- ⏳ Advanced charting and analysis
- ⏳ Mobile application development
- ⏳ API for third-party integration

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Guidelines
- Follow TypeScript best practices
- Maintain design system consistency
- Add tests for new features
- Update documentation

### Bug Reports
Please use the [Issues](https://github.com/your-repo/accelerator-zone/issues) page to report bugs or request features.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

**Important Risk Warning**: Trading financial derivatives carries significant risk. Past performance does not guarantee future results. This software is provided for educational and research purposes. Always:

- Use demo accounts for testing
- Never risk more than you can afford to lose
- Understand the risks involved in financial trading
- Consult with financial advisors as needed
- Comply with local financial regulations

The developers are not responsible for any financial losses incurred through use of this software.

## 📞 Support

- **Documentation**: [Full API Docs](https://docs.accelerator-zone.app)
- **Discord**: [Join our community](https://discord.gg/accelerator-zone)
- **Email**: support@accelerator-zone.app
- **Issues**: [GitHub Issues](https://github.com/your-repo/accelerator-zone/issues)

---

**Mercedes AI Analysis** | Accelerating Trading Intelligence

*Built with ❤️ using React, TypeScript, and modern web technologies*