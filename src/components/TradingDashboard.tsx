import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { AssetSelector } from "./AssetSelector";
import { LiveFeed } from "./LiveFeed";
import { PredictionPanel } from "./PredictionPanel";
import { RiskControls } from "./RiskControls";
import { SignalHistory } from "./SignalHistory";
import { MarketStatus } from "./MarketStatus";
import { TenSecondPredictionPanel } from "./TenSecondPredictionPanel";
import { VolatilityAnalysisPanel } from "./VolatilityAnalysisPanel";
import { RealtimeAnalysisPanel } from "./RealtimeAnalysisPanel";
import { OverUnderAnalysisPanel } from "./OverUnderAnalysisPanel";

import { useDerivWebSocket } from "@/hooks/useDerivWebSocket";
import { useAdvancedPredictionEngine } from "@/hooks/useAdvancedPredictionEngine";

import {
  VolatilityIndex,
  RiskSettings,
} from "@/types/deriv";

import {
  Activity,
  Zap,
  Shield,
  Download,
} from "lucide-react";

export function TradingDashboard() {
  const [selectedSymbol, setSelectedSymbol] = useState<VolatilityIndex>(
    (import.meta.env.VITE_DEFAULT_SYMBOL as VolatilityIndex) || "R_50"
  );
  const [timeframe, setTimeframe] = useState<"1min" | "5min">("1min");
  const [isActive, setIsActive] = useState(false);
  const [useRealToken, setUseRealToken] = useState(false);

  const [riskSettings, setRiskSettings] = useState<RiskSettings>({
    maxConsecutiveLosses:
      Number(import.meta.env.VITE_DEFAULT_MAX_CONSECUTIVE_LOSSES) || 3,
    dailyLossLimit:
      Number(import.meta.env.VITE_DEFAULT_DAILY_LOSS_LIMIT) || 100,
    maxDrawdownPercent:
      Number(import.meta.env.VITE_DEFAULT_MAX_DRAWDOWN_PERCENT) || 20,
    probabilityThreshold:
      Number(import.meta.env.VITE_DEFAULT_PROBABILITY_THRESHOLD) || 0.75,
    requiredRuns:
      Number(import.meta.env.VITE_DEFAULT_REQUIRED_RUNS) || 3,
    stake: Number(import.meta.env.VITE_DEFAULT_STAKE) || 1,
    martingaleMultiplier: 2.0,
  });

  const {
    ticks,
    isConnected,
    isAuthorized,
    marketStatus,
    subscribe,
    unsubscribe,
    reconnect,
  } = useDerivWebSocket(useRealToken);

  const {
    digitPredictions,
    bandPrediction,
    signals,
    features,
    isAnalyzing,
    generateSignal,
    exportXML,
    tenSecondPrediction,
    volatilityAnalysis,
    realtimeAnalysis,
    allVolatilityData,
  } = useAdvancedPredictionEngine(
    selectedSymbol,
    ticks[selectedSymbol] || [],
    riskSettings,
    isActive
  );

  useEffect(() => {
    if (selectedSymbol) subscribe(selectedSymbol);
    return () => {
      if (selectedSymbol) unsubscribe(selectedSymbol);
    };
  }, [selectedSymbol, subscribe, unsubscribe]);

  const handleStartStop = () => {
    setIsActive((prev) => !prev);
    if (!isActive && !isConnected) reconnect();
  };

  const handleExportLatestSignal = () => {
    const latestSignal = signals[0];
    if (latestSignal) exportXML(latestSignal.id);
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Header */}
      <header className="border-b border-border bg-background-surface/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Branding & Status */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    {import.meta.env.VITE_APP_NAME || "Deriv Prediction Platform"}
                  </h1>
                  <p className="text-sm text-foreground-muted">
                    Advanced 10-Second Digit Prediction & Volatility Analysis
                  </p>
                </div>
              </div>

              <Badge
                variant={
                  isAuthorized
                    ? "default"
                    : isConnected
                    ? "secondary"
                    : "destructive"
                }
                className={
                  isAuthorized ? "bg-success text-success-foreground" : ""
                }
              >
                <Activity className="w-3 h-3 mr-1" />
                {isAuthorized
                  ? "Authorized"
                  : isConnected
                  ? "Connected"
                  : "Disconnected"}
              </Badge>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              <MarketStatus status={marketStatus} />

              <Button
                variant={isAuthorized ? "default" : "secondary"}
                onClick={() => setUseRealToken((prev) => !prev)}
                className={
                  isAuthorized ? "bg-success text-success-foreground" : ""
                }
              >
                {useRealToken ? "Real Account" : "Demo Account"}
              </Button>

              <Button
                variant={isActive ? "destructive" : "default"}
                onClick={handleStartStop}
                className={
                  isActive
                    ? ""
                    : "bg-gradient-primary hover:bg-gradient-primary/90"
                }
                disabled={!isAuthorized}
              >
                <Shield className="w-4 h-4 mr-2" />
                {isActive ? "Stop Analysis" : "Start Analysis"}
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
        <div className="space-y-6">
          {/* Top Row - Asset Selection and Controls */}
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-3">
              <Card className="p-6 bg-glass-surface border-glass-border backdrop-blur-xl shadow-glass">
                <h3 className="text-lg font-semibold mb-4 text-foreground">
                  Asset Selection
                </h3>
                <AssetSelector
                  selectedSymbol={selectedSymbol}
                  onSymbolChange={setSelectedSymbol}
                  timeframe={timeframe}
                  onTimeframeChange={setTimeframe}
                />
              </Card>
            </div>

            <div className="col-span-12 lg:col-span-3">
              <Card className="p-6 bg-glass-surface border-glass-border backdrop-blur-xl shadow-glass">
                <h3 className="text-lg font-semibold mb-4 text-foreground">
                  Risk Controls
                </h3>
                <RiskControls
                  settings={riskSettings}
                  onChange={setRiskSettings}
                  isActive={isActive}
                />
              </Card>
            </div>

            <div className="col-span-12 lg:col-span-3">
              <Card className="p-6 bg-glass-surface border-glass-border backdrop-blur-xl shadow-glass">
                <h3 className="text-lg font-semibold mb-4 text-foreground">
                  Signal History
                </h3>
                <SignalHistory signals={signals.slice(0, 5)} />
              </Card>
            </div>

            <div className="col-span-12 lg:col-span-3">
              <Card className="p-6 bg-glass-surface border-glass-border backdrop-blur-xl shadow-glass">
                <PredictionPanel
                  digitPredictions={digitPredictions}
                  bandPrediction={bandPrediction}
                  isActive={isAnalyzing}
                  threshold={riskSettings.probabilityThreshold}
                  onGenerateSignal={generateSignal}
                />
              </Card>
            </div>
          </div>

          {/* Second Row - Advanced Analysis Panels */}
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-4">
              <TenSecondPredictionPanel 
                prediction={tenSecondPrediction}
                isAnalyzing={isAnalyzing}
              />
            </div>

            <div className="col-span-12 lg:col-span-4">
              <VolatilityAnalysisPanel 
                analysis={volatilityAnalysis}
                isAnalyzing={isAnalyzing}
              />
            </div>

            <div className="col-span-12 lg:col-span-4">
              <RealtimeAnalysisPanel 
                analysis={realtimeAnalysis}
                isAnalyzing={isAnalyzing}
              />
            </div>
          </div>

          {/* Third Row - Over/Under Analysis and Live Feed */}
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-6">
              <OverUnderAnalysisPanel 
                prediction={bandPrediction}
                isAnalyzing={isAnalyzing}
              />
            </div>

            <div className="col-span-12 lg:col-span-6">
              <Card className="h-full p-6 bg-glass-surface border-glass-border backdrop-blur-xl shadow-glass">
                <LiveFeed
                  symbol={selectedSymbol}
                  ticks={ticks[selectedSymbol] || []}
                  isConnected={isConnected}
                  isAnalyzing={isAnalyzing}
                  features={features}
                />
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
