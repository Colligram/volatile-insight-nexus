import { useState, useEffect, useCallback, useRef } from 'react';
import { DerivTick, DerivMessage, VolatilityIndex, MarketStatus } from '@/types/deriv';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';

// Mock Deriv WebSocket for demo - replace with actual WebSocket in production
const DEMO_MODE = true;
const DERIV_WS_URL = 'wss://ws.binaryws.com/websockets/v3?app_id=1089';

export function useDerivWebSocket() {
  const [ticks, setTicks] = useState<Record<string, DerivTick[]>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [marketStatus, setMarketStatus] = useState<MarketStatus>({
    status: 'normal',
    zScore: 0,
    message: 'Market conditions normal',
    timestamp: Date.now(),
  });

  const wsRef = useRef<WebSocket | null>(null);
  const subscriptionsRef = useRef<Set<string>>(new Set());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const demoIntervalRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  // Demo tick generator for development
  const generateDemoTick = useCallback((symbol: VolatilityIndex): DerivTick => {
    const basePrice = {
      'R_10': 100.0,
      'R_10_1S': 100.0,
      'R_25': 250.0,
      'R_25_1S': 250.0,
      'R_50': 500.0,
      'R_50_1S': 500.0,
      'R_75': 750.0,
      'R_75_1S': 750.0,
      'R_100': 1000.0,
      'R_100_1S': 1000.0,
    }[symbol] || 500.0;

    const volatility = symbol.includes('1S') ? 0.02 : 0.01;
    const randomChange = (Math.random() - 0.5) * volatility * basePrice;
    const price = Math.max(basePrice + randomChange, basePrice * 0.5);
    const lastDigit = Math.floor(price * 10) % 10;

    return {
      id: uuidv4(),
      symbol,
      timestamp: Date.now(),
      price,
      lastDigit,
      raw: { quote: price, epoch: Date.now() / 1000 },
    };
  }, []);

  const addTick = useCallback((tick: DerivTick) => {
    setTicks(prev => {
      const symbolTicks = prev[tick.symbol] || [];
      const newTicks = [...symbolTicks, tick].slice(-100); // Keep last 100 ticks
      return { ...prev, [tick.symbol]: newTicks };
    });

    // Simple market shift detection based on price changes
    setTicks(prev => {
      const symbolTicks = prev[tick.symbol] || [];
      if (symbolTicks.length > 10) {
        const recentTicks = symbolTicks.slice(-10);
        const priceChanges = recentTicks.slice(1).map((t, i) => 
          Math.abs(t.price - recentTicks[i].price)
        );
        const avgChange = priceChanges.reduce((sum, change) => sum + change, 0) / priceChanges.length;
        const stdDev = Math.sqrt(
          priceChanges.reduce((sum, change) => sum + Math.pow(change - avgChange, 2), 0) / priceChanges.length
        );
        const zScore = stdDev > 0 ? (avgChange - stdDev) / stdDev : 0;

        setMarketStatus({
          status: Math.abs(zScore) > 3 ? 'shift' : 'normal',
          zScore,
          message: Math.abs(zScore) > 3 ? 'High volatility detected' : 'Market conditions normal',
          timestamp: Date.now(),
        });
      }
      return prev;
    });
  }, []);

  const connectWebSocket = useCallback(() => {
    if (DEMO_MODE) {
      setIsConnected(true);
      toast({
        title: "Demo Mode Active",
        description: "Using simulated Deriv data for demonstration",
      });
      return;
    }

    try {
      wsRef.current = new WebSocket(DERIV_WS_URL);
      
      wsRef.current.onopen = () => {
        setIsConnected(true);
        setMarketStatus(prev => ({ ...prev, status: 'normal', message: 'Connected to Deriv API' }));
        toast({
          title: "Connected",
          description: "Successfully connected to Deriv WebSocket",
        });

        // Authorize with demo token (would use env variable in production)
        if (wsRef.current) {
          wsRef.current.send(JSON.stringify({
            authorize: 'YOUR_DEMO_TOKEN_HERE'
          }));
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data: DerivMessage = JSON.parse(event.data);
          
          if (data.tick) {
            const tick: DerivTick = {
              id: data.tick.id,
              symbol: data.tick.symbol as VolatilityIndex,
              timestamp: data.tick.epoch * 1000,
              price: data.tick.quote,
              lastDigit: Math.floor(data.tick.quote * 10) % 10,
              raw: data.tick,
            };
            addTick(tick);
          }

          if (data.error) {
            toast({
              title: "API Error",
              description: data.error.message,
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        setMarketStatus(prev => ({ ...prev, status: 'disconnected', message: 'Connection lost' }));
        
        // Auto-reconnect with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, Math.random()), 30000);
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, delay);
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to Deriv API",
          variant: "destructive",
        });
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setMarketStatus(prev => ({ ...prev, status: 'disconnected', message: 'Connection failed' }));
    }
  }, [toast, addTick]);

  const subscribe = useCallback((symbol: VolatilityIndex) => {
    subscriptionsRef.current.add(symbol);

    if (DEMO_MODE) {
      // Start demo tick generation
      if (demoIntervalRef.current) {
        clearInterval(demoIntervalRef.current);
      }
      
      demoIntervalRef.current = setInterval(() => {
        subscriptionsRef.current.forEach(sym => {
          const tick = generateDemoTick(sym as VolatilityIndex);
          addTick(tick);
        });
      }, symbol.includes('1S') ? 1000 : 2000); // 1s or 2s intervals

      return;
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        ticks: symbol,
        subscribe: 1
      }));
    }
  }, [generateDemoTick, addTick]);

  const unsubscribe = useCallback((symbol: VolatilityIndex) => {
    subscriptionsRef.current.delete(symbol);

    if (DEMO_MODE && subscriptionsRef.current.size === 0) {
      if (demoIntervalRef.current) {
        clearInterval(demoIntervalRef.current);
        demoIntervalRef.current = undefined;
      }
      return;
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        forget_all: 'ticks'
      }));
    }
  }, []);

  const reconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    connectWebSocket();
  }, [connectWebSocket]);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (demoIntervalRef.current) {
        clearInterval(demoIntervalRef.current);
      }
    };
  }, [connectWebSocket]);

  return {
    ticks,
    isConnected,
    marketStatus,
    subscribe,
    unsubscribe,
    reconnect,
  };
}