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
}

export interface DigitPrediction {
  digit: number;
  probability: number;
  confidence: number;
}

export interface BandPrediction {
  over2: number;
  under7: number;
  confidence: number;
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
  };
}