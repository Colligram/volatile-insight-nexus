// Application Constants

export const APP_NAME = 'Accelerator Zone';
export const APP_DESCRIPTION = 'Mercedes AI Analysis Platform for Deriv Volatility Indices';

// API Configuration
export const DERIV_WS_URL = 'wss://ws.binaryws.com/websockets/v3?app_id=1089';
export const DEFAULT_APP_ID = '1089';

// Analysis Configuration
export const DEFAULT_ANALYSIS_WINDOW = 30; // ticks
export const DEFAULT_PREDICTION_INTERVAL = 2500; // milliseconds
export const MAX_RUNS_PER_CYCLE = 4;
export const MIN_TICKS_FOR_ANALYSIS = 10;

// Risk Management Defaults
export const DEFAULT_RISK_SETTINGS = {
  maxConsecutiveLosses: 3,
  dailyLossLimit: 100,
  maxDrawdownPercent: 20,
  probabilityThreshold: 0.75,
  requiredRuns: 3,
  stake: 1,
  martingaleMultiplier: 2.0,
};

// Market Status Thresholds
export const MARKET_SHIFT_Z_SCORE_THRESHOLD = 3.5;
export const HIGH_VOLATILITY_THRESHOLD = 0.02;
export const SPIKE_DETECTION_MULTIPLIER = 2.0;

// UI Configuration
export const MAX_DISPLAYED_TICKS = 10;
export const MAX_SIGNAL_HISTORY = 50;
export const TOAST_DURATION = 5000;

// WebSocket Configuration
export const WS_RECONNECT_DELAY = 1000;
export const WS_MAX_RECONNECT_DELAY = 30000;
export const WS_HEARTBEAT_INTERVAL = 30000;

// Demo Mode Configuration
export const DEMO_TICK_INTERVALS = {
  standard: 2000, // 2 seconds
  oneSecond: 1000, // 1 second
};

// Contract Durations (in ticks)
export const CONTRACT_DURATIONS = {
  standard: 10,
  oneSecond: 5,
};

// Export types
export type RiskLevel = 'conservative' | 'moderate' | 'aggressive';
export type MarketCondition = 'normal' | 'volatile' | 'trending' | 'ranging';
export type AnalysisMode = 'realtime' | 'backtest' | 'simulation';