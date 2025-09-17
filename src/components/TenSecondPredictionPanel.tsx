import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TenSecondPrediction } from '@/types/deriv';
import { Clock, TrendingUp, TrendingDown, Activity, Target } from 'lucide-react';

interface TenSecondPredictionPanelProps {
  prediction: TenSecondPrediction | undefined;
  isAnalyzing: boolean;
}

export function TenSecondPredictionPanel({ prediction, isAnalyzing }: TenSecondPredictionPanelProps) {
  if (!prediction) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            10-Second Prediction Engine
          </CardTitle>
          <CardDescription>
            Advanced digit prediction with volatility analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            {isAnalyzing ? (
              <div className="flex items-center justify-center gap-2">
                <Activity className="h-4 w-4 animate-pulse" />
                Analyzing market data...
              </div>
            ) : (
              'Waiting for market data...'
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const topPredictions = prediction.predictions.slice(0, 5);
  const marketRegimeColors = {
    trending: 'bg-blue-100 text-blue-800',
    ranging: 'bg-gray-100 text-gray-800',
    volatile: 'bg-red-100 text-red-800',
    calm: 'bg-green-100 text-green-800',
  };

  const trendIcons = {
    up: <TrendingUp className="h-4 w-4 text-green-600" />,
    down: <TrendingDown className="h-4 w-4 text-red-600" />,
    sideways: <Activity className="h-4 w-4 text-gray-600" />,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          10-Second Prediction Engine
        </CardTitle>
        <CardDescription>
          Next digit prediction with {prediction.analysisTime}ms analysis time
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Top Prediction */}
        <div className="text-center">
          <div className="text-4xl font-bold text-primary mb-2">
            {prediction.topPrediction.digit}
          </div>
          <div className="text-sm text-muted-foreground mb-4">
            Top Prediction
          </div>
          <div className="flex justify-center gap-4 mb-4">
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {(prediction.topPrediction.probability * 100).toFixed(1)}%
            </Badge>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {(prediction.topPrediction.confidence * 100).toFixed(1)}% confidence
            </Badge>
          </div>
        </div>

        {/* Market Conditions */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              {trendIcons[prediction.marketConditions.trend]}
              <span className="text-sm font-medium">Trend</span>
            </div>
            <Badge className={marketRegimeColors[prediction.marketConditions.regime]}>
              {prediction.marketConditions.trend}
            </Badge>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium mb-2">Volatility</div>
            <Badge variant="outline">
              {(prediction.marketConditions.volatility * 100).toFixed(2)}%
            </Badge>
          </div>
        </div>

        {/* Top 5 Predictions */}
        <div>
          <h4 className="text-sm font-medium mb-3">Top 5 Predictions</h4>
          <div className="space-y-2">
            {topPredictions.map((pred, index) => (
              <div key={pred.digit} className="flex items-center justify-between p-2 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="text-lg font-semibold w-6 text-center">
                    {pred.digit}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Progress 
                        value={pred.probability * 100} 
                        className="h-2 flex-1"
                      />
                      <span className="text-xs text-muted-foreground">
                        {(pred.probability * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Confidence: {(pred.confidence * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={index === 0 ? "default" : "secondary"} className="text-xs">
                    #{index + 1}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Analysis Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Analysis: {prediction.analysisTime}ms
          </div>
          <div>
            Regime: {prediction.marketConditions.regime}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}