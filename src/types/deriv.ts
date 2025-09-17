// Deriv API Types and Data Structures

export interface DerivTick {
  id: string;
  symbol: string;
  timestamp: number;
  price: number;
  lastDigit: number;
  raw: any;
}

export interface DerivSymbol {
  symbol: string;
  display_name: string;
  market: string;
  market_display_name: string;
  submarket: string;
  submarket_display_name: string;
}

// Volatility Indices supported by Deriv
export const VOLATILITY_INDICES = [
  { symbol: 'R_10', name: 'Volatility 10 Index', shortName: 'Vol 10' },
  { symbol: 'R_10_1S', name: 'Volatility 10 (1s) Index', shortName: 'Vol 10 (1s)' },
  { symbol: 'R_25', name: 'Volatility 25 Index', shortName: 'Vol 25' },
  { symbol: 'R_25_1S', name: 'Volatility 25 (1s) Index', shortName: 'Vol 25 (1s)' },
  { symbol: 'R_50', name: 'Volatility 50 Index', shortName: 'Vol 50' },
  { symbol: 'R_50_1S', name: 'Volatility 50 (1s) Index', shortName: 'Vol 50 (1s)' },
  { symbol: 'R_75', name: 'Volatility 75 Index', shortName: 'Vol 75' },
  { symbol: 'R_75_1S', name: 'Volatility 75 (1s) Index', shortName: 'Vol 75 (1s)' },
  { symbol: 'R_100', name: 'Volatility 100 Index', shortName: 'Vol 100' },
  { symbol: 'R_100_1S', name: 'Volatility 100 (1s) Index', shortName: 'Vol 100 (1s)' },
] as const;

export type VolatilityIndex = typeof VOLATILITY_INDICES[number]['symbol'];

export interface PredictionFeatures {
  mean: number;
  std: number;
  lastDeltas: number[];
  signChanges: number;
  digitHistogram: Record<string, number>;
  averageVelocity: number;
  spikeIndicator: boolean;
  volatility: number;
  // Enhanced features for 10-second prediction
  priceAcceleration: number;
  momentum: number;
  trendStrength: number;
  volatilityClusters: number[];
  digitSequences: number[];
  marketRegime: 'trending' | 'ranging' | 'volatile' | 'calm';
  // Cross-volatility analysis
  crossVolatilityCorrelation: Record<string, number>;
  volatilityRegime: 'low' | 'medium' | 'high' | 'extreme';
}

export interface DigitPrediction {
  digit: number;
  probability: number;
  confidence: number;
  // Enhanced prediction features
  timeHorizon: number; // seconds
  volatilityImpact: number;
  trendAlignment: number;
  sequencePattern: boolean;
  marketRegimeAlignment: number;
}

export interface BandPrediction {
  over2: number;
  under7: number;
  confidence: number;
  // Enhanced band analysis
  overUnderAnalysis: {
    over0to8: number; // digits 0-8
    under9to1: number; // digits 9-1
    over2to9: number; // digits 2-9
    under0to7: number; // digits 0-7
  };
  volatilityAdjusted: boolean;
  trendBased: boolean;
}

export interface TradingSignal {
  id: string;
  symbol: string;
  timestamp: number;
  type: 'exact_digit' | 'over_under';
  predicted_digit?: number;
  predicted_band?: 'over2' | 'under7';
  confidence: number;
  runs: number;
  status: 'pending' | 'executed' | 'expired' | 'cancelled';
  features: PredictionFeatures;
}

export interface RiskSettings {
  maxConsecutiveLosses: number;
  dailyLossLimit: number;
  maxDrawdownPercent: number;
  probabilityThreshold: number;
  requiredRuns: number;
  stake: number;
  martingaleMultiplier: number;
}

export interface MarketStatus {
  status: 'normal' | 'shift' | 'volatile' | 'disconnected';
  zScore: number;
  message: string;
  timestamp: number;
}

export interface DerivAuth {
  authorize: string;
}

export interface DerivSubscription {
  ticks: string;
  subscribe?: number;
}

export interface DerivMessage {
  msg_type?: string;
  tick?: {
    id: string;
    epoch: number;
    symbol: string;
    quote: number;
  };
  error?: {
    code: string;
    message: string;
  };
  authorize?: {
    loginid: string;
    balance?: number;
    currency?: string;
  };
}

// 10-Second Prediction Engine Types
export interface TenSecondPrediction {
  id: string;
  symbol: VolatilityIndex;
  timestamp: number;
  predictions: {
    digit: number;
    probability: number;
    confidence: number;
    volatilityImpact: number;
    timeToExpiry: number;
  }[];
  topPrediction: {
    digit: number;
    probability: number;
    confidence: number;
  };
  marketConditions: {
    volatility: number;
    trend: 'up' | 'down' | 'sideways';
    regime: 'trending' | 'ranging' | 'volatile' | 'calm';
  };
  analysisTime: number; // milliseconds taken for analysis
}

// Comprehensive Volatility Analysis
export interface VolatilityAnalysis {
  symbol: VolatilityIndex;
  timestamp: number;
  currentVolatility: number;
  volatilityHistory: number[];
  volatilityRegime: 'low' | 'medium' | 'high' | 'extreme';
  crossCorrelations: Record<VolatilityIndex, number>;
  volatilityClusters: {
    cluster: number;
    startTime: number;
    endTime: number;
    intensity: number;
  }[];
  volatilityForecast: {
    next10Seconds: number;
    next30Seconds: number;
    next60Seconds: number;
  };
  marketImpact: {
    digitBias: Record<string, number>;
    trendStrength: number;
    reversalProbability: number;
  };
}

// Real-time Analysis Engine
export interface RealtimeAnalysis {
  symbol: VolatilityIndex;
  timestamp: number;
  chartData: {
    price: number;
    volume: number;
    timestamp: number;
  }[];
  technicalIndicators: {
    rsi: number;
    macd: number;
    bollingerUpper: number;
    bollingerLower: number;
    movingAverage: number;
  };
  patternRecognition: {
    patterns: string[];
    confidence: number;
    nextMove: 'up' | 'down' | 'sideways';
  };
  automatedSignals: {
    type: 'buy' | 'sell' | 'hold';
    strength: number;
    timeframe: number;
    reasoning: string;
  }[];
}