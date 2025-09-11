import { useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { DerivTick, PredictionFeatures, VolatilityIndex } from '@/types/deriv';
import { TrendingUp, TrendingDown, Activity, BarChart3 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface LiveFeedProps {
  symbol: VolatilityIndex;
  ticks: DerivTick[];
  isConnected: boolean;
  isAnalyzing: boolean;
  features?: PredictionFeatures;
}

export function LiveFeed({ symbol, ticks, isConnected, isAnalyzing, features }: LiveFeedProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const latestTicks = ticks.slice(-10);
  const currentPrice = ticks[ticks.length - 1]?.price;
  const previousPrice = ticks[ticks.length - 2]?.price;
  const priceChange = currentPrice && previousPrice ? currentPrice - previousPrice : 0;
  const lastDigit = Math.floor((currentPrice || 0) * 10) % 10;

  // Simple sparkline drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || ticks.length < 2) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    const prices = ticks.slice(-50).map(tick => tick.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;

    ctx.strokeStyle = '#00A3FF';
    ctx.lineWidth = 2;
    ctx.beginPath();

    prices.forEach((price, index) => {
      const x = (index / (prices.length - 1)) * width;
      const y = height - ((price - minPrice) / priceRange) * height;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();
  }, [ticks]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">{symbol}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={isConnected ? "default" : "destructive"} className="text-xs">
              {isConnected ? 'Live' : 'Disconnected'}
            </Badge>
            {isAnalyzing && (
              <Badge variant="secondary" className="text-xs animate-pulse">
                <Activity className="w-3 h-3 mr-1" />
                Analyzing
              </Badge>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-mono font-bold text-foreground">
            {currentPrice?.toFixed(3) || '--'}
          </div>
          {priceChange !== 0 && (
            <div className={`flex items-center text-sm ${
              priceChange > 0 ? 'text-success' : 'text-destructive'
            }`}>
              {priceChange > 0 ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              {Math.abs(priceChange).toFixed(3)}
            </div>
          )}
        </div>
      </div>

      {/* Price Chart */}
      <Card className="flex-1 p-4 bg-background-elevated border-border mb-4">
        <div className="h-full relative">
          <canvas
            ref={canvasRef}
            width={800}
            height={200}
            className="w-full h-full"
            style={{ maxHeight: '200px' }}
          />
          {ticks.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-foreground-muted">
              <div className="text-center">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Waiting for tick data...</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Current Analysis */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card className="p-4 bg-background-elevated border-border">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{lastDigit}</div>
            <div className="text-sm text-foreground-muted">Last Digit</div>
          </div>
        </Card>
        <Card className="p-4 bg-background-elevated border-border">
          <div className="text-center">
            <div className="text-lg font-semibold text-foreground">
              {features?.volatility?.toFixed(4) || '--'}
            </div>
            <div className="text-sm text-foreground-muted">Volatility</div>
          </div>
        </Card>
      </div>

      {/* Recent Ticks */}
      <div>
        <h3 className="text-sm font-semibold text-foreground-muted mb-2">Recent Ticks</h3>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {latestTicks.slice().reverse().map((tick, index) => (
            <div
              key={tick.id}
              className="flex items-center justify-between p-2 rounded bg-background-elevated text-sm"
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  index === 0 ? 'bg-primary animate-pulse' : 'bg-foreground-muted'
                }`} />
                <span className="font-mono text-foreground">{tick.price.toFixed(3)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {tick.lastDigit}
                </Badge>
                <span className="text-foreground-muted text-xs">
                  {formatDistanceToNow(new Date(tick.timestamp), { addSuffix: true })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}