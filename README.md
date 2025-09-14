# Accelerator Zone - Mercedes AI Analysis

A sophisticated trading analysis platform that connects to the Deriv API for real-time market data and provides AI-powered predictions for volatility indices trading.

## 🚀 Features

- **Real-time Data Streaming**: Direct connection to Deriv API WebSocket for live market data
- **AI-Powered Predictions**: Advanced algorithm analyzing multiple factors:
  - Frequency-based analysis (historical patterns)
  - Trend analysis (momentum-based)
  - Volatility analysis (market conditions)
  - Mean reversion analysis
  - Spike detection (extreme events)
- **Multi-Run Consensus**: 4-run analysis cycle for higher accuracy
- **Risk Management**: Comprehensive risk controls and settings
- **Signal Generation**: Automated trading signal generation with XML export for Binary Bot
- **Live Dashboard**: Real-time visualization of market data and predictions

## 🔧 Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Deriv API account (demo or real)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your Deriv API tokens:
   ```
   VITE_DERIV_DEMO_TOKEN=your_demo_token_here
   VITE_DERIV_REAL_TOKEN=your_real_token_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser to `http://localhost:8080`

## 🔑 API Configuration

The application uses two Deriv API tokens:

- **Demo Token**: `ty6Pm5q4DyxTRMU` (for testing)
- **Real Token**: `ZMeYdNOS4mn7hun` (for live trading)

You can switch between demo and real accounts using the toggle in the header.

## 📊 Supported Symbols

The platform supports all Deriv Volatility Indices:

- R_10 (Volatility 10 Index)
- R_10_1S (Volatility 10 1s Index)
- R_25 (Volatility 25 Index)
- R_25_1S (Volatility 25 1s Index)
- R_50 (Volatility 50 Index)
- R_50_1S (Volatility 50 1s Index)
- R_75 (Volatility 75 Index)
- R_75_1S (Volatility 75 1s Index)
- R_100 (Volatility 100 Index)
- R_100_1S (Volatility 100 1s Index)

## 🎯 Prediction Algorithm

The AI prediction engine uses a sophisticated multi-factor analysis:

### Digit Predictions
- **Frequency Analysis (40%)**: Historical digit patterns
- **Trend Analysis (30%)**: Momentum-based adjustments
- **Volatility Analysis (20%)**: Market condition factors
- **Mean Reversion (10%)**: Price deviation corrections
- **Spike Detection**: Extreme event handling

### Band Predictions
- **Over 2**: Digits 3,4,5,6,7,8,9
- **Under 7**: Digits 0,1,2,3,4,5,6
- Enhanced with trend, volatility, and mean reversion analysis

## ⚙️ Risk Management

Configurable risk parameters:

- **Max Consecutive Losses**: Default 3
- **Daily Loss Limit**: Default $100
- **Max Drawdown**: Default 20%
- **Probability Threshold**: Default 75%
- **Required Runs**: Default 3 consensus runs
- **Stake Amount**: Default $1

## 🔄 Signal Generation

The system generates trading signals based on:

1. **Multi-run Analysis**: 4 analysis cycles over 10 seconds
2. **Consensus Building**: Requires minimum runs for signal generation
3. **Confidence Thresholds**: Only generates signals above probability threshold
4. **XML Export**: Compatible with Binary Bot for automated trading

## 🛠️ Technical Stack

- **Frontend**: React 18 + TypeScript
- **UI Framework**: Tailwind CSS + shadcn/ui
- **WebSocket**: Native WebSocket API
- **State Management**: React Hooks
- **Build Tool**: Vite
- **Charts**: Canvas-based sparklines

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── TradingDashboard.tsx
│   ├── LiveFeed.tsx
│   ├── PredictionPanel.tsx
│   └── ...
├── hooks/              # Custom React hooks
│   ├── useDerivWebSocket.ts
│   └── usePredictionEngine.ts
├── types/              # TypeScript type definitions
│   └── deriv.ts
├── utils/              # Utility functions
└── pages/              # Page components
```

## 🚨 Error Handling

The application includes comprehensive error handling:

- **WebSocket Reconnection**: Automatic reconnection with exponential backoff
- **API Error Handling**: Graceful handling of Deriv API errors
- **Analysis Error Recovery**: Robust prediction engine error handling
- **Connection Status**: Real-time connection and authorization status

## 🔒 Security

- Environment variables for sensitive data
- Token-based authentication
- Secure WebSocket connections
- No sensitive data in client-side code

## 📈 Performance

- Optimized WebSocket message handling
- Efficient tick data management (last 100 ticks per symbol)
- Canvas-based chart rendering
- Debounced analysis cycles

## 🐛 Troubleshooting

### Common Issues

1. **Connection Failed**: Check your internet connection and API tokens
2. **No Data**: Ensure you're subscribed to a valid symbol
3. **Analysis Errors**: Check browser console for detailed error messages
4. **Build Errors**: Ensure all dependencies are installed with `npm install`

### Debug Mode

Enable debug logging by opening browser developer tools and checking the console for detailed logs.

## 📝 License

This project is for educational and research purposes. Please ensure compliance with Deriv's terms of service when using their API.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## ⚠️ Disclaimer

This software is for educational purposes only. Trading involves risk, and past performance does not guarantee future results. Always trade responsibly and within your risk tolerance.