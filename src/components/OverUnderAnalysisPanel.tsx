import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BandPrediction } from '@/types/deriv';
import { BarChart3, TrendingUp, TrendingDown, Target, Zap } from 'lucide-react';

interface OverUnderAnalysisPanelProps {
  prediction: BandPrediction | undefined;
  isAnalyzing: boolean;
}

export function OverUnderAnalysisPanel({ prediction, isAnalyzing }: OverUnderAnalysisPanelProps) {
  if (!prediction) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Over/Under Analysis
          </CardTitle>
          <CardDescription>
            Comprehensive over/under digit contract analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            {isAnalyzing ? (
              <div className="flex items-center justify-center gap-2">
                <Zap className="h-4 w-4 animate-pulse" />
                Analyzing over/under patterns...
              </div>
            ) : (
              'Waiting for analysis data...'
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 0.6) return 'text-green-600';
    if (probability >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Over/Under Analysis
        </CardTitle>
        <CardDescription>
          Advanced over/under digit contract analysis with volatility adjustments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Over/Under Predictions */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 rounded-lg border">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">Over 2</span>
            </div>
            <div className={`text-3xl font-bold mb-2 ${getProbabilityColor(prediction.over2)}`}>
              {(prediction.over2 * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">Digits 3-9</div>
            <Progress value={prediction.over2 * 100} className="h-2 mt-2" />
          </div>
          
          <div className="text-center p-4 rounded-lg border">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              <span className="text-sm font-medium">Under 7</span>
            </div>
            <div className={`text-3xl font-bold mb-2 ${getProbabilityColor(prediction.under7)}`}>
              {(prediction.under7 * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">Digits 0-6</div>
            <Progress value={prediction.under7 * 100} className="h-2 mt-2" />
          </div>
        </div>

        {/* Enhanced Over/Under Analysis */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Enhanced Over/Under Analysis
          </h4>
          <div className="grid grid-cols-2 gap-4">
            {/* Over 0-8 vs Under 9-1 */}
            <div className="space-y-3">
              <div className="text-center p-3 rounded-lg border">
                <div className="text-sm font-medium mb-1">Over 0-8</div>
                <div className={`text-xl font-semibold ${getProbabilityColor(prediction.overUnderAnalysis.over0to8)}`}>
                  {(prediction.overUnderAnalysis.over0to8 * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">Digits 0-8</div>
              </div>
              <div className="text-center p-3 rounded-lg border">
                <div className="text-sm font-medium mb-1">Under 9-1</div>
                <div className={`text-xl font-semibold ${getProbabilityColor(prediction.overUnderAnalysis.under9to1)}`}>
                  {(prediction.overUnderAnalysis.under9to1 * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">Digits 9-1</div>
              </div>
            </div>
            
            {/* Over 2-9 vs Under 0-7 */}
            <div className="space-y-3">
              <div className="text-center p-3 rounded-lg border">
                <div className="text-sm font-medium mb-1">Over 2-9</div>
                <div className={`text-xl font-semibold ${getProbabilityColor(prediction.overUnderAnalysis.over2to9)}`}>
                  {(prediction.overUnderAnalysis.over2to9 * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">Digits 2-9</div>
              </div>
              <div className="text-center p-3 rounded-lg border">
                <div className="text-sm font-medium mb-1">Under 0-7</div>
                <div className={`text-xl font-semibold ${getProbabilityColor(prediction.overUnderAnalysis.under0to7)}`}>
                  {(prediction.overUnderAnalysis.under0to7 * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">Digits 0-7</div>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Features */}
        <div>
          <h4 className="text-sm font-medium mb-3">Analysis Features</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg border">
                <span className="text-sm">Volatility Adjusted</span>
                <Badge variant={prediction.volatilityAdjusted ? "default" : "secondary"}>
                  {prediction.volatilityAdjusted ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg border">
                <span className="text-sm">Trend Based</span>
                <Badge variant={prediction.trendBased ? "default" : "secondary"}>
                  {prediction.trendBased ? "Yes" : "No"}
                </Badge>
              </div>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <div className="text-sm font-medium mb-1">Overall Confidence</div>
              <div className={`text-2xl font-bold ${getConfidenceColor(prediction.confidence)}`}>
                {(prediction.confidence * 100).toFixed(1)}%
              </div>
              <Progress value={prediction.confidence * 100} className="h-2 mt-2" />
            </div>
          </div>
        </div>

        {/* Recommendation */}
        <div className="text-center p-4 rounded-lg border bg-muted/50">
          <h4 className="text-sm font-medium mb-2">Recommendation</h4>
          {prediction.over2 > prediction.under7 ? (
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-lg font-semibold text-green-600">
                Favor Over 2 (Digits 3-9)
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              <span className="text-lg font-semibold text-red-600">
                Favor Under 7 (Digits 0-6)
              </span>
            </div>
          )}
          <div className="text-sm text-muted-foreground mt-2">
            Confidence: {(prediction.confidence * 100).toFixed(1)}%
          </div>
        </div>

        {/* Analysis Summary */}
        <div className="text-xs text-muted-foreground pt-2 border-t">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Market Analysis:</strong> {prediction.volatilityAdjusted ? 'Volatility-adjusted' : 'Standard'} analysis
            </div>
            <div>
              <strong>Trend Analysis:</strong> {prediction.trendBased ? 'Trend-based' : 'Pattern-based'} prediction
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}