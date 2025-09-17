import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { VolatilityAnalysis, VOLATILITY_INDICES } from '@/types/deriv';
import { BarChart3, TrendingUp, Activity, Zap, Target } from 'lucide-react';

interface VolatilityAnalysisPanelProps {
  analysis: VolatilityAnalysis | undefined;
  isAnalyzing: boolean;
}

export function VolatilityAnalysisPanel({ analysis, isAnalyzing }: VolatilityAnalysisPanelProps) {
  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Volatility Analysis
          </CardTitle>
          <CardDescription>
            Comprehensive volatility analysis across all indices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            {isAnalyzing ? (
              <div className="flex items-center justify-center gap-2">
                <Activity className="h-4 w-4 animate-pulse" />
                Analyzing volatility data...
              </div>
            ) : (
              'Waiting for volatility data...'
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const regimeColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    extreme: 'bg-red-100 text-red-800',
  };

  const getVolatilityIndexName = (symbol: string) => {
    const index = VOLATILITY_INDICES.find(v => v.symbol === symbol);
    return index ? index.shortName : symbol;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Volatility Analysis
        </CardTitle>
        <CardDescription>
          Cross-volatility correlation and market impact analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Volatility Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              {(analysis.currentVolatility * 100).toFixed(2)}%
            </div>
            <div className="text-sm text-muted-foreground">Current Volatility</div>
          </div>
          <div className="text-center">
            <Badge className={regimeColors[analysis.volatilityRegime]} className="text-sm px-3 py-1">
              {analysis.volatilityRegime.toUpperCase()}
            </Badge>
            <div className="text-sm text-muted-foreground mt-1">Volatility Regime</div>
          </div>
        </div>

        {/* Volatility Forecast */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Volatility Forecast
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-lg border">
              <div className="text-lg font-semibold">
                {(analysis.volatilityForecast.next10Seconds * 100).toFixed(2)}%
              </div>
              <div className="text-xs text-muted-foreground">10s</div>
            </div>
            <div className="text-center p-3 rounded-lg border">
              <div className="text-lg font-semibold">
                {(analysis.volatilityForecast.next30Seconds * 100).toFixed(2)}%
              </div>
              <div className="text-xs text-muted-foreground">30s</div>
            </div>
            <div className="text-center p-3 rounded-lg border">
              <div className="text-lg font-semibold">
                {(analysis.volatilityForecast.next60Seconds * 100).toFixed(2)}%
              </div>
              <div className="text-xs text-muted-foreground">60s</div>
            </div>
          </div>
        </div>

        {/* Cross-Volatility Correlations */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Cross-Volatility Correlations
          </h4>
          <div className="space-y-2">
            {Object.entries(analysis.crossCorrelations).map(([symbol, correlation]) => (
              <div key={symbol} className="flex items-center justify-between p-2 rounded-lg border">
                <div className="text-sm font-medium">
                  {getVolatilityIndexName(symbol)}
                </div>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={Math.abs(correlation) * 100} 
                    className="h-2 w-20"
                  />
                  <span className="text-xs text-muted-foreground w-12 text-right">
                    {correlation > 0 ? '+' : ''}{(correlation * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market Impact Analysis */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Market Impact Analysis
          </h4>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 rounded-lg border">
              <div className="text-lg font-semibold">
                {(analysis.marketImpact.trendStrength * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">Trend Strength</div>
            </div>
            <div className="text-center p-3 rounded-lg border">
              <div className="text-lg font-semibold">
                {(analysis.marketImpact.reversalProbability * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">Reversal Probability</div>
            </div>
          </div>
          
          {/* Digit Bias */}
          <div>
            <h5 className="text-xs font-medium mb-2 text-muted-foreground">Digit Bias</h5>
            <div className="grid grid-cols-5 gap-1">
              {Object.entries(analysis.marketImpact.digitBias).map(([digit, bias]) => (
                <div key={digit} className="text-center p-2 rounded border">
                  <div className="text-sm font-semibold">{digit}</div>
                  <div className="text-xs text-muted-foreground">
                    {(bias * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Volatility Clusters */}
        {analysis.volatilityClusters.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Volatility Clusters
            </h4>
            <div className="space-y-2">
              {analysis.volatilityClusters.slice(-5).map((cluster, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg border">
                  <div className="text-sm">
                    Cluster #{cluster.cluster}
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={cluster.intensity * 10} 
                      className="h-2 w-20"
                    />
                    <span className="text-xs text-muted-foreground">
                      {cluster.intensity.toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analysis Info */}
        <div className="text-xs text-muted-foreground pt-2 border-t">
          Analysis timestamp: {new Date(analysis.timestamp).toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
}