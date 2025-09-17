import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  DerivTick, 
  DigitPrediction, 
  BandPrediction, 
  TradingSignal, 
  PredictionFeatures, 
  RiskSettings, 
  VolatilityIndex,
  TenSecondPrediction,
  VolatilityAnalysis,
  RealtimeAnalysis
} from '@/types/deriv';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';

export function useAdvancedPredictionEngine(
  symbol: VolatilityIndex,
  ticks: DerivTick[],
  riskSettings: RiskSettings,
  isActiveTrading: boolean = true
) {
  const [digitPredictions, setDigitPredictions] = useState<DigitPrediction[]>([]);
  const [bandPrediction, setBandPrediction] = useState<BandPrediction>();
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [features, setFeatures] = useState<PredictionFeatures>();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // New enhanced features
  const [tenSecondPrediction, setTenSecondPrediction] = useState<TenSecondPrediction>();
  const [volatilityAnalysis, setVolatilityAnalysis] = useState<VolatilityAnalysis>();
  const [realtimeAnalysis, setRealtimeAnalysis] = useState<RealtimeAnalysis>();
  const [allVolatilityData, setAllVolatilityData] = useState<Record<VolatilityIndex, DerivTick[]>>({});

  const analysisIntervalRef = useRef<NodeJS.Timeout>();
  const tenSecondIntervalRef = useRef<NodeJS.Timeout>();
  const volatilityAnalysisRef = useRef<NodeJS.Timeout>();
  const runCountRef = useRef(0);
  const runResultsRef = useRef<Array<{ digit: number; band: 'over2' | 'under7' | 'none' }>>([]);
  const { toast } = useToast();

  // Enhanced feature extraction with advanced analytics
  const extractAdvancedFeatures = useCallback((tickData: DerivTick[]): PredictionFeatures | null => {
    if (tickData.length < 20) return null;

    const recentTicks = tickData.slice(-50); // Last 50 ticks for better analysis
    const prices = recentTicks.map(t => t.price);
    const digits = recentTicks.map(t => t.lastDigit);
    
    // Basic statistical features
    const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;
    const std = Math.sqrt(variance);
    
    // Price deltas and velocity
    const deltas = prices.slice(1).map((price, i) => price - prices[i]);
    const lastDeltas = deltas.slice(-10);
    const averageVelocity = deltas.reduce((sum, d) => sum + Math.abs(d), 0) / deltas.length;
    
    // Enhanced momentum and acceleration
    const priceAcceleration = deltas.length > 1 ? 
      deltas.slice(-3).reduce((sum, delta, i) => sum + (delta - (deltas[deltas.length - 4 + i] || 0)), 0) / 3 : 0;
    const momentum = deltas.slice(-5).reduce((sum, delta) => sum + delta, 0);
    
    // Trend strength calculation
    const trendStrength = Math.abs(momentum) / (std * Math.sqrt(5));
    
    // Sign changes (trend reversals)
    const signChanges = deltas.slice(1).reduce((count, delta, i) => {
      return count + (Math.sign(delta) !== Math.sign(deltas[i]) ? 1 : 0);
    }, 0);
    
    // Enhanced digit histogram with sequence analysis
    const digitHistogram: Record<string, number> = {};
    for (let i = 0; i <= 9; i++) {
      digitHistogram[i.toString()] = digits.filter(d => d === i).length / digits.length;
    }
    
    // Digit sequence patterns
    const digitSequences: number[] = [];
    for (let i = 1; i < digits.length; i++) {
      if (digits[i] === digits[i-1]) {
        digitSequences.push(digits[i]);
      }
    }
    
    // Volatility clusters detection
    const volatilityClusters: number[] = [];
    const clusterThreshold = std * 1.5;
    let currentCluster = 0;
    for (let i = 0; i < deltas.length; i++) {
      if (Math.abs(deltas[i]) > clusterThreshold) {
        currentCluster++;
      } else {
        if (currentCluster > 0) {
          volatilityClusters.push(currentCluster);
          currentCluster = 0;
        }
      }
    }
    
    // Market regime detection
    let marketRegime: 'trending' | 'ranging' | 'volatile' | 'calm';
    if (trendStrength > 0.7) {
      marketRegime = 'trending';
    } else if (signChanges > 8) {
      marketRegime = 'volatile';
    } else if (std / mean < 0.01) {
      marketRegime = 'calm';
    } else {
      marketRegime = 'ranging';
    }
    
    // Cross-volatility correlation (simplified for now)
    const crossVolatilityCorrelation: Record<string, number> = {};
    Object.keys(allVolatilityData).forEach(sym => {
      if (sym !== symbol && allVolatilityData[sym].length > 0) {
        const otherPrices = allVolatilityData[sym].slice(-20).map(t => t.price);
        const correlation = calculateCorrelation(prices.slice(-20), otherPrices);
        crossVolatilityCorrelation[sym] = correlation;
      }
    });
    
    // Volatility regime classification
    const volatilityRatio = std / mean;
    let volatilityRegime: 'low' | 'medium' | 'high' | 'extreme';
    if (volatilityRatio < 0.01) volatilityRegime = 'low';
    else if (volatilityRatio < 0.02) volatilityRegime = 'medium';
    else if (volatilityRatio < 0.05) volatilityRegime = 'high';
    else volatilityRegime = 'extreme';
    
    // Spike detection
    const spikeThreshold = std * 2.5;
    const spikeIndicator = Math.abs(deltas[deltas.length - 1] || 0) > spikeThreshold;
    
    // Volatility measure
    const volatility = std / mean;

    return {
      mean,
      std,
      lastDeltas,
      signChanges,
      digitHistogram,
      averageVelocity,
      spikeIndicator,
      volatility,
      // Enhanced features
      priceAcceleration,
      momentum,
      trendStrength,
      volatilityClusters,
      digitSequences,
      marketRegime,
      crossVolatilityCorrelation,
      volatilityRegime,
    };
  }, [symbol, allVolatilityData]);

  // Helper function to calculate correlation
  const calculateCorrelation = (x: number[], y: number[]): number => {
    if (x.length !== y.length || x.length === 0) return 0;
    
    const n = x.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
    const sumY2 = y.reduce((sum, val) => sum + val * val, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  };

  // Enhanced digit prediction with 10-second time horizon
  const predictDigitAdvanced = useCallback((features: PredictionFeatures): DigitPrediction[] => {
    const predictions: DigitPrediction[] = [];
    const timeHorizon = 10; // 10 seconds
    
    for (let digit = 0; digit <= 9; digit++) {
      // 1. Frequency-based analysis (historical patterns)
      const frequencyWeight = 0.3;
      const baseProb = features.digitHistogram[digit.toString()] || 0.1;
      
      // 2. Trend analysis with momentum
      const trendWeight = 0.25;
      const momentumFactor = Math.tanh(features.momentum / features.std) * 0.15;
      const trendAdjustment = momentumFactor * (digit > 4 ? 1 : -1);
      
      // 3. Volatility analysis with regime awareness
      const volatilityWeight = 0.2;
      const volatilityMultiplier = {
        'low': 0.5,
        'medium': 1.0,
        'high': 1.5,
        'extreme': 2.0
      }[features.volatilityRegime] || 1.0;
      const volatilityAdjustment = (Math.random() - 0.5) * 0.1 * volatilityMultiplier;
      
      // 4. Market regime analysis
      const regimeWeight = 0.15;
      let regimeAdjustment = 0;
      if (features.marketRegime === 'trending') {
        regimeAdjustment = features.trendStrength * 0.1 * (digit > 4 ? 1 : -1);
      } else if (features.marketRegime === 'volatile') {
        regimeAdjustment = (Math.random() - 0.5) * 0.2;
      } else if (features.marketRegime === 'calm') {
        regimeAdjustment = -0.05; // Slight bias towards middle digits
      }
      
      // 5. Sequence pattern analysis
      const sequenceWeight = 0.1;
      const sequenceAdjustment = features.digitSequences.includes(digit) ? 0.1 : 0;
      
      // Combine all factors
      let probability = baseProb * frequencyWeight +
                      (baseProb + trendAdjustment) * trendWeight +
                      (baseProb + volatilityAdjustment) * volatilityWeight +
                      (baseProb + regimeAdjustment) * regimeWeight +
                      (baseProb + sequenceAdjustment) * sequenceWeight;
      
      // Ensure probability is within bounds
      probability = Math.min(Math.max(probability, 0.01), 0.9);
      
      // Calculate confidence based on multiple factors
      const confidence = Math.min(
        0.4 + // Base confidence
        (features.trendStrength > 0.5 ? 0.2 : 0) + // Strong trend bonus
        (features.volatilityRegime === 'low' ? 0.2 : 0) + // Low volatility bonus
        (features.marketRegime === 'trending' ? 0.1 : 0) + // Trending market bonus
        (features.spikeIndicator ? 0.1 : 0), // Spike detection bonus
        1.0
      );
      
      predictions.push({
        digit,
        probability,
        confidence,
        timeHorizon,
        volatilityImpact: volatilityAdjustment,
        trendAlignment: trendAdjustment,
        sequencePattern: features.digitSequences.includes(digit),
        marketRegimeAlignment: regimeAdjustment,
      });
    }

    // Normalize probabilities to sum to 1
    const total = predictions.reduce((sum, p) => sum + p.probability, 0);
    return predictions.map(p => ({
      ...p,
      probability: p.probability / total
    }));
  }, []);

  // Enhanced Over/Under band prediction with comprehensive analysis
  const predictBandAdvanced = useCallback((features: PredictionFeatures): BandPrediction => {
    // Over 2: digits 3,4,5,6,7,8,9
    const over2Digits = [3,4,5,6,7,8,9];
    const over2BaseProb = over2Digits.reduce((sum, digit) => 
      sum + (features.digitHistogram[digit.toString()] || 0.1), 0
    ) / over2Digits.length;

    // Under 7: digits 0,1,2,3,4,5,6
    const under7Digits = [0,1,2,3,4,5,6];
    const under7BaseProb = under7Digits.reduce((sum, digit) => 
      sum + (features.digitHistogram[digit.toString()] || 0.1), 0
    ) / under7Digits.length;

    // Enhanced over/under analysis for 0-8 vs 9-1
    const over0to8Digits = [0,1,2,3,4,5,6,7,8];
    const under9to1Digits = [9,1];
    const over2to9Digits = [2,3,4,5,6,7,8,9];
    const under0to7Digits = [0,1,2,3,4,5,6,7];

    const overUnderAnalysis = {
      over0to8: over0to8Digits.reduce((sum, digit) => 
        sum + (features.digitHistogram[digit.toString()] || 0.1), 0
      ) / over0to8Digits.length,
      under9to1: under9to1Digits.reduce((sum, digit) => 
        sum + (features.digitHistogram[digit.toString()] || 0.1), 0
      ) / under9to1Digits.length,
      over2to9: over2to9Digits.reduce((sum, digit) => 
        sum + (features.digitHistogram[digit.toString()] || 0.1), 0
      ) / over2to9Digits.length,
      under0to7: under0to7Digits.reduce((sum, digit) => 
        sum + (features.digitHistogram[digit.toString()] || 0.1), 0
      ) / under0to7Digits.length,
    };

    // Trend analysis for bands
    const recentTrend = features.lastDeltas.slice(-5).reduce((sum, delta) => sum + delta, 0);
    const trendStrength = Math.abs(recentTrend) / features.std;
    const trendDirection = Math.sign(recentTrend);
    
    // Volatility analysis with regime awareness
    const volatilityFactor = {
      'low': 0.5,
      'medium': 1.0,
      'high': 1.5,
      'extreme': 2.0
    }[features.volatilityRegime] || 1.0;
    const volatilityBoost = volatilityFactor * 0.1;
    
    // Market regime adjustments
    let regimeAdjustment = 0;
    if (features.marketRegime === 'trending') {
      regimeAdjustment = trendDirection > 0 ? 0.1 : -0.1;
    } else if (features.marketRegime === 'volatile') {
      regimeAdjustment = (Math.random() - 0.5) * 0.15;
    }
    
    // Apply adjustments
    let over2Prob = over2BaseProb + volatilityBoost + regimeAdjustment;
    let under7Prob = under7BaseProb + volatilityBoost - regimeAdjustment;
    
    // Ensure probabilities are within bounds
    over2Prob = Math.min(Math.max(over2Prob, 0.1), 0.9);
    under7Prob = Math.min(Math.max(under7Prob, 0.1), 0.9);
    
    // Calculate confidence based on data quality and consistency
    const confidence = Math.min(
      0.5 + // Base confidence
      (features.volatilityRegime === 'low' ? 0.2 : 0) + // Low volatility bonus
      (features.marketRegime === 'trending' ? 0.15 : 0) + // Trending market bonus
      (Math.abs(over2Prob - under7Prob) > 0.1 ? 0.15 : 0), // Clear preference bonus
      1.0
    );

    return {
      over2: over2Prob,
      under7: under7Prob,
      confidence,
      overUnderAnalysis,
      volatilityAdjusted: true,
      trendBased: features.marketRegime === 'trending',
    };
  }, []);

  // 10-Second Prediction Engine
  const generateTenSecondPrediction = useCallback((): TenSecondPrediction | null => {
    if (!features || ticks.length < 20) return null;

    const startTime = Date.now();
    const digitPreds = predictDigitAdvanced(features);
    const analysisTime = Date.now() - startTime;

    // Sort predictions by probability
    const sortedPredictions = digitPreds
      .map(pred => ({
        digit: pred.digit,
        probability: pred.probability,
        confidence: pred.confidence,
        volatilityImpact: pred.volatilityImpact,
        timeToExpiry: 10, // 10 seconds
      }))
      .sort((a, b) => b.probability - a.probability);

    const topPrediction = sortedPredictions[0];

    // Determine market conditions
    const marketConditions = {
      volatility: features.volatility,
      trend: features.momentum > 0 ? 'up' : features.momentum < 0 ? 'down' : 'sideways',
      regime: features.marketRegime,
    };

    return {
      id: uuidv4(),
      symbol,
      timestamp: Date.now(),
      predictions: sortedPredictions,
      topPrediction,
      marketConditions,
      analysisTime,
    };
  }, [features, ticks.length, predictDigitAdvanced, symbol]);

  // Comprehensive Volatility Analysis
  const generateVolatilityAnalysis = useCallback((): VolatilityAnalysis | null => {
    if (!features || Object.keys(allVolatilityData).length === 0) return null;

    const currentVolatility = features.volatility;
    const volatilityHistory = features.volatilityClusters;
    
    // Cross-correlations with other volatility indices
    const crossCorrelations: Record<VolatilityIndex, number> = {};
    Object.keys(allVolatilityData).forEach(sym => {
      if (sym !== symbol) {
        crossCorrelations[sym as VolatilityIndex] = features.crossVolatilityCorrelation[sym] || 0;
      }
    });

    // Volatility clusters analysis
    const volatilityClusters = features.volatilityClusters.map((intensity, index) => ({
      cluster: index + 1,
      startTime: Date.now() - (features.volatilityClusters.length - index) * 2000,
      endTime: Date.now() - (features.volatilityClusters.length - index - 1) * 2000,
      intensity,
    }));

    // Volatility forecast (simplified)
    const volatilityForecast = {
      next10Seconds: currentVolatility * (1 + (Math.random() - 0.5) * 0.2),
      next30Seconds: currentVolatility * (1 + (Math.random() - 0.5) * 0.3),
      next60Seconds: currentVolatility * (1 + (Math.random() - 0.5) * 0.4),
    };

    // Market impact analysis
    const digitBias: Record<string, number> = {};
    for (let i = 0; i <= 9; i++) {
      digitBias[i.toString()] = features.digitHistogram[i.toString()] || 0.1;
    }

    const marketImpact = {
      digitBias,
      trendStrength: features.trendStrength,
      reversalProbability: features.signChanges / 10, // Normalized reversal probability
    };

    return {
      symbol,
      timestamp: Date.now(),
      currentVolatility,
      volatilityHistory,
      volatilityRegime: features.volatilityRegime,
      crossCorrelations,
      volatilityClusters,
      volatilityForecast,
      marketImpact,
    };
  }, [features, allVolatilityData, symbol]);

  // Real-time Analysis Engine
  const generateRealtimeAnalysis = useCallback((): RealtimeAnalysis | null => {
    if (!features || ticks.length < 20) return null;

    const recentTicks = ticks.slice(-20);
    const prices = recentTicks.map(t => t.price);

    // Chart data
    const chartData = recentTicks.map(tick => ({
      price: tick.price,
      volume: 1, // Simplified volume
      timestamp: tick.timestamp,
    }));

    // Technical indicators (simplified calculations)
    const rsi = calculateRSI(prices);
    const macd = calculateMACD(prices);
    const bollinger = calculateBollingerBands(prices);
    const movingAverage = prices.reduce((sum, p) => sum + p, 0) / prices.length;

    const technicalIndicators = {
      rsi,
      macd,
      bollingerUpper: bollinger.upper,
      bollingerLower: bollinger.lower,
      movingAverage,
    };

    // Pattern recognition (simplified)
    const patterns: string[] = [];
    if (features.trendStrength > 0.7) patterns.push('Strong Trend');
    if (features.volatilityRegime === 'high') patterns.push('High Volatility');
    if (features.spikeIndicator) patterns.push('Price Spike');
    if (features.marketRegime === 'ranging') patterns.push('Range Bound');

    const patternRecognition = {
      patterns,
      confidence: features.confidence || 0.5,
      nextMove: features.momentum > 0 ? 'up' : features.momentum < 0 ? 'down' : 'sideways',
    };

    // Automated signals
    const automatedSignals = [];
    if (features.trendStrength > 0.6) {
      automatedSignals.push({
        type: features.momentum > 0 ? 'buy' : 'sell',
        strength: features.trendStrength,
        timeframe: 10,
        reasoning: `Strong ${features.momentum > 0 ? 'upward' : 'downward'} trend detected`,
      });
    }

    return {
      symbol,
      timestamp: Date.now(),
      chartData,
      technicalIndicators,
      patternRecognition,
      automatedSignals,
    };
  }, [features, ticks]);

  // Helper functions for technical indicators
  const calculateRSI = (prices: number[]): number => {
    if (prices.length < 14) return 50;
    
    const gains = [];
    const losses = [];
    
    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }
    
    const avgGain = gains.slice(-14).reduce((sum, gain) => sum + gain, 0) / 14;
    const avgLoss = losses.slice(-14).reduce((sum, loss) => sum + loss, 0) / 14;
    
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  };

  const calculateMACD = (prices: number[]): number => {
    if (prices.length < 26) return 0;
    
    const ema12 = calculateEMA(prices, 12);
    const ema26 = calculateEMA(prices, 26);
    return ema12 - ema26;
  };

  const calculateEMA = (prices: number[], period: number): number => {
    const multiplier = 2 / (period + 1);
    let ema = prices[0];
    
    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
    }
    
    return ema;
  };

  const calculateBollingerBands = (prices: number[]): { upper: number; lower: number } => {
    if (prices.length < 20) return { upper: 0, lower: 0 };
    
    const sma = prices.slice(-20).reduce((sum, p) => sum + p, 0) / 20;
    const variance = prices.slice(-20).reduce((sum, p) => sum + Math.pow(p - sma, 2), 0) / 20;
    const std = Math.sqrt(variance);
    
    return {
      upper: sma + (2 * std),
      lower: sma - (2 * std),
    };
  };

  // Main analysis function
  const performAdvancedAnalysis = useCallback(() => {
    try {
      console.log('🔍 Starting advanced analysis for', symbol, 'with', ticks.length, 'ticks');
      
      if (ticks.length < 20) {
        console.log('❌ Not enough ticks for advanced analysis:', ticks.length);
        return;
      }

      const currentFeatures = extractAdvancedFeatures(ticks);
      if (!currentFeatures) {
        console.log('❌ Failed to extract advanced features from ticks');
        return;
      }

      console.log('✅ Advanced features extracted:', currentFeatures);
      setFeatures(currentFeatures);
      setIsAnalyzing(true);

      // Generate all types of predictions
      const digitPreds = predictDigitAdvanced(currentFeatures);
      const bandPred = predictBandAdvanced(currentFeatures);
      const tenSecPred = generateTenSecondPrediction();
      const volAnalysis = generateVolatilityAnalysis();
      const realtimeAnalysis = generateRealtimeAnalysis();

      console.log('🎲 Generated advanced predictions');
      setDigitPredictions(digitPreds);
      setBandPrediction(bandPred);
      setTenSecondPrediction(tenSecPred);
      setVolatilityAnalysis(volAnalysis);
      setRealtimeAnalysis(realtimeAnalysis);

      // Generate signals if actively trading
      if (isActiveTrading && tenSecPred) {
        const topDigit = tenSecPred.topPrediction;
        if (topDigit.probability >= riskSettings.probabilityThreshold && topDigit.confidence >= 0.6) {
          generateAdvancedSignal('exact_digit', topDigit.digit, undefined, topDigit.confidence, 1);
        } else if (bandPred && bandPred.confidence >= riskSettings.probabilityThreshold) {
          const topBand = bandPred.over2 > bandPred.under7 ? 'over2' : 'under7';
          generateAdvancedSignal('over_under', undefined, topBand, bandPred.confidence, 1);
        }
      }

      setIsAnalyzing(false);
      
    } catch (error) {
      console.error('❌ Advanced analysis error:', error);
      setIsAnalyzing(false);
      toast({
        title: "Analysis Error",
        description: "An error occurred during advanced analysis. Please try again.",
        variant: "destructive",
      });
    }
  }, [ticks, extractAdvancedFeatures, predictDigitAdvanced, predictBandAdvanced, 
      generateTenSecondPrediction, generateVolatilityAnalysis, generateRealtimeAnalysis,
      isActiveTrading, riskSettings, toast]);

  // Generate advanced trading signal
  const generateAdvancedSignal = useCallback((
    type: 'exact_digit' | 'over_under',
    predictedDigit?: number,
    predictedBand?: 'over2' | 'under7',
    confidence?: number,
    runs?: number
  ) => {
    console.log('🚀 Generating advanced signal:', { type, predictedDigit, predictedBand, confidence, runs });
    
    if (!features) {
      console.log('❌ Cannot generate signal - no features available');
      return;
    }

    const signal: TradingSignal = {
      id: uuidv4(),
      symbol,
      timestamp: Date.now(),
      type,
      predicted_digit: predictedDigit,
      predicted_band: predictedBand,
      confidence: confidence || 0.5,
      runs: runs || 1,
      status: 'pending',
      features,
    };

    console.log('📝 Created advanced signal:', signal);
    setSignals(prev => [signal, ...prev].slice(0, 50));

    toast({
      title: "Advanced Signal Generated",
      description: `${type === 'exact_digit' ? `Digit ${predictedDigit}` : predictedBand} - ${((confidence || 0.5) * 100).toFixed(1)}% confidence`,
    });

    return signal.id;
  }, [symbol, features, toast]);

  // Export XML for Binary Bot
  const exportXML = useCallback((signalId: string) => {
    const signal = signals.find(s => s.id === signalId);
    if (!signal) return;

    const xmlTemplate = `<?xml version="1.0" encoding="UTF-8"?>
<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="trade" id="1" deletable="false" movable="false">
    <field name="MARKET">synthetic_index</field>
    <field name="SUBMARKET">random_indices</field>
    <field name="SYMBOL">${signal.symbol}</field>
    <field name="TRADETYPE">${signal.type === 'exact_digit' ? 'digit_match' : signal.predicted_band === 'over2' ? 'digit_over' : 'digit_under'}</field>
    <field name="TYPE">${signal.type === 'exact_digit' ? signal.predicted_digit : signal.predicted_band === 'over2' ? '2' : '7'}</field>
    <field name="AMOUNT">${riskSettings.stake}</field>
    <field name="DURATION">${symbol.includes('1S') ? '5' : '10'}</field>
    <field name="DURATIONTYPE">t</field>
    <field name="CURRENCY">USD</field>
  </block>
</xml>`;

    const blob = new Blob([xmlTemplate], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `advanced_prediction_${signal.symbol}_${signal.id.slice(0, 8)}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "XML Exported",
      description: "Advanced prediction XML file downloaded successfully",
    });
  }, [signals, riskSettings.stake, symbol, toast]);

  // Update all volatility data when ticks change
  useEffect(() => {
    if (ticks.length > 0) {
      setAllVolatilityData(prev => ({
        ...prev,
        [symbol]: ticks
      }));
    }
  }, [ticks, symbol]);

  // Start analysis when ticks are available
  useEffect(() => {
    console.log('🎯 Advanced Prediction Engine - Ticks received:', ticks.length, 'for symbol:', symbol);
    
    if (ticks.length >= 20) {
      console.log('✅ Starting advanced prediction analysis');
      const interval = 2000; // 2 seconds for advanced analysis
      analysisIntervalRef.current = setInterval(performAdvancedAnalysis, interval);
    }

    return () => {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }
    };
  }, [ticks.length, performAdvancedAnalysis]);

  // 10-second prediction interval
  useEffect(() => {
    if (ticks.length >= 20) {
      tenSecondIntervalRef.current = setInterval(() => {
        const prediction = generateTenSecondPrediction();
        if (prediction) {
          setTenSecondPrediction(prediction);
        }
      }, 10000); // Every 10 seconds
    }

    return () => {
      if (tenSecondIntervalRef.current) {
        clearInterval(tenSecondIntervalRef.current);
      }
    };
  }, [ticks.length, generateTenSecondPrediction]);

  // Volatility analysis interval
  useEffect(() => {
    if (Object.keys(allVolatilityData).length > 0) {
      volatilityAnalysisRef.current = setInterval(() => {
        const analysis = generateVolatilityAnalysis();
        if (analysis) {
          setVolatilityAnalysis(analysis);
        }
      }, 5000); // Every 5 seconds
    }

    return () => {
      if (volatilityAnalysisRef.current) {
        clearInterval(volatilityAnalysisRef.current);
      }
    };
  }, [allVolatilityData, generateVolatilityAnalysis]);

  const manualGenerateSignal = useCallback(() => {
    if (digitPredictions.length === 0) return;
    
    const topDigit = digitPredictions.sort((a, b) => b.probability - a.probability)[0];
    const topBand = bandPrediction && bandPrediction.over2 > bandPrediction.under7 ? 'over2' : 'under7';
    
    if (topDigit.probability >= riskSettings.probabilityThreshold) {
      generateAdvancedSignal('exact_digit', topDigit.digit, undefined, topDigit.confidence, 1);
    } else if (bandPrediction && bandPrediction.confidence >= riskSettings.probabilityThreshold) {
      generateAdvancedSignal('over_under', undefined, topBand, bandPrediction.confidence, 1);
    }
  }, [digitPredictions, bandPrediction, riskSettings.probabilityThreshold, generateAdvancedSignal]);

  return {
    // Original features
    digitPredictions,
    bandPrediction,
    signals,
    features,
    isAnalyzing,
    generateSignal: manualGenerateSignal,
    exportXML,
    
    // New advanced features
    tenSecondPrediction,
    volatilityAnalysis,
    realtimeAnalysis,
    allVolatilityData,
  };
}