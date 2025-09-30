module.exports = {
    BOT_TOKEN: process.env.BOT_TOKEN || '8323146827:AAH64Tr8lQQqc8hHJf7yPpW_TuC24GpVzIE',
    
    SUPPORTED_PAIRS: [
        'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD',
        'NZDUSD', 'EURJPY', 'GBPJPY', 'EURGBP', 'AUDJPY', 'CHFJPY'
    ],
    
    INDICATORS: {
        RSI_PERIOD: 14,
        MACD_FAST: 12,
        MACD_SLOW: 26,
        BB_PERIOD: 20,
        SMA_PERIOD: 50
    },
    
    RISK_LEVELS: {
        LOW: { min: 80, emoji: '🟢' },
        MEDIUM: { min: 65, emoji: '🟡' },
        HIGH: { min: 0, emoji: '🔴' }
    },
    
    MESSAGES: {
        WELCOME: `🚀 **ULTRA QUOTEX PRO TRADING BOT** 🚀

Hello {NAME}! Welcome to the most advanced trading bot!

🎯 **KEY FEATURES:**
📊 Advanced Market Analysis (RSI, MACD, Bollinger)
⚡ Real-time Trading Signals  
🎯 Confidence Scoring (60-95%)
💰 Professional Risk Assessment
💱 12+ Currency Pairs
👥 Multi-user Support

**MAIN COMMANDS:**
/signals [PAIR] - Get trading signal
/pairs - View supported pairs
/portfolio - Your trading stats
/help - Complete help menu

**Ready to trade profitably!** 💰`,

        PAIRS_LIST: `💱 **SUPPORTED CURRENCY PAIRS**

🇪🇺🇺🇸 **MAJOR PAIRS:**
• EURUSD - Euro vs US Dollar
• GBPUSD - British Pound vs US Dollar  
• USDJPY - US Dollar vs Japanese Yen
• USDCHF - US Dollar vs Swiss Franc
• AUDUSD - Australian Dollar vs US Dollar
• USDCAD - US Dollar vs Canadian Dollar

🌏 **MINOR PAIRS:**
• NZDUSD - New Zealand Dollar vs US Dollar
• EURJPY - Euro vs Japanese Yen
• GBPJPY - British Pound vs Japanese Yen
• EURGBP - Euro vs British Pound
• AUDJPY - Australian Dollar vs Japanese Yen
• CHFJPY - Swiss Franc vs Japanese Yen

**Usage:** /signals [PAIR]
**Example:** /signals EURUSD`,

        SIGNAL_TEMPLATE: `🚀 **{PAIR} PROFESSIONAL ANALYSIS** 🚀

📈 **TRADE SIGNAL:** {DIRECTION}
🎯 **CONFIDENCE:** {CONFIDENCE}% {CONFIDENCE_BAR}
⚠️ **RISK LEVEL:** {RISK}

💰 **TRADE SETUP:**
• Entry: {ENTRY}
• Target: {TARGET}  
• Stop Loss: {STOP_LOSS}

📊 **TECHNICAL ANALYSIS:**
• RSI: {RSI} ({RSI_STATUS})
• MACD: {MACD_SIGNAL}
• Bollinger: {BB_STATUS}
• SMA Trend: {SMA_STATUS}
• Volume: {VOLUME}

🕐 **Generated:** {TIMESTAMP}
🆔 **Signal ID:** #{SIGNAL_ID}

⚡ **EXECUTE WITH PROPER RISK MANAGEMENT!** ⚡`
    }
};
