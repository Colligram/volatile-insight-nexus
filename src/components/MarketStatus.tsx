import { Badge } from '@/components/ui/badge';
import { MarketStatus as MarketStatusType } from '@/types/deriv';
import { Wifi, WifiOff, AlertTriangle, Activity, TrendingUp } from 'lucide-react';

interface MarketStatusProps {
  status: MarketStatusType;
}

export function MarketStatus({ status }: MarketStatusProps) {
  const getStatusConfig = () => {
    switch (status.status) {
      case 'normal':
        return {
          icon: <Activity className="w-3 h-3" />,
          label: 'Normal',
          className: 'bg-success text-success-foreground',
        };
      case 'shift':
        return {
          icon: <AlertTriangle className="w-3 h-3" />,
          label: 'Market Shift',
          className: 'bg-warning text-warning-foreground animate-pulse',
        };
      case 'volatile':
        return {
          icon: <TrendingUp className="w-3 h-3" />,
          label: 'High Volatility',
          className: 'bg-destructive text-destructive-foreground',
        };
      case 'disconnected':
        return {
          icon: <WifiOff className="w-3 h-3" />,
          label: 'Disconnected',
          className: 'bg-muted text-muted-foreground',
        };
      default:
        return {
          icon: <Wifi className="w-3 h-3" />,
          label: 'Unknown',
          className: 'bg-muted text-muted-foreground',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="flex items-center gap-2">
      <Badge className={`${config.className} text-xs`}>
        {config.icon}
        <span className="ml-1">{config.label}</span>
      </Badge>
      
      {status.zScore && Math.abs(status.zScore) > 2 && (
        <div className="text-xs text-foreground-muted">
          Z-Score: {status.zScore.toFixed(2)}
        </div>
      )}
    </div>
  );
}