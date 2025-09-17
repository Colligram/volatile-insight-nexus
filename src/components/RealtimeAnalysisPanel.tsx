import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RealtimeAnalysis } from '@/types/deriv';
import { LineChart, TrendingUp, TrendingDown, Activity, Target, Zap } from 'lucide-react';

interface RealtimeAnalysisPanelProps {
  analysis: RealtimeAnalysis | undefined;
  isAnalyzing: boolean;
}

export function RealtimeAnalysisPanel({ analysis, isAnalyzing }: RealtimeAnalysisPanelProps) {
  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Real-time Analysis
          </CardTitle>
          <CardDescription>
            Live market analysis with technical indicators and automated signals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            {isAnalyzing ? (
              <div className="flex items-center justify-center gap-2">
                <Activity className="h-4 w-4 animate-pulse" />
                Analyzing real-time data...
              </div>
            ) : (
              'Waiting for real-time data...'
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const signalColors = {
    buy: 'bg-green-100 text-green-800',
    sell: 'bg-red-100 text-red-800',
    hold: 'bg-gray-100 text-gray-800',
  };

  const getRSIColor = (rsi: number) => {
    if (rsi > 70) return 'text-red-600';
    if (rsi < 30) return 'text-green-600';
    return 'text-gray-600';
  };

  const getMACDColor = (macd: number) => {
    return macd > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LineChart className="h-5 w-5" />
          Real-time Analysis
        </CardTitle>
        <CardDescription>
          Live technical analysis with {analysis.chartData.length} data points
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Technical Indicators */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Technical Indicators
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="text-sm font-medium">RSI</div>
                <div className={`text-lg font-semibold ${getRSIColor(analysis.technicalIndicators.rsi)}`}>
                  {analysis.technicalIndicators.rsi.toFixed(1)}
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="text-sm font-medium">MACD</div>
                <div className={`text-lg font-semibold ${getMACDColor(analysis.technicalIndicators.macd)}`}>
                  {analysis.technicalIndicators.macd.toFixed(4)}
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="text-sm font-medium">MA</div>
                <div className="text-lg font-semibold">
                  {analysis.technicalIndicators.movingAverage.toFixed(2)}
                </div>
              </div>
              <div className="text-center p-3 rounded-lg border">
                <div className="text-xs text-muted-foreground mb-1">Bollinger Bands</div>
                <div className="text-sm">
                  <div>Upper: {analysis.technicalIndicators.bollingerUpper.toFixed(2)}</div>
                  <div>Lower: {analysis.technicalIndicators.bollingerLower.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pattern Recognition */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Pattern Recognition
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-lg border">
              <div className="text-lg font-semibold mb-1">
                {(analysis.patternRecognition.confidence * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">Confidence</div>
            </div>
            <div className="text-center p-3 rounded-lg border">
              <div className="flex items-center justify-center gap-1 mb-1">
                {analysis.patternRecognition.nextMove === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : analysis.patternRecognition.nextMove === 'down' ? (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                ) : (
                  <Activity className="h-4 w-4 text-gray-600" />
                )}
                <span className="text-sm font-medium capitalize">
                  {analysis.patternRecognition.nextMove}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">Next Move</div>
            </div>
          </div>
          
          {/* Detected Patterns */}
          {analysis.patternRecognition.patterns.length > 0 && (
            <div className="mt-3">
              <div className="text-xs font-medium mb-2 text-muted-foreground">Detected Patterns</div>
              <div className="flex flex-wrap gap-1">
                {analysis.patternRecognition.patterns.map((pattern, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {pattern}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Automated Signals */}
        {analysis.automatedSignals.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Automated Signals
            </h4>
            <div className="space-y-2">
              {analysis.automatedSignals.map((signal, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Badge className={signalColors[signal.type]} className="text-xs">
                      {signal.type.toUpperCase()}
                    </Badge>
                    <div>
                      <div className="text-sm font-medium">{signal.reasoning}</div>
                      <div className="text-xs text-muted-foreground">
                        Timeframe: {signal.timeframe}s
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">
                      {(signal.strength * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Strength</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chart Data Summary */}
        <div>
          <h4 className="text-sm font-medium mb-3">Chart Data Summary</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-lg border">
              <div className="text-lg font-semibold">
                {analysis.chartData.length}
              </div>
              <div className="text-xs text-muted-foreground">Data Points</div>
            </div>
            <div className="text-center p-3 rounded-lg border">
              <div className="text-lg font-semibold">
                {Math.min(...analysis.chartData.map(d => d.price)).toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">Min Price</div>
            </div>
            <div className="text-center p-3 rounded-lg border">
              <div className="text-lg font-semibold">
                {Math.max(...analysis.chartData.map(d => d.price)).toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">Max Price</div>
            </div>
          </div>
        </div>

        {/* Analysis Info */}
        <div className="text-xs text-muted-foreground pt-2 border-t">
          Analysis timestamp: {new Date(analysis.timestamp).toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
}