class TechnicalIndicators {
    // RSI Calculation (Relative Strength Index)
    static calculateRSI(closes, period = 14) {
        if (closes.length < period + 1) return 50;
        
        const gains = [];
        const losses = [];
        
        for (let i = 1; i < closes.length; i++) {
            const change = closes[i] - closes[i - 1];
            gains.push(change > 0 ? change : 0);
            losses.push(change < 0 ? Math.abs(change) : 0);
        }
        
        const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
        const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;
        
        if (avgLoss === 0) return 100;
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    }
    
    // MACD Calculation (Moving Average Convergence Divergence)
    static calculateMACD(closes, fastPeriod = 12, slowPeriod = 26) {
        const emaFast = this.calculateEMA(closes, fastPeriod);
        const emaSlow = this.calculateEMA(closes, slowPeriod);
        
        const macdLine = emaFast[emaFast.length - 1] - emaSlow[emaSlow.length - 1];
        const signal = macdLine > 0 ? 'BULLISH 📈' : 'BEARISH 📉';
        
        return { value: macdLine, signal };
    }
    
    // EMA Calculation (Exponential Moving Average)
    static calculateEMA(closes, period) {
        if (closes.length === 0) return [0];
        
        const k = 2 / (period + 1);
        const ema = [closes[0]];
        
        for (let i = 1; i < closes.length; i++) {
            ema.push(closes[i] * k + ema[i - 1] * (1 - k));
        }
        
        return ema;
    }
    
    // Bollinger Bands Calculation
    static calculateBollingerBands(closes, period = 20, multiplier = 2) {
        if (closes.length < period) return { status: 'NEUTRAL', upper: 0, lower: 0 };
        
        const recentPrices = closes.slice(-period);
        const sma = recentPrices.reduce((a, b) => a + b, 0) / period;
        
        const variance = recentPrices.reduce((acc, val) => acc + Math.pow(val - sma, 2), 0) / period;
        const stdDev = Math.sqrt(variance);
        
        const upper = sma + (stdDev * multiplier);
        const lower = sma - (stdDev * multiplier);
        const current = closes[closes.length - 1];
        
        let status;
        if (current > upper) status = 'OVERBOUGHT 🔴';
        else if (current < lower) status = 'OVERSOLD 🟢';
        else status = 'NEUTRAL 🟡';
        
        return { status, upper, lower, middle: sma };
    }
    
    // Simple Moving Average
    static calculateSMA(closes, period = 50) {
        if (closes.length < period) return closes[closes.length - 1] || 0;
        
        const recentPrices = closes.slice(-period);
        return recentPrices.reduce((a, b) => a + b, 0) / period;
    }
    
    // Volume Analysis
    static analyzeVolume() {
        // Simulate volume data (in real implementation, get from API)
        const baseVolume = Math.random() * 5000000 + 1000000;
        const volumeChange = (Math.random() - 0.5) * 1000000;
        return Math.round(baseVolume + volumeChange);
    }
    
    // Generate realistic price history
    static generatePriceHistory(basePrice, length = 50) {
        const prices = [basePrice];
        let trend = Math.random() > 0.5 ? 1 : -1;
        
        for (let i = 1; i < length; i++) {
            // Add trend and random noise
            let change = (trend * Math.random() * 0.0005) + ((Math.random() - 0.5) * 0.001);
            
            // Occasionally reverse trend
            if (Math.random() < 0.1) trend *= -1;
            
            const newPrice = prices[i - 1] + change;
            prices.push(Math.max(0.0001, newPrice)); // Ensure positive prices
        }
        
        return prices;
    }
    
    // Get base price for currency pair
    static getBasePrice(pair) {
        const basePrices = {
            'EURUSD': 1.0850,
            'GBPUSD': 1.2650,
            'USDJPY': 149.50,
            'AUDUSD': 0.6750,
            'USDCAD': 1.3550,
            'USDCHF': 0.9150,
            'NZDUSD': 0.6250,
            'EURGBP': 0.8580,
            'EURJPY': 161.50,
            'GBPJPY': 189.30,
            'AUDJPY': 100.25,
            'CHFJPY': 163.80
        };
        
        const basePrice = basePrices[pair] || 1.0000;
        // Add realistic market fluctuation
        const fluctuation = (Math.random() - 0.5) * 0.01;
        return basePrice + fluctuation;
    }
    
    // RSI Status interpretation
    static getRSIStatus(rsi) {
        if (rsi > 70) return 'OVERBOUGHT 🔴';
        if (rsi < 30) return 'OVERSOLD 🟢';
        if (rsi > 50) return 'BULLISH 📈';
        return 'BEARISH 📉';
    }
    
    // SMA Trend Status
    static getSMATrendStatus(currentPrice, sma) {
        const difference = ((currentPrice - sma) / sma) * 100;
        
        if (difference > 1) return 'STRONG BULLISH 🔥';
        if (difference > 0) return 'BULLISH 📈';
        if (difference > -1) return 'BEARISH 📉';
        return 'STRONG BEARISH ❄️';
    }
}

module.exports = TechnicalIndicators;
