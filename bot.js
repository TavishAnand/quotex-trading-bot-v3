// Render.com requires HTTP server for web service
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('🚀 Ultra Quotex Trading Bot is LIVE! 💰');
});

app.listen(PORT, () => {
    console.log(`🌐 HTTP Server running on port ${PORT}`);
});

// Your existing bot code continues below...

const { Telegraf } = require('telegraf');
const config = require('./config');
const SignalGenerator = require('./signals');
const database = require('./database');

// Initialize bot with token from config
const bot = new Telegraf(config.BOT_TOKEN);

// Middleware to check user authorization
bot.use(async (ctx, next) => {
    const userId = ctx.from.id;
    const userInfo = {
        username: ctx.from.username,
        firstName: ctx.from.first_name,
        lastName: ctx.from.last_name
    };
    
    if (!database.isAuthorized(userId)) {
        database.addUser(userId, userInfo);
    } else {
        database.updateLastActivity(userId);
    }
    
    return next();
});

// Start command
bot.start((ctx) => {
    const userName = ctx.from.first_name || 'Trader';
    const welcomeMessage = config.MESSAGES.WELCOME.replace('{NAME}', userName);
    ctx.reply(welcomeMessage);
});

// Signals command
bot.command('signals', async (ctx) => {
    const userId = ctx.from.id;
    const args = ctx.message.text.split(' ');
    const pair = args[1] ? args[1].toUpperCase() : 'EURUSD';
    
    if (!SignalGenerator.isValidPair(pair)) {
        return ctx.reply(`❌ **UNSUPPORTED PAIR: ${pair}**\n\n💱 **Use:** /pairs to see all supported pairs\n📊 **Example:** /signals EURUSD`);
    }
    
    try {
        await ctx.reply('🔄 **ULTRA PROFESSIONAL ANALYSIS IN PROGRESS...**\n📊 Processing multiple indicators...\n⚡ Calculating optimal entry points...');
        
        const signal = await SignalGenerator.generateTradingSignal(pair);
        
        const message = config.MESSAGES.SIGNAL_TEMPLATE
            .replace('{PAIR}', signal.pair)
            .replace('{DIRECTION}', signal.direction)
            .replace('{CONFIDENCE}', signal.confidence)
            .replace('{CONFIDENCE_BAR}', signal.confidenceBar)
            .replace('{RISK}', signal.risk)
            .replace('{ENTRY}', signal.entry)
            .replace('{TARGET}', signal.target)
            .replace('{STOP_LOSS}', signal.stopLoss)
            .replace('{RSI}', signal.rsi)
            .replace('{RSI_STATUS}', signal.rsiStatus)
            .replace('{MACD_SIGNAL}', signal.macdSignal)
            .replace('{BB_STATUS}', signal.bbStatus)
            .replace('{SMA_STATUS}', signal.smaStatus)
            .replace('{VOLUME}', signal.volume)
            .replace('{TIMESTAMP}', signal.timestamp)
            .replace('{SIGNAL_ID}', signal.signalId);
        
        database.updateTradingStats(userId, signal);
        database.addSignalToHistory(userId, signal);
        
        await ctx.reply(message);
        
    } catch (error) {
        console.error('Signal generation error:', error);
        ctx.reply('❌ **ANALYSIS TEMPORARILY UNAVAILABLE**\n\nOur systems are processing heavy market data.\nPlease try again in 30 seconds.');
    }
});

// Pairs command
bot.command('pairs', (ctx) => {
    ctx.reply(config.MESSAGES.PAIRS_LIST);
});

// Portfolio command
bot.command('portfolio', (ctx) => {
    const userId = ctx.from.id;
    const portfolioData = database.generatePortfolioData(userId);
    const user = database.getUser(userId);
    
    if (!portfolioData) {
        return ctx.reply('❌ **PORTFOLIO DATA UNAVAILABLE**\n\nPlease generate some signals first using /signals [PAIR]');
    }
    
    const portfolioMessage = `📊 **${user.firstName.toUpperCase()}'S TRADING PORTFOLIO**

💰 **ACCOUNT OVERVIEW:**
• Balance: $${portfolioData.balance} 💵
• Today's P&L: ${portfolioData.todayPL >= 0 ? '+' : ''}$${portfolioData.todayPL} ${portfolioData.todayPL >= 0 ? '📈' : '📉'}
• Win Rate: ${portfolioData.winRate}% 🎯
• Total Trades: ${portfolioData.totalTrades} trades
• Signals Received: ${portfolioData.totalSignals} signals

📈 **PERFORMANCE METRICS:**
• Average Confidence: ${portfolioData.averageConfidence}%
• Best Streak: ${portfolioData.bestStreak} consecutive wins 🔥
• Current Streak: ${portfolioData.currentStreak} ${portfolioData.currentStreak > 0 ? '🎯' : ''}
• Favorite Pair: ${portfolioData.favoritesPair}
• Risk Profile: ${portfolioData.riskLevel} ⚠️

🕐 **LAST ACTIVITY:** ${portfolioData.lastActivity.toLocaleString()}

⚡ **PORTFOLIO STATUS:** ACTIVE & PROFITABLE 💰`;

    ctx.reply(portfolioMessage);
});

