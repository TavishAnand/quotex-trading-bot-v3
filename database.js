const config = require('./config');

class UserDatabase {
    constructor() {
        // In-memory user database (in production, use real database)
        this.users = new Map();
        this.tradingStats = new Map();
        this.signalHistory = [];
        
        // Initialize with empty authorized users from config
        this.authorizedUsers = new Set(config.AUTHORIZED_USERS);
    }
    
    // User Management
    addUser(userId, userInfo = {}) {
        const userData = {
            id: userId,
            username: userInfo.username || `user_${userId}`,
            firstName: userInfo.firstName || 'Trader',
            joinDate: new Date(),
            isActive: true,
            totalSignals: 0,
            lastActivity: new Date(),
            preferences: {
                favoritesPairs: [],
                riskLevel: 'MEDIUM',
                notifications: true
            },
            ...userInfo
        };
        
        this.users.set(userId, userData);
        this.authorizedUsers.add(userId);
        this.initializeTradingStats(userId);
        
        console.log(`✅ User added: ${userData.firstName} (${userId})`);
        return userData;
    }
    
    removeUser(userId) {
        if (this.users.has(userId)) {
            const user = this.users.get(userId);
            this.users.delete(userId);
            this.authorizedUsers.delete(userId);
            this.tradingStats.delete(userId);
            
            console.log(`❌ User removed: ${user.firstName} (${userId})`);
            return true;
        }
        return false;
    }
    
    getUser(userId) {
        return this.users.get(userId);
    }
    
    getAllUsers() {
        return Array.from(this.users.values());
    }
    
    isAuthorized(userId) {
        return this.authorizedUsers.has(userId);
    }
    
    updateLastActivity(userId) {
        if (this.users.has(userId)) {
            this.users.get(userId).lastActivity = new Date();
        }
    }
    
    // Trading Statistics
    initializeTradingStats(userId) {
        const stats = {
            totalSignalsReceived: 0,
            totalTrades: 0,
            winningTrades: 0,
            losingTrades: 0,
            totalProfit: 0,
            totalLoss: 0,
            bestPair: 'EURUSD',
            worstPair: 'EURUSD',
            averageConfidence: 0,
            riskProfile: 'MODERATE',
            joinDate: new Date(),
            lastTrade: null,
            streak: {
                current: 0,
                best: 0,
                type: 'none' // 'win' or 'loss'
            },
            monthlyStats: {
                trades: 0,
                profit: 0,
                winRate: 0
            },
            favoriteTimeframe: '1H',
            totalRiskTaken: 0
        };
        
        this.tradingStats.set(userId, stats);
        return stats;
    }
    
    updateTradingStats(userId, signalData, tradeResult = null) {
        if (!this.tradingStats.has(userId)) {
            this.initializeTradingStats(userId);
        }
        
        const stats = this.tradingStats.get(userId);
        stats.totalSignalsReceived++;
        stats.lastTrade = new Date();
        
        // Update confidence average
        const totalConfidence = stats.averageConfidence * (stats.totalSignalsReceived - 1) + signalData.confidence;
        stats.averageConfidence = Math.round(totalConfidence / stats.totalSignalsReceived);
        
        // Update user activity
        this.updateLastActivity(userId);
        this.users.get(userId).totalSignals = stats.totalSignalsReceived;
        
        // If trade result is provided, update win/loss stats
        if (tradeResult) {
            stats.totalTrades++;
            if (tradeResult.isWin) {
                stats.winningTrades++;
                stats.totalProfit += tradeResult.profit || 0;
                
                // Update streak
                if (stats.streak.type === 'win') {
                    stats.streak.current++;
                } else {
                    stats.streak.current = 1;
                    stats.streak.type = 'win';
                }
            } else {
                stats.losingTrades++;
                stats.totalLoss += tradeResult.loss || 0;
                
                // Update streak
                if (stats.streak.type === 'loss') {
                    stats.streak.current++;
                } else {
                    stats.streak.current = 1;
                    stats.streak.type = 'loss';
                }
            }
            
            // Update best streak
            if (stats.streak.current > stats.streak.best) {
                stats.streak.best = stats.streak.current;
            }
            
            // Update monthly stats
            stats.monthlyStats.trades++;
            stats.monthlyStats.profit += (tradeResult.profit || 0) - (tradeResult.loss || 0);
            stats.monthlyStats.winRate = Math.round((stats.winningTrades / stats.totalTrades) * 100);
        }
        
        this.tradingStats.set(userId, stats);
        return stats;
    }
    
