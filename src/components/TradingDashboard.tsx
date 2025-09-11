import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AssetSelector } from './AssetSelector';
import { LiveFeed } from './LiveFeed';
import { PredictionPanel } from './PredictionPanel';
import { RiskControls } from './RiskControls';
import { SignalHistory } from './SignalHistory';
import { MarketStatus } from './MarketStatus';
import { useDerivWebSocket } from '@/hooks/useDerivWebSocket';
import { usePredictionEngine } from '@/hooks/usePredictionEngine';
import { VolatilityIndex, RiskSettings, TradingSignal } from '@/types/deriv';
import { Activity, Zap, Shield, Download } from 'lucide-react';

export function TradingDashboard() {
  const [selectedSymbol, setSelectedSymbol] = useState<VolatilityIndex>('R_50');
  const [timeframe, setTimeframe] = useState<'1min' | '5min'>('1min');
  const [isActive, setIsActive] = useState(false);
  const [riskSettings, setRiskSettings] = useState<RiskSettings>({
    maxConsecutiveLosses: 3,
    dailyLossLimit: 100,
    maxDrawdownPercent: 20,
    probabilityThreshold: 0.75,
    requiredRuns: 3,
    stake: 1,
    martingaleMultiplier: 2.0,
  });

  const {
    ticks,
    isConnected,
    marketStatus,
    subscribe,
    unsubscribe,
    reconnect,
  } = useDerivWebSocket();

  const {
    digitPredictions,
    bandPrediction,
    signals,
    features,
    isAnalyzing,
    generateSignal,
    exportXML,
  } = usePredictionEngine(selectedSymbol, ticks[selectedSymbol] || [], riskSettings, isActive);

  console.log('📊 Dashboard State:', {
    selectedSymbol,
    tickCount: (ticks[selectedSymbol] || []).length,
    digitPredictions: digitPredictions.length,
    hasBandPrediction: !!bandPrediction,
    signalCount: signals.length,
    hasFeatures: !!features,
    isAnalyzing,
  });

  useEffect(() => {
    if (selectedSymbol) {
      subscribe(selectedSymbol);
    }
    return () => {
      if (selectedSymbol) {
        unsubscribe(selectedSymbol);
      }
    };
  }, [selectedSymbol, subscribe, unsubscribe]);

  const handleStartStop = () => {
    setIsActive(!isActive);
    if (!isActive && !isConnected) {
      reconnect();
    }
  };

  const handleExportLatestSignal = () => {
    const latestSignal = signals[0];
    if (latestSignal) {
      exportXML(latestSignal.id);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Header */}
      <header className="border-b border-border bg-background-surface/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Accelerator Zone</h1>
                  <p className="text-sm text-foreground-muted">Mercedes AI Analysis</p>
                </div>
              </div>
              <Badge 
                variant={isConnected ? "default" : "destructive"} 
                className={isConnected ? "bg-success text-success-foreground" : ""}
              >
                <Activity className="w-3 h-3 mr-1" />
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <MarketStatus status={marketStatus} />
              <Button
                variant={isActive ? "destructive" : "default"}
                onClick={handleStartStop}
                className={isActive ? "" : "bg-gradient-primary hover:bg-gradient-primary/90"}
              >
                <Shield className="w-4 h-4 mr-2" />
                {isActive ? 'Stop Analysis' : 'Start Analysis'}
              </Button>
              {signals.length > 0 && (
                <Button variant="outline" onClick={handleExportLatestSignal}>
                  <Download className="w-4 h-4 mr-2" />
                  Export XML
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-140px)]">
          {/* Left Panel - Controls */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            <Card className="p-6 bg-glass-surface border-glass-border backdrop-blur-xl shadow-glass">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Asset Selection</h3>
              <AssetSelector
                selectedSymbol={selectedSymbol}
                onSymbolChange={setSelectedSymbol}
                timeframe={timeframe}
                onTimeframeChange={setTimeframe}
              />
            </Card>
            
            <Card className="p-6 bg-glass-surface border-glass-border backdrop-blur-xl shadow-glass">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Risk Controls</h3>
              <RiskControls
                settings={riskSettings}
                onChange={setRiskSettings}
                isActive={isActive}
              />
            </Card>

            <Card className="p-6 bg-glass-surface border-glass-border backdrop-blur-xl shadow-glass">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Signal History</h3>
              <SignalHistory signals={signals.slice(0, 5)} />
            </Card>
          </div>

          {/* Center Panel - Live Feed */}
          <div className="col-span-12 lg:col-span-6">
            <Card className="h-full p-6 bg-glass-surface border-glass-border backdrop-blur-xl shadow-glass">
              <LiveFeed
                symbol={selectedSymbol}
                ticks={ticks[selectedSymbol] || []}
                isConnected={isConnected}
                isAnalyzing={isAnalyzing} // Always show analysis status
                features={features}
              />
            </Card>
          </div>

          {/* Right Panel - Predictions */}
          <div className="col-span-12 lg:col-span-3">
            <Card className="h-full p-6 bg-glass-surface border-glass-border backdrop-blur-xl shadow-glass">
              <PredictionPanel
                digitPredictions={digitPredictions}
                bandPrediction={bandPrediction}
                isActive={isAnalyzing} // Show predictions even when not actively trading
                threshold={riskSettings.probabilityThreshold}
                onGenerateSignal={generateSignal}
              />
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}