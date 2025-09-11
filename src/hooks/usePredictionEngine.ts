import { useState, useEffect, useCallback, useRef } from 'react';
import { DerivTick, DigitPrediction, BandPrediction, TradingSignal, PredictionFeatures, RiskSettings, VolatilityIndex } from '@/types/deriv';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';

export function usePredictionEngine(
  symbol: VolatilityIndex,
  ticks: DerivTick[],
  riskSettings: RiskSettings
) {
  const [digitPredictions, setDigitPredictions] = useState<DigitPrediction[]>([]);
  const [bandPrediction, setBandPrediction] = useState<BandPrediction>();
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [features, setFeatures] = useState<PredictionFeatures>();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analysisIntervalRef = useRef<NodeJS.Timeout>();
  const runCountRef = useRef(0);
  const runResultsRef = useRef<Array<{ digit: number; band: 'over2' | 'under7' | 'none' }>>([]);
  const { toast } = useToast();

  // Extract features from tick data
  const extractFeatures = useCallback((tickData: DerivTick[]): PredictionFeatures | null => {
    if (tickData.length < 10) return null;

    const recentTicks = tickData.slice(-30); // Last 30 ticks (10 seconds at ~3 ticks/sec)
    const prices = recentTicks.map(t => t.price);
    
    // Basic statistical features
    const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;
    const std = Math.sqrt(variance);
    
    // Price deltas and velocity
    const deltas = prices.slice(1).map((price, i) => price - prices[i]);
    const lastDeltas = deltas.slice(-5);
    const averageVelocity = deltas.reduce((sum, d) => sum + Math.abs(d), 0) / deltas.length;
    
    // Sign changes (trend reversals)
    const signChanges = deltas.slice(1).reduce((count, delta, i) => {
      return count + (Math.sign(delta) !== Math.sign(deltas[i]) ? 1 : 0);
    }, 0);
    
    // Last digit histogram
    const digits = recentTicks.map(t => t.lastDigit);
    const digitHistogram: Record<string, number> = {};
    for (let i = 0; i <= 9; i++) {
      digitHistogram[i.toString()] = digits.filter(d => d === i).length / digits.length;
    }
    
    // Spike detection
    const spikeThreshold = std * 2;
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
    };
  }, []);

  // Predict digit probabilities using simple heuristic model
  const predictDigit = useCallback((features: PredictionFeatures): DigitPrediction[] => {
    const predictions: DigitPrediction[] = [];
    
    for (let digit = 0; digit <= 9; digit++) {
      // Simple frequency-based prediction with volatility adjustment
      const baseProb = features.digitHistogram[digit.toString()] || 0.1;
      
      // Adjust based on recent trends
      const trendAdjustment = features.averageVelocity > features.std ? 0.05 : -0.05;
      const volatilityAdjustment = features.volatility > 0.02 ? 0.1 : 0;
      
      // Special logic for extreme digits (0, 9) during high volatility
      const extremeAdjustment = (digit === 0 || digit === 9) && features.spikeIndicator ? 0.15 : 0;
      
      let probability = Math.min(Math.max(
        baseProb + trendAdjustment + volatilityAdjustment + extremeAdjustment,
        0.01
      ), 0.9);

      // Add some randomness to simulate model uncertainty
      probability *= (0.8 + Math.random() * 0.4);

      const confidence = Math.min(probability * 1.2, 1.0);
      
      predictions.push({ digit, probability, confidence });
    }

    // Normalize probabilities
    const total = predictions.reduce((sum, p) => sum + p.probability, 0);
    return predictions.map(p => ({
      ...p,
      probability: p.probability / total
    }));
  }, []);

  // Predict Over/Under bands
  const predictBand = useCallback((features: PredictionFeatures): BandPrediction => {
    // Over 2: digits 3,4,5,6,7,8,9
    const over2Digits = [3,4,5,6,7,8,9];
    const over2Prob = over2Digits.reduce((sum, digit) => 
      sum + (features.digitHistogram[digit.toString()] || 0.1), 0
    ) / over2Digits.length;

    // Under 7: digits 0,1,2,3,4,5,6
    const under7Digits = [0,1,2,3,4,5,6];
    const under7Prob = under7Digits.reduce((sum, digit) => 
      sum + (features.digitHistogram[digit.toString()] || 0.1), 0
    ) / under7Digits.length;

    // Adjust based on volatility and trends
    const volatilityBoost = features.volatility > 0.015 ? 0.1 : 0;
    const trendBoost = features.signChanges > 3 ? 0.05 : 0;

    const adjustedOver2 = Math.min(over2Prob + volatilityBoost + trendBoost, 0.9);
    const adjustedUnder7 = Math.min(under7Prob + volatilityBoost + trendBoost, 0.9);

    return {
      over2: adjustedOver2,
      under7: adjustedUnder7,
      confidence: Math.max(adjustedOver2, adjustedUnder7),
    };
  }, []);

  // Multi-run analysis logic
  const performAnalysis = useCallback(() => {
    if (ticks.length < 10) return;

    const currentFeatures = extractFeatures(ticks);
    if (!currentFeatures) return;

    setFeatures(currentFeatures);
    setIsAnalyzing(true);

    // Generate predictions
    const digitPreds = predictDigit(currentFeatures);
    const bandPred = predictBand(currentFeatures);

    setDigitPredictions(digitPreds);
    setBandPrediction(bandPred);

    // Multi-run logic: evaluate every 2.5s up to 4 runs
    runCountRef.current += 1;
    
    const topDigit = digitPreds.sort((a, b) => b.probability - a.probability)[0];
    const topBand = bandPred.over2 > bandPred.under7 ? 'over2' : 'under7';
    
    runResultsRef.current.push({
      digit: topDigit.digit,
      band: topDigit.probability >= riskSettings.probabilityThreshold ? 'none' : topBand,
    });

    // After 4 runs or timeout, evaluate consensus
    if (runCountRef.current >= 4) {
      const digitVotes: Record<number, number> = {};
      const bandVotes: Record<string, number> = {};

      runResultsRef.current.forEach(result => {
        digitVotes[result.digit] = (digitVotes[result.digit] || 0) + 1;
        bandVotes[result.band] = (bandVotes[result.band] || 0) + 1;
      });

      const consensusDigit = Object.entries(digitVotes)
        .sort(([,a], [,b]) => b - a)[0];
      
      const consensusBand = Object.entries(bandVotes)
        .sort(([,a], [,b]) => b - a)[0];

      // Check if consensus meets requirements
      const digitConsensus = consensusDigit && parseInt(consensusDigit[0]);
      const digitVoteCount = consensusDigit ? consensusDigit[1] : 0;
      const bandConsensus = consensusBand && consensusBand[0] !== 'none' ? consensusBand[0] as 'over2' | 'under7' : null;
      const bandVoteCount = consensusBand ? consensusBand[1] : 0;

      if (digitVoteCount >= riskSettings.requiredRuns && topDigit.probability >= riskSettings.probabilityThreshold) {
        // Generate exact digit signal
        generateSignal('exact_digit', digitConsensus, undefined, topDigit.confidence, runCountRef.current);
      } else if (bandConsensus && bandVoteCount >= riskSettings.requiredRuns && bandPred.confidence >= riskSettings.probabilityThreshold) {
        // Generate over/under signal
        generateSignal('over_under', undefined, bandConsensus, bandPred.confidence, runCountRef.current);
      }

      // Reset for next cycle
      runCountRef.current = 0;
      runResultsRef.current = [];
      setIsAnalyzing(false);
    }
  }, [ticks, extractFeatures, predictDigit, predictBand, riskSettings]);

  // Generate trading signal
  const generateSignal = useCallback((
    type: 'exact_digit' | 'over_under',
    predictedDigit?: number,
    predictedBand?: 'over2' | 'under7',
    confidence?: number,
    runs?: number
  ) => {
    if (!features) return;

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

    setSignals(prev => [signal, ...prev].slice(0, 50)); // Keep last 50 signals

    toast({
      title: "Signal Generated",
      description: `${type === 'exact_digit' ? `Digit ${predictedDigit}` : predictedBand} - ${(confidence || 0.5 * 100).toFixed(1)}% confidence`,
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
    a.download = `accelerator_zone_${signal.symbol}_${signal.id.slice(0, 8)}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "XML Exported",
      description: "Binary Bot XML file downloaded successfully",
    });
  }, [signals, riskSettings.stake, symbol, toast]);

  // Start analysis when ticks are available
  useEffect(() => {
    if (ticks.length >= 10) {
      analysisIntervalRef.current = setInterval(performAnalysis, 2500); // Every 2.5 seconds
    }

    return () => {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }
    };
  }, [ticks.length, performAnalysis]);

  const manualGenerateSignal = useCallback(() => {
    if (digitPredictions.length === 0) return;
    
    const topDigit = digitPredictions.sort((a, b) => b.probability - a.probability)[0];
    const topBand = bandPrediction && bandPrediction.over2 > bandPrediction.under7 ? 'over2' : 'under7';
    
    if (topDigit.probability >= riskSettings.probabilityThreshold) {
      generateSignal('exact_digit', topDigit.digit, undefined, topDigit.confidence, 1);
    } else if (bandPrediction && bandPrediction.confidence >= riskSettings.probabilityThreshold) {
      generateSignal('over_under', undefined, topBand, bandPrediction.confidence, 1);
    }
  }, [digitPredictions, bandPrediction, riskSettings.probabilityThreshold, generateSignal]);

  return {
    digitPredictions,
    bandPrediction,
    signals,
    features,
    isAnalyzing,
    generateSignal: manualGenerateSignal,
    exportXML,
  };
}