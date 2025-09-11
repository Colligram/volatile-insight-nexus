import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VOLATILITY_INDICES, VolatilityIndex } from '@/types/deriv';
import { TrendingUp, Clock } from 'lucide-react';

interface AssetSelectorProps {
  selectedSymbol: VolatilityIndex;
  onSymbolChange: (symbol: VolatilityIndex) => void;
  timeframe: '1min' | '5min';
  onTimeframeChange: (timeframe: '1min' | '5min') => void;
}

export function AssetSelector({
  selectedSymbol,
  onSymbolChange,
  timeframe,
  onTimeframeChange,
}: AssetSelectorProps) {
  const selectedAsset = VOLATILITY_INDICES.find(asset => asset.symbol === selectedSymbol);

  return (
    <div className="space-y-4">
      {/* Asset Selection */}
      <div>
        <label className="text-sm font-medium text-foreground-muted mb-2 block">
          Volatility Index
        </label>
        <Select value={selectedSymbol} onValueChange={onSymbolChange}>
          <SelectTrigger className="bg-background-elevated border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-background-elevated border-border">
            {VOLATILITY_INDICES.map((asset) => (
              <SelectItem key={asset.symbol} value={asset.symbol}>
                <div className="flex items-center justify-between w-full">
                  <span>{asset.shortName}</span>
                  {asset.symbol.includes('1S') && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      1s
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Current Selection Info */}
      {selectedAsset && (
        <div className="p-3 rounded-lg bg-background-elevated border border-border">
          <div className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">{selectedAsset.name}</p>
              <p className="text-xs text-foreground-muted mt-1">
                Symbol: {selectedAsset.symbol}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Timeframe Selection */}
      <div>
        <label className="text-sm font-medium text-foreground-muted mb-2 block">
          <Clock className="w-4 h-4 inline mr-1" />
          Analysis Timeframe
        </label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={timeframe === '1min' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onTimeframeChange('1min')}
            className={timeframe === '1min' ? 'bg-primary text-primary-foreground' : ''}
          >
            1 Min
          </Button>
          <Button
            variant={timeframe === '5min' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onTimeframeChange('5min')}
            className={timeframe === '5min' ? 'bg-primary text-primary-foreground' : ''}
          >
            5 Min
          </Button>
        </div>
      </div>
    </div>
  );
}