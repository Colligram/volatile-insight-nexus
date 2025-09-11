import { Badge } from '@/components/ui/badge';
import { TradingSignal } from '@/types/deriv';
import { Clock, Target, TrendingUp, TrendingDown, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SignalHistoryProps {
  signals: TradingSignal[];
}

export function SignalHistory({ signals }: SignalHistoryProps) {
  if (signals.length === 0) {
    return (
      <div className="text-center py-8 text-foreground-muted">
        <Clock className="w-6 h-6 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No signals generated yet</p>
      </div>
    );
  }

  const getStatusIcon = (status: TradingSignal['status']) => {
    switch (status) {
      case 'executed':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'expired':
        return <XCircle className="w-4 h-4 text-destructive" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-warning" />;
      default:
        return <AlertCircle className="w-4 h-4 text-primary" />;
    }
  };

  const getStatusColor = (status: TradingSignal['status']) => {
    switch (status) {
      case 'executed':
        return 'text-success-foreground bg-success';
      case 'expired':
        return 'text-destructive-foreground bg-destructive';
      case 'cancelled':
        return 'text-warning-foreground bg-warning';
      default:
        return 'text-primary-foreground bg-primary';
    }
  };

  return (
    <div className="space-y-3 max-h-80 overflow-y-auto">
      {signals.map((signal) => (
        <div
          key={signal.id}
          className="p-3 rounded-lg bg-background border border-border hover:bg-background-elevated transition-colors"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              {getStatusIcon(signal.status)}
              <div>
                <div className="text-sm font-medium text-foreground">
                  {signal.symbol}
                </div>
                <div className="text-xs text-foreground-muted">
                  {formatDistanceToNow(new Date(signal.timestamp), { addSuffix: true })}
                </div>
              </div>
            </div>
            <Badge className={`text-xs ${getStatusColor(signal.status)}`}>
              {signal.status}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {signal.type === 'exact_digit' ? (
                <div className="flex items-center gap-1">
                  <Target className="w-3 h-3 text-primary" />
                  <span className="text-sm text-foreground">
                    Digit {signal.predicted_digit}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  {signal.predicted_band === 'over2' ? (
                    <TrendingUp className="w-3 h-3 text-success" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-destructive" />
                  )}
                  <span className="text-sm text-foreground">
                    {signal.predicted_band === 'over2' ? 'Over 2' : 'Under 7'}
                  </span>
                </div>
              )}
              <div className="text-xs text-foreground-muted">
                {signal.runs} runs
              </div>
            </div>
            <div className="text-sm font-medium text-foreground">
              {(signal.confidence * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}