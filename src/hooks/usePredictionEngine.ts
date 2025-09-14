import { useState, useEffect, useCallback, useRef } from 'react';
import { DerivTick, DigitPrediction, BandPrediction, TradingSignal, PredictionFeatures, RiskSettings, VolatilityIndex } from '@/types/deriv';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';

export function usePredictionEngine(
  symbol: VolatilityIndex,
  ticks: DerivTick[],
  riskSettings: RiskSettings,
  isActiveTrading: boolean = true // Add parameter to control signal generation
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

  // Enhanced digit prediction using multiple analysis methods
  const predictDigit = useCallback((features: PredictionFeatures): DigitPrediction[] => {
    const predictions: DigitPrediction[] = [];
    
    for (let digit = 0; digit <= 9; digit++) {
      // 1. Frequency-based analysis (historical patterns)
      const frequencyWeight = 0.4;
      const baseProb = features.digitHistogram[digit.toString()] || 0.1;
      
      // 2. Trend analysis (momentum-based)
      const trendWeight = 0.3;
      const recentDeltas = features.lastDeltas.slice(-3);
      const trendDirection = recentDeltas.reduce((sum, delta) => sum + delta, 0);
      const trendAdjustment = Math.tanh(trendDirection / features.std) * 0.1;
      
      // 3. Volatility analysis (market conditions)
      const volatilityWeight = 0.2;
      const volatilityFactor = Math.min(features.volatility * 10, 1);
      const volatilityAdjustment = volatilityFactor * (Math.random() - 0.5) * 0.15;
      
      // 4. Mean reversion analysis
      const meanReversionWeight = 0.1;
      const currentPrice = features.mean;
      const priceDeviation = Math.abs(currentPrice - features.mean) / features.std;
      const meanReversionAdjustment = priceDeviation > 2 ? 
        (digit < 5 ? 0.1 : -0.1) : 0;
      
      // 5. Spike detection (extreme events)
      const spikeAdjustment = features.spikeIndicator ? 
        (digit === 0 || digit === 9 ? 0.2 : -0.1) : 0;
      
      // Combine all factors
      let probability = baseProb * frequencyWeight +
                      (baseProb + trendAdjustment) * trendWeight +
                      (baseProb + volatilityAdjustment) * volatilityWeight +
                      (baseProb + meanReversionAdjustment) * meanReversionWeight +
                      spikeAdjustment;
      
      // Ensure probability is within bounds
      probability = Math.min(Math.max(probability, 0.01), 0.9);
      
      // Add model uncertainty
      const uncertainty = 0.1 + Math.random() * 0.2;
      probability *= (1 - uncertainty);
      
      // Calculate confidence based on data quality
      const confidence = Math.min(
        (features.std > 0 ? 1 - (features.volatility / 0.05) : 0.5) + 
        (features.signChanges < 5 ? 0.2 : 0) +
        (features.spikeIndicator ? 0.1 : 0),
        1.0
      );
      
      predictions.push({ digit, probability, confidence });
    }

    // Normalize probabilities to sum to 1
    const total = predictions.reduce((sum, p) => sum + p.probability, 0);
    return predictions.map(p => ({
      ...p,
      probability: p.probability / total
    }));
  }, []);

  // Enhanced Over/Under band prediction
  const predictBand = useCallback((features: PredictionFeatures): BandPrediction => {
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

    // Trend analysis for bands
    const recentTrend = features.lastDeltas.slice(-3).reduce((sum, delta) => sum + delta, 0);
    const trendStrength = Math.abs(recentTrend) / features.std;
    const trendDirection = Math.sign(recentTrend);
    
    // Volatility analysis
    const volatilityFactor = Math.min(features.volatility * 20, 1);
    const volatilityBoost = volatilityFactor * 0.15;
    
    // Mean reversion analysis
    const priceDeviation = Math.abs(features.mean - features.mean) / features.std;
    const meanReversionBoost = priceDeviation > 1.5 ? 0.1 : 0;
    
    // Spike analysis
    const spikeBoost = features.spikeIndicator ? 0.2 : 0;
    
    // Apply adjustments
    let over2Prob = over2BaseProb;
    let under7Prob = under7BaseProb;
    
    // Trend-based adjustments
    if (trendDirection > 0 && trendStrength > 0.5) {
      over2Prob += 0.1;
      under7Prob -= 0.05;
    } else if (trendDirection < 0 && trendStrength > 0.5) {
      over2Prob -= 0.05;
      under7Prob += 0.1;
    }
    
    // Volatility adjustments
    over2Prob += volatilityBoost;
    under7Prob += volatilityBoost;
    
    // Mean reversion adjustments
    over2Prob += meanReversionBoost;
    under7Prob += meanReversionBoost;
    
    // Spike adjustments
    over2Prob += spikeBoost;
    under7Prob += spikeBoost;
    
    // Ensure probabilities are within bounds
    over2Prob = Math.min(Math.max(over2Prob, 0.1), 0.9);
    under7Prob = Math.min(Math.max(under7Prob, 0.1), 0.9);
    
    // Calculate confidence based on data quality and consistency
    const confidence = Math.min(
      0.5 + // Base confidence
      (features.signChanges < 3 ? 0.2 : 0) + // Low volatility bonus
      (features.spikeIndicator ? 0.1 : 0) + // Spike detection bonus
      (Math.abs(over2Prob - under7Prob) > 0.1 ? 0.2 : 0), // Clear preference bonus
      1.0
    );

    return {
      over2: over2Prob,
      under7: under7Prob,
      confidence,
    };
  }, []);

  // Multi-run analysis logic with error handling
  const performAnalysis = useCallback(() => {
    try {
      console.log('🔍 Starting analysis run for', symbol, 'with', ticks.length, 'ticks');
      
      if (ticks.length < 10) {
        console.log('❌ Not enough ticks for analysis:', ticks.length);
        return;
      }

      const currentFeatures = extractFeatures(ticks);
      if (!currentFeatures) {
        console.log('❌ Failed to extract features from ticks');
        toast({
          title: "Analysis Error",
          description: "Failed to extract features from tick data",
          variant: "destructive",
        });
        return;
      }

      console.log('✅ Features extracted:', currentFeatures);
      setFeatures(currentFeatures);
      setIsAnalyzing(true);

      // Generate predictions
      const digitPreds = predictDigit(currentFeatures);
      const bandPred = predictBand(currentFeatures);

      console.log('🎲 Generated digit predictions:', digitPreds);
      console.log('📊 Generated band predictions:', bandPred);

      setDigitPredictions(digitPreds);
      setBandPrediction(bandPred);

      // Multi-run logic: evaluate every 2.5s up to 4 runs
      runCountRef.current += 1;
      console.log('📈 Analysis run', runCountRef.current, 'of 4');
      
      const topDigit = digitPreds.sort((a, b) => b.probability - a.probability)[0];
      const topBand = bandPred.over2 > bandPred.under7 ? 'over2' : 'under7';
      
      runResultsRef.current.push({
        digit: topDigit.digit,
        band: topDigit.probability >= riskSettings.probabilityThreshold ? 'none' : topBand,
      });

      console.log('🏆 Top digit prediction:', topDigit.digit, 'with probability:', topDigit.probability);
      console.log('📊 Top band prediction:', topBand, 'threshold:', riskSettings.probabilityThreshold);

      // After 4 runs or timeout, evaluate consensus
      if (runCountRef.current >= 4) {
        console.log('🎯 Evaluating consensus after 4 runs');
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

        console.log('🗳️ Digit consensus:', digitConsensus, 'votes:', digitVoteCount, 'required:', riskSettings.requiredRuns);
        console.log('🗳️ Band consensus:', bandConsensus, 'votes:', bandVoteCount, 'required:', riskSettings.requiredRuns);

        // Only generate signals if actively trading
        if (isActiveTrading) {
          if (digitVoteCount >= riskSettings.requiredRuns && topDigit.probability >= riskSettings.probabilityThreshold) {
            console.log('🎯 Generating exact digit signal!');
            generateSignal('exact_digit', digitConsensus, undefined, topDigit.confidence, runCountRef.current);
          } else if (bandConsensus && bandVoteCount >= riskSettings.requiredRuns && bandPred.confidence >= riskSettings.probabilityThreshold) {
            console.log('🎯 Generating over/under signal!');
            generateSignal('over_under', undefined, bandConsensus, bandPred.confidence, runCountRef.current);
          } else {
            console.log('⏳ No signal generated - consensus or confidence requirements not met');
          }
        } else {
          console.log('📊 Analysis complete but not generating signals - trading not active');
        }

        // Reset for next cycle
        runCountRef.current = 0;
        runResultsRef.current = [];
        setIsAnalyzing(false);
        console.log('🔄 Analysis cycle complete, resetting for next cycle');
      }
      
    } catch (error) {
      console.error('❌ Analysis error:', error);
      setIsAnalyzing(false);
      toast({
        title: "Analysis Error",
        description: "An error occurred during analysis. Please try again.",
        variant: "destructive",
      });
    }
  }, [ticks, extractFeatures, predictDigit, predictBand, riskSettings, toast]);

  // Generate trading signal
  const generateSignal = useCallback((
    type: 'exact_digit' | 'over_under',
    predictedDigit?: number,
    predictedBand?: 'over2' | 'under7',
    confidence?: number,
    runs?: number
  ) => {
    console.log('🚀 Generating signal:', { type, predictedDigit, predictedBand, confidence, runs });
    
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

    console.log('📝 Created signal:', signal);
    setSignals(prev => [signal, ...prev].slice(0, 50)); // Keep last 50 signals

    toast({
      title: "Signal Generated",
      description: `${type === 'exact_digit' ? `Digit ${predictedDigit}` : predictedBand} - ${(confidence || 0.5 * 100).toFixed(1)}% confidence`,
    });

    console.log('✅ Signal added to history, total signals:', signals.length + 1);
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
    console.log('🎯 Prediction Engine - Ticks received:', ticks.length, 'for symbol:', symbol);
    
    if (ticks.length >= 10) {
      console.log('✅ Starting prediction analysis - sufficient ticks available');
      const interval = Number(import.meta.env.VITE_ANALYSIS_INTERVAL) || 2500;
      analysisIntervalRef.current = setInterval(performAnalysis, interval);
    } else {
      console.log('⏳ Waiting for more ticks - need 10, have:', ticks.length);
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