    getTradingStats(userId) {
        return this.tradingStats.get(userId) || this.initializeTradingStats(userId);
    }
    
    // Signal History
    addSignalToHistory(userId, signalData) {
        const historyEntry = {
            userId,
            signalId: signalData.signalId,
            pair: signalData.pair,
            direction: signalData.direction,
            confidence: signalData.confidence,
            risk: signalData.risk,
            timestamp: new Date(),
            isExecuted: false,
            result: null
        };
        
        this.signalHistory.push(historyEntry);
        
        // Keep only last 1000 signals to prevent memory issues
        if (this.signalHistory.length > 1000) {
            this.signalHistory = this.signalHistory.slice(-1000);
        }
        
        return historyEntry;
    }
    
    getUserSignalHistory(userId, limit = 10) {
        return this.signalHistory
            .filter(signal => signal.userId === userId)
            .slice(-limit)
            .reverse();
    }
    
    // User Preferences
    updateUserPreferences(userId, preferences) {
        if (this.users.has(userId)) {
            const user = this.users.get(userId);
            user.preferences = { ...user.preferences, ...preferences };
            this.users.set(userId, user);
            return user.preferences;
        }
        return null;
    }
    
    getUserPreferences(userId) {
        const user = this.users.get(userId);
        return user ? user.preferences : null;
    }
    
    // Analytics
    getSystemStats() {
        const totalUsers = this.users.size;
        const activeUsers = Array.from(this.users.values())
            .filter(user => user.isActive).length;
        
        const totalSignalsGenerated = this.signalHistory.length;
        const todaySignals = this.signalHistory
            .filter(signal => {
                const today = new Date();
                const signalDate = new Date(signal.timestamp);
                return signalDate.toDateString() === today.toDateString();
            }).length;
        
        // Calculate average confidence across all signals
        const averageConfidence = this.signalHistory.length > 0 ?
            Math.round(this.signalHistory.reduce((sum, signal) => sum + signal.confidence, 0) / this.signalHistory.length) : 0;
        
        // Most popular pairs
        const pairFrequency = {};
        this.signalHistory.forEach(signal => {
            pairFrequency[signal.pair] = (pairFrequency[signal.pair] || 0) + 1;
        });
        
        const mostPopularPair = Object.keys(pairFrequency).length > 0 ?
            Object.keys(pairFrequency).reduce((a, b) => pairFrequency[a] > pairFrequency[b] ? a : b) : 'EURUSD';
        
        return {
            totalUsers,
            activeUsers,
            totalSignalsGenerated,
            todaySignals,
            averageConfidence,
            mostPopularPair,
            systemUptime: this.getUptime(),
            lastSignal: this.signalHistory.length > 0 ? this.signalHistory[this.signalHistory.length - 1].timestamp : null
        };
    }
    
    getUptime() {
        // Simulate uptime (in real app, track from start time)
        const uptimeHours = Math.floor(Math.random() * 720) + 1; // 1-720 hours
        return `${uptimeHours}h ${Math.floor(Math.random() * 60)}m`;
    }
    
    // Generate portfolio data for user
    generatePortfolioData(userId) {
        const stats = this.getTradingStats(userId);
        const user = this.getUser(userId);
        
        if (!user || !stats) return null;
        
        // Generate realistic portfolio data
        const balance = 5000 + Math.random() * 15000; // $5k - $20k
        const todayPL = (Math.random() - 0.3) * 500; // -$150 to +$350 bias
        const winRate = stats.totalTrades > 0 ? 
            Math.round((stats.winningTrades / stats.totalTrades) * 100) : 
            75 + Math.random() * 20; // 75-95% if no trades
        
        return {
            balance: balance.toFixed(2),
            todayPL: todayPL.toFixed(2),
            totalTrades: stats.totalTrades,
            winRate,
            totalSignals: stats.totalSignalsReceived,
            averageConfidence: stats.averageConfidence,
            bestStreak: stats.streak.best,
            currentStreak: stats.streak.current,
            favoritesPair: stats.bestPair,
            riskLevel: stats.riskProfile,
            lastActivity: user.lastActivity
        };
    }
}

// Create singleton instance
const database = new UserDatabase();

module.exports = database;