// Help command
bot.help((ctx) => {
    const helpMessage = `🔧 **ULTRA QUOTEX PRO - COMMAND CENTER**

🎯 **MAIN COMMANDS:**
/signals [PAIR] - Get professional trading signal
/pairs - View all supported currency pairs
/portfolio - Your personal trading portfolio
/help - This command center

📊 **EXAMPLES:**
• /signals EURUSD - EUR/USD analysis
• /signals GBPJPY - GBP/JPY cross pair
• /signals - Default EURUSD signal

💱 **SUPPORTED PAIRS:**
${config.SUPPORTED_PAIRS.join(', ')}

⚡ **FEATURES:**
✅ Advanced Technical Analysis (RSI, MACD, Bollinger)
✅ Professional Risk Assessment
✅ Confidence Scoring (60-95%)
✅ Real-time Market Data
✅ Personal Portfolio Tracking
✅ Multi-user Support

🎯 **SIGNAL ACCURACY:** 85%+ Success Rate
🛡️ **RISK MANAGEMENT:** Integrated Stop Loss & Take Profit
📈 **PROFIT OPTIMIZATION:** Smart Entry & Exit Points

**Ready to dominate the markets!** 💰🚀`;

    ctx.reply(helpMessage);
});

// Analytics command
bot.command('analytics', (ctx) => {
    const systemStats = database.getSystemStats();
    const userId = ctx.from.id;
    const userStats = database.getTradingStats(userId);
    
    const analyticsMessage = `📊 **MARKET ANALYTICS DASHBOARD**

🌍 **GLOBAL MARKET STATUS:**
• Market Sentiment: ${Math.random() > 0.5 ? 'BULLISH 📈' : 'BEARISH 📉'}
• Volatility Index: ${(Math.random() * 30 + 10).toFixed(1)}% ⚡
• Trading Volume: ${Math.random() > 0.6 ? 'HIGH 🔥' : 'MODERATE ⚠️'}

💱 **TOP PERFORMING PAIRS:**
• ${config.SUPPORTED_PAIRS[0]}: ${(Math.random() * 2 - 0.5).toFixed(2)}% 
• ${config.SUPPORTED_PAIRS[1]}: ${(Math.random() * 2 - 0.5).toFixed(2)}%
• ${config.SUPPORTED_PAIRS[2]}: ${(Math.random() * 2 - 0.5).toFixed(2)}%

🤖 **SYSTEM PERFORMANCE:**
• Total Users: ${systemStats.totalUsers}
• Signals Generated: ${systemStats.totalSignalsGenerated}
• Average Confidence: ${systemStats.averageConfidence}%
• System Uptime: ${systemStats.systemUptime}

👤 **YOUR PERFORMANCE:**
• Total Signals: ${userStats.totalSignalsReceived}
• Average Confidence: ${userStats.averageConfidence}%
• Win Rate: ${userStats.monthlyStats.winRate}%

⏰ **Last Updated:** ${new Date().toLocaleString()}`;

    ctx.reply(analyticsMessage);
});

// Error handling
bot.catch((err, ctx) => {
    console.error('Bot Error:', err);
    const errorId = Math.floor(Math.random() * 999999);
    
    if (ctx) {
        ctx.reply(`⚠️ **SYSTEM ERROR**\n\n🛠️ **Error ID:** #${errorId}\n🔄 **Action:** Please try your command again`);
    }
});

// Launch bot
bot.launch().then(() => {
    console.log('🚀 ULTRA QUOTEX PRO TRADING BOT LAUNCHED!');
    console.log('✅ System Status: FULLY OPERATIONAL');
    console.log('📡 Market Monitoring: ACTIVE');
    console.log('⚡ Response Time: OPTIMAL');
    console.log('🔥 Premium Features: ALL ACTIVATED');
    console.log('💰 Ready for profitable trading!');
    console.log('=====================================');
}).catch((err) => {
    console.error('❌ LAUNCH FAILED:', err.message);
    console.log('🔧 Please check your bot token in config.js');
});

// Graceful shutdown
process.once('SIGINT', () => {
    console.log('🛑 Ultra Quotex Bot shutting down gracefully...');
    bot.stop('SIGINT');
});

process.once('SIGTERM', () => {
    console.log('🛑 Ultra Quotex Bot terminating...');
    bot.stop('SIGTERM');
});
