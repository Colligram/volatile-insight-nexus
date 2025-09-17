# Deriv Prediction Platform

A comprehensive prediction platform designed to forecast the outcome of digit-based contracts on Deriv.com using advanced algorithms, patterns, and statistical models.

## 🚀 Features

### Core Prediction Engine
- **10-Second Digit Match Prediction**: Advanced engine that assigns probability scores to specific numbers appearing within 10-second time frames
- **Real-time Analysis**: Live market analysis with automated signals and chart data analysis from Deriv.com
- **Comprehensive Volatility Analysis**: Analysis across all volatility indices (Vol 10, 25, 50, 75, 100, and 1s variants)
- **Over/Under Analysis**: Intelligent analysis of over/under digit contracts (0-8 vs 9-1 digits)

### Advanced Analytics
- **Multi-factor Prediction Models**: Combines frequency analysis, trend analysis, volatility analysis, mean reversion, and spike detection
- **Market Regime Detection**: Identifies trending, ranging, volatile, and calm market conditions
- **Cross-Volatility Correlation**: Analyzes correlations between different volatility indices
- **Technical Indicators**: RSI, MACD, Bollinger Bands, Moving Averages
- **Pattern Recognition**: Automated pattern detection with confidence scoring

### Trading Features
- **Automated Signal Generation**: Generates trading signals based on prediction confidence
- **Risk Management**: Comprehensive risk controls with customizable settings
- **Binary Bot Integration**: Export XML files for automated trading
- **Real-time Monitoring**: Live feed of market data and predictions

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: Radix UI, Tailwind CSS, Lucide React
- **Charts**: Recharts, Lightweight Charts
- **WebSocket**: Real-time connection to Deriv API
- **State Management**: React Hooks, React Query

## 📊 API Integration

### Deriv.com API
- **Demo Account**: `V2HgXWBEZVkAV9h`
- **Real Account**: `i11qvL6rCXAElTv`
- **WebSocket Endpoint**: `wss://ws.binaryws.com/websockets/v3?app_id=1089`

### Supported Volatility Indices
- Volatility 10 Index (R_10)
- Volatility 10 (1s) Index (R_10_1S)
- Volatility 25 Index (R_25)
- Volatility 25 (1s) Index (R_25_1S)
- Volatility 50 Index (R_50)
- Volatility 50 (1s) Index (R_50_1S)
- Volatility 75 Index (R_75)
- Volatility 75 (1s) Index (R_75_1S)
- Volatility 100 Index (R_100)
- Volatility 100 (1s) Index (R_100_1S)

## 🎯 Prediction Algorithms

### 1. Frequency-Based Analysis (30% weight)
- Historical digit patterns and frequency analysis
- Base probability calculation from digit histogram

### 2. Trend Analysis (25% weight)
- Momentum-based predictions using price deltas
- Trend direction and strength calculations

### 3. Volatility Analysis (20% weight)
- Market condition awareness with regime classification
- Volatility-adjusted probability calculations

### 4. Market Regime Analysis (15% weight)
- Trending, ranging, volatile, and calm market detection
- Regime-specific prediction adjustments

### 5. Sequence Pattern Analysis (10% weight)
- Digit sequence pattern recognition
- Pattern-based probability adjustments

## 📈 Advanced Features

### 10-Second Prediction Engine
- Real-time digit probability forecasting
- Market condition analysis
- Volatility impact assessment
- Time-to-expiry calculations

### Comprehensive Volatility Analysis
- Cross-volatility correlation analysis
- Volatility cluster detection
- Volatility forecasting (10s, 30s, 60s)
- Market impact analysis with digit bias

### Real-time Analysis Engine
- Live technical indicators (RSI, MACD, Bollinger Bands)
- Pattern recognition with confidence scoring
- Automated signal generation
- Chart data analysis

### Over/Under Analysis
- Enhanced over/under digit contract analysis
- Multiple band configurations (0-8 vs 9-1, 2-9 vs 0-7)
- Volatility-adjusted predictions
- Trend-based analysis

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd deriv-prediction-platform

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables
Create a `.env` file in the root directory:
```env
VITE_DERIV_WS_URL=wss://ws.binaryws.com/websockets/v3?app_id=1089
VITE_DERIV_DEMO_TOKEN=V2HgXWBEZVkAV9h
VITE_DERIV_REAL_TOKEN=i11qvL6rCXAElTv
VITE_DEFAULT_SYMBOL=R_50
VITE_ANALYSIS_INTERVAL=2000
```

## 📱 Usage

### 1. Asset Selection
- Choose from available volatility indices
- Select timeframe (1min or 5min)
- Switch between demo and real accounts

### 2. Risk Controls
- Set probability thresholds
- Configure maximum consecutive losses
- Set daily loss limits
- Adjust stake amounts

### 3. Analysis Panels
- **10-Second Prediction**: Real-time digit predictions with probability scores
- **Volatility Analysis**: Comprehensive volatility analysis across all indices
- **Real-time Analysis**: Live technical indicators and automated signals
- **Over/Under Analysis**: Advanced over/under contract analysis

### 4. Signal Generation
- Automated signal generation based on prediction confidence
- Manual signal generation option
- XML export for Binary Bot integration

## 🔧 Configuration

### Risk Settings
```typescript
interface RiskSettings {
  maxConsecutiveLosses: number;    // Default: 3
  dailyLossLimit: number;          // Default: 100
  maxDrawdownPercent: number;      // Default: 20
  probabilityThreshold: number;    // Default: 0.75
  requiredRuns: number;           // Default: 3
  stake: number;                  // Default: 1
  martingaleMultiplier: number;   // Default: 2.0
}
```

### Analysis Intervals
- **Main Analysis**: 2 seconds
- **10-Second Prediction**: 10 seconds
- **Volatility Analysis**: 5 seconds

## 📊 Performance Metrics

### Prediction Accuracy
- Real-time confidence scoring
- Historical accuracy tracking
- Market regime performance analysis

### Risk Management
- Drawdown monitoring
- Loss streak tracking
- Daily P&L analysis

## 🔒 Security

- Secure WebSocket connections
- API token management
- Risk controls and limits
- No sensitive data storage

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

This platform is for educational and research purposes only. Trading involves substantial risk of loss and is not suitable for all investors. Past performance is not indicative of future results. Always trade responsibly and within your risk tolerance.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support and questions, please open an issue in the repository.

---

**Built with ❤️ for the Deriv trading community**