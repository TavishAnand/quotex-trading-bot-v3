const TechnicalIndicators = require('./indicators');
const config = require('./config');

class SignalGenerator {
    static async generateTradingSignal(pair) {
        try {
            const basePrice = TechnicalIndicators.getBasePrice(pair);
            const priceHistory = TechnicalIndicators.generatePriceHistory(basePrice, 100);
            const currentPrice = priceHistory[priceHistory.length - 1];
            
            const rsi = TechnicalIndicators.calculateRSI(priceHistory, config.INDICATORS.RSI_PERIOD);
            const macd = TechnicalIndicators.calculateMACD(priceHistory, config.INDICATORS.MACD_FAST, config.INDICATORS.MACD_SLOW);
            const bb = TechnicalIndicators.calculateBollingerBands(priceHistory, config.INDICATORS.BB_PERIOD);
            const sma = TechnicalIndicators.calculateSMA(priceHistory, config.INDICATORS.SMA_PERIOD);
            const volume = TechnicalIndicators.analyzeVolume();
            
            const signalAnalysis = this.analyzeMultipleIndicators(rsi, macd, bb, currentPrice, sma);
            const tradeLevels = this.calculateTradeLevels(currentPrice, signalAnalysis.direction, pair);
            
            return {
                pair: pair,
                direction: signalAnalysis.direction,
                confidence: signalAnalysis.confidence,
                risk: this.calculateRiskLevel(signalAnalysis.confidence),
                entry: tradeLevels.entry,
                target: tradeLevels.target,
                stopLoss: tradeLevels.stopLoss,
                rsi: rsi.toFixed(1),
                rsiStatus: TechnicalIndicators.getRSIStatus(rsi),
                macdSignal: macd.signal,
                bbStatus: bb.status,
                smaStatus: TechnicalIndicators.getSMATrendStatus(currentPrice, sma),
                volume: volume.toLocaleString(),
                signalId: this.generateSignalId(),
                timestamp: new Date().toLocaleString(),
                confidenceBar: this.generateConfidenceBar(signalAnalysis.confidence)
            };
            
        } catch (error) {
            console.error('Signal generation error:', error);
            throw new Error('Unable to generate trading signal');
        }
    }
    
    static analyzeMultipleIndicators(rsi, macd, bb, currentPrice, sma) {
        let bullishScore = 0;
        let bearishScore = 0;
        
        if (rsi < 30) bullishScore += 25;
        else if (rsi > 70) bearishScore += 25;
        else if (rsi > 50) bullishScore += 10;
        else bearishScore += 10;
        
        if (macd.value > 0) bullishScore += 20;
        else bearishScore += 20;
        
        if (bb.status === 'OVERSOLD 🟢') bullishScore += 15;
        else if (bb.status === 'OVERBOUGHT 🔴') bearishScore += 15;
        else {
            bullishScore += 7;
            bearishScore += 7;
        }
        
        if (currentPrice > sma) bullishScore += 20;
        else bearishScore += 20;
        
        const momentum = Math.random() * 10;
        if (Math.random() > 0.5) bullishScore += momentum;
        else bearishScore += momentum;
        
        const volatility = Math.random() * 10;
        Math.random() > 0.5 ? bullishScore += volatility : bearishScore += volatility;
        
        const totalScore = bullishScore + bearishScore;
        const winningScore = Math.max(bullishScore, bearishScore);
        const confidence = Math.round((winningScore / totalScore) * 100);
        const adjustedConfidence = Math.min(95, Math.max(60, confidence));
        
        return {
            direction: bullishScore > bearishScore ? 'HIGHER ⬆️' : 'LOWER ⬇️',
            confidence: adjustedConfidence,
            bullishScore: bullishScore,
            bearishScore: bearishScore
        };
    }
    
    static calculateTradeLevels(currentPrice, direction, pair) {
        const pipValue = this.getPipValue(pair);
        const isHigher = direction === 'HIGHER ⬆️';
        
        const entryAdjustment = (Math.random() - 0.5) * pipValue * 2;
        const entry = currentPrice + entryAdjustment;
        
        const targetPips = Math.random() * 15 + 15;
        const target = isHigher ? 
            entry + (targetPips * pipValue) : 
            entry - (targetPips * pipValue);
        
        const stopLossPips = Math.random() * 7 + 8;
        const stopLoss = isHigher ? 
            entry - (stopLossPips * pipValue) : 
            entry + (stopLossPips * pipValue);
        
        return {
            entry: entry.toFixed(this.getDecimalPlaces(pair)),
            target: target.toFixed(this.getDecimalPlaces(pair)),
            stopLoss: stopLoss.toFixed(this.getDecimalPlaces(pair))
        };
    }
    
    static getPipValue(pair) {
        if (pair.includes('JPY')) {
            return 0.01;
        }
        return 0.0001;
    }
    
    static getDecimalPlaces(pair) {
        return pair.includes('JPY') ? 3 : 5;
    }
    
    static calculateRiskLevel(confidence) {
        const riskLevels = config.RISK_LEVELS;
        
        if (confidence >= riskLevels.LOW.min) return `LOW RISK ${riskLevels.LOW.emoji}`;
        if (confidence >= riskLevels.MEDIUM.min) return `MEDIUM RISK ${riskLevels.MEDIUM.emoji}`;
        return `HIGH RISK ${riskLevels.HIGH.emoji}`;
    }
    
    static generateSignalId() {
        return Math.floor(Math.random() * 999999) + 100000;
    }
    
    static generateConfidenceBar(confidence) {
        const filledBars = Math.floor(confidence / 10);
        return '█'.repeat(filledBars) + '░'.repeat(10 - filledBars);
    }
    
    static isValidPair(pair) {
        return config.SUPPORTED_PAIRS.includes(pair.toUpperCase());
    }
}

module.exports = SignalGenerator;
