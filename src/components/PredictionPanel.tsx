import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { DigitPrediction, BandPrediction } from '@/types/deriv';
import { Target, TrendingUp, TrendingDown, Zap, AlertTriangle } from 'lucide-react';

interface PredictionPanelProps {
  digitPredictions: DigitPrediction[];
  bandPrediction?: BandPrediction;
  isActive: boolean;
  threshold: number;
  onGenerateSignal: () => void;
}

export function PredictionPanel({
  digitPredictions,
  bandPrediction,
  isActive,
  threshold,
  onGenerateSignal,
}: PredictionPanelProps) {
  const topDigitPrediction = digitPredictions
    .sort((a, b) => b.probability - a.probability)[0];
  
  const hasHighConfidencePrediction = topDigitPrediction?.probability >= threshold;
  const hasHighConfidenceBand = bandPrediction && 
    (bandPrediction.over2 >= threshold || bandPrediction.under7 >= threshold);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Predictions</h2>
        {isActive && (
          <Badge variant="secondary" className="animate-pulse">
            <Zap className="w-3 h-3 mr-1" />
            Active
          </Badge>
        )}
      </div>

      {/* Over/Under Predictions */}
      <Card className="p-4 mb-4 bg-background-elevated border-border">
        <h3 className="text-sm font-semibold text-foreground-muted mb-3 flex items-center">
          <Target className="w-4 h-4 mr-1" />
          Over/Under Predictions
        </h3>
        {bandPrediction ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-success" />
                <span className="text-sm font-medium">Over 2</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-foreground">
                  {(bandPrediction.over2 * 100).toFixed(1)}%
                </div>
                <Progress 
                  value={bandPrediction.over2 * 100} 
                  className="w-20 h-2"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-destructive" />
                <span className="text-sm font-medium">Under 7</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-foreground">
                  {(bandPrediction.under7 * 100).toFixed(1)}%
                </div>
                <Progress 
                  value={bandPrediction.under7 * 100} 
                  className="w-20 h-2"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-foreground-muted">
            <AlertTriangle className="w-6 h-6 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Waiting for analysis data...</p>
          </div>
        )}
      </Card>

      {/* Digit Predictions */}
      <Card className="flex-1 p-4 bg-background-elevated border-border">
        <h3 className="text-sm font-semibold text-foreground-muted mb-3">
          Exact Digit Probabilities
        </h3>
        {digitPredictions.length > 0 ? (
          <div className="space-y-2">
            {digitPredictions
              .sort((a, b) => b.probability - a.probability)
              .map((prediction) => (
              <div key={prediction.digit} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                    prediction.probability >= threshold
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background-surface text-foreground-muted'
                  }`}>
                    {prediction.digit}
                  </div>
                  <Progress 
                    value={prediction.probability * 100} 
                    className="flex-1 h-2"
                  />
                </div>
                <div className="text-sm font-medium text-foreground ml-2 min-w-[3rem] text-right">
                  {(prediction.probability * 100).toFixed(1)}%
                </div>
              </div>
            ))}
            
            {/* Threshold Line */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-dashed border-primary/50" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background-elevated px-2 text-primary">
                  {(threshold * 100).toFixed(0)}% threshold
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-foreground-muted">
            <div className="text-center">
              <Target className="w-6 h-6 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No predictions available</p>
            </div>
          </div>
        )}
      </Card>

      {/* Signal Generation */}
      {isActive && (
        <div className="mt-4 pt-4 border-t border-border">
          <Button
            onClick={onGenerateSignal}
            disabled={!hasHighConfidencePrediction && !hasHighConfidenceBand}
            className={`w-full ${
              hasHighConfidencePrediction || hasHighConfidenceBand
                ? 'bg-gradient-success hover:bg-gradient-success/90 shadow-success animate-pulse-glow'
                : ''
            }`}
          >
            <Zap className="w-4 h-4 mr-2" />
            {hasHighConfidencePrediction || hasHighConfidenceBand
              ? 'Generate Signal'
              : 'Waiting for High Confidence'
            }
          </Button>
          
          {topDigitPrediction && (
            <div className="mt-2 text-center">
              <div className="text-xs text-foreground-muted">
                Top prediction: Digit {topDigitPrediction.digit} at {(topDigitPrediction.probability * 100).toFixed(1)}%
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}