import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { RiskSettings } from '@/types/deriv';
import { Shield, DollarSign, Target, TrendingUp } from 'lucide-react';

interface RiskControlsProps {
  settings: RiskSettings;
  onChange: (settings: RiskSettings) => void;
  isActive: boolean;
}

export function RiskControls({ settings, onChange, isActive }: RiskControlsProps) {
  const updateSetting = <K extends keyof RiskSettings>(
    key: K,
    value: RiskSettings[K]
  ) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-4">
      {/* Trading Parameters */}
      <Card className="p-4 bg-background-elevated border-border">
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center">
          <DollarSign className="w-4 h-4 mr-1" />
          Trading Parameters
        </h4>
        <div className="space-y-3">
          <div>
            <Label htmlFor="stake" className="text-xs text-foreground-muted">
              Stake Amount ($)
            </Label>
            <Input
              id="stake"
              type="number"
              value={settings.stake}
              onChange={(e) => updateSetting('stake', parseFloat(e.target.value) || 1)}
              disabled={isActive}
              className="mt-1 bg-background border-border"
              min="0.1"
              step="0.1"
            />
          </div>
          <div>
            <Label className="text-xs text-foreground-muted">
              Martingale Multiplier: {settings.martingaleMultiplier}x
            </Label>
            <Slider
              value={[settings.martingaleMultiplier]}
              onValueChange={([value]) => updateSetting('martingaleMultiplier', value)}
              disabled={isActive}
              min={1.0}
              max={3.0}
              step={0.1}
              className="mt-2"
            />
          </div>
        </div>
      </Card>

      {/* Risk Limits */}
      <Card className="p-4 bg-background-elevated border-border">
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center">
          <Shield className="w-4 h-4 mr-1" />
          Risk Limits
        </h4>
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-foreground-muted">
              Max Consecutive Losses: {settings.maxConsecutiveLosses}
            </Label>
            <Slider
              value={[settings.maxConsecutiveLosses]}
              onValueChange={([value]) => updateSetting('maxConsecutiveLosses', value)}
              disabled={isActive}
              min={1}
              max={10}
              step={1}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="dailyLimit" className="text-xs text-foreground-muted">
              Daily Loss Limit ($)
            </Label>
            <Input
              id="dailyLimit"
              type="number"
              value={settings.dailyLossLimit}
              onChange={(e) => updateSetting('dailyLossLimit', parseFloat(e.target.value) || 100)}
              disabled={isActive}
              className="mt-1 bg-background border-border"
              min="10"
              step="10"
            />
          </div>
          <div>
            <Label className="text-xs text-foreground-muted">
              Max Drawdown: {settings.maxDrawdownPercent}%
            </Label>
            <Slider
              value={[settings.maxDrawdownPercent]}
              onValueChange={([value]) => updateSetting('maxDrawdownPercent', value)}
              disabled={isActive}
              min={5}
              max={50}
              step={5}
              className="mt-2"
            />
          </div>
        </div>
      </Card>

      {/* Analysis Settings */}
      <Card className="p-4 bg-background-elevated border-border">
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center">
          <Target className="w-4 h-4 mr-1" />
          Analysis Settings
        </h4>
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-foreground-muted">
              Probability Threshold: {(settings.probabilityThreshold * 100).toFixed(0)}%
            </Label>
            <Slider
              value={[settings.probabilityThreshold]}
              onValueChange={([value]) => updateSetting('probabilityThreshold', value)}
              disabled={isActive}
              min={0.5}
              max={0.9}
              step={0.05}
              className="mt-2"
            />
          </div>
          <div>
            <Label className="text-xs text-foreground-muted">
              Required Runs: {settings.requiredRuns} out of 4
            </Label>
            <Slider
              value={[settings.requiredRuns]}
              onValueChange={([value]) => updateSetting('requiredRuns', value)}
              disabled={isActive}
              min={2}
              max={4}
              step={1}
              className="mt-2"
            />
          </div>
        </div>
      </Card>

      {/* Status */}
      {isActive && (
        <div className="pt-2">
          <Badge variant="secondary" className="w-full justify-center animate-pulse">
            <TrendingUp className="w-3 h-3 mr-1" />
            Risk Controls Active
          </Badge>
        </div>
      )}
    </div>
  );
}