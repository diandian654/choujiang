/**
 * 数据存储管理模块
 * 负责localStorage的封装和异常处理
 */

class DataManager {
    /**
     * 安全保存数据到localStorage
     * @param {string} key - 存储键名
     * @param {any} value - 要存储的数据
     */
    static saveItem(key, value) {
        try {
            const serializedValue = JSON.stringify(value);
            localStorage.setItem(key, serializedValue);
            return true;
        } catch (error) {
            console.error('保存数据失败:', error);
            
            // 处理存储空间不足的情况
            if (error.name === 'QuotaExceededError') {
                this.handleStorageFull(key, value);
            }
            return false;
        }
    }
    
    /**
     * 安全从localStorage读取数据
     * @param {string} key - 存储键名
     * @param {any} defaultValue - 默认值
     * @returns {any} 读取的数据或默认值
     */
    static getItem(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('读取数据失败:', error);
            return defaultValue;
        }
    }
    
    /**
     * 删除localStorage中的数据
     * @param {string} key - 存储键名
     */
    static removeItem(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('删除数据失败:', error);
            return false;
        }
    }
    
    /**
     * 处理存储空间不足的情况
     * @param {string} key - 当前要保存的键名
     * @param {any} value - 当前要保存的值
     */
    static handleStorageFull(key, value) {
        console.warn('存储空间不足，尝试清理旧数据');
        
        // 清理旧的历史记录（只保留最近50条）
        const history = this.getHistory();
        if (history.length > 50) {
            const recentHistory = history.slice(0, 50);
            this.saveHistory(recentHistory);
            
            // 重试保存
            try {
                localStorage.setItem(key, JSON.stringify(value));
                console.log('清理后保存成功');
            } catch (retryError) {
                console.error('清理后仍然无法保存:', retryError);
                this.showStorageError();
            }
        } else {
            this.showStorageError();
        }
    }
    
    /**
     * 显示存储错误提示
     */
    static showStorageError() {
        // 这里可以添加用户友好的错误提示
        if (typeof window !== 'undefined' && window.app) {
            window.app.showError('存储空间不足，请清理浏览器数据');
        }
    }
    
    /**
     * 保存抽奖历史记录
     * @param {Object} record - 抽奖记录
     */
    static saveHistory(record) {
        const history = this.getHistory();
        
        // 添加时间戳
        const newRecord = {
            ...record,
            timestamp: new Date().toISOString(),
            id: Date.now() // 简单的ID生成
        };
        
        // 插入到数组开头
        history.unshift(newRecord);
        
        // 限制历史记录数量（最多保存100条）
        const limitedHistory = history.slice(0, 100);
        
        return this.saveItem('lotteryHistory', limitedHistory);
    }
    
    /**
     * 获取抽奖历史记录
     * @returns {Array} 历史记录数组
     */
    static getHistory() {
        return this.getItem('lotteryHistory', []);
    }
    
    /**
     * 清空抽奖历史记录
     */
    static clearHistory() {
        return this.removeItem('lotteryHistory');
    }
    
    /**
     * 保存奖项配置
     * @param {Array} prizes - 奖项配置数组
     */
    static savePrizeConfig(prizes) {
        return this.saveItem('prizeConfig', prizes);
    }
    
    /**
     * 获取奖项配置
     * @param {Array} defaultConfig - 默认配置
     * @returns {Array} 奖项配置数组
     */
    static getPrizeConfig(defaultConfig) {
        const config = this.getItem('prizeConfig', defaultConfig);
        
        // 验证配置的完整性
        if (Array.isArray(config) && config.length > 0) {
            // 检查每个配置项是否包含必要的字段
            const isValid = config.every(item => 
                item && 
                typeof item.amount !== 'undefined' && 
                typeof item.probability !== 'undefined'
            );
            
            if (isValid) {
                return config;
            }
        }
        
        // 如果配置无效，返回默认配置
        return defaultConfig;
    }
    
    /**
     * 获取应用统计信息
     * @returns {Object} 统计信息
     */
    static getStatistics() {
        const history = this.getHistory();
        const stats = {
            totalLotteries: history.length,
            totalAmount: 0,
            averageAmount: 0,
            prizeDistribution: {}
        };
        
        if (history.length > 0) {
            let totalAmount = 0;
            
            history.forEach(record => {
                const amount = parseFloat(record.prize) || 0;
                totalAmount += amount;
                
                // 统计各奖项分布
                const amountStr = amount.toString();
                stats.prizeDistribution[amountStr] = (stats.prizeDistribution[amountStr] || 0) + 1;
            });
            
            stats.totalAmount = totalAmount.toFixed(2);
            stats.averageAmount = (totalAmount / history.length).toFixed(2);
        }
        
        return stats;
    }
    
    /**
     * 导出数据
     * @returns {Object} 可导出的数据
     */
    static exportData() {
        return {
            history: this.getHistory(),
            config: this.getItem('prizeConfig'),
            statistics: this.getStatistics(),
            exportTime: new Date().toISOString()
        };
    }
    
    /**
     * 导入数据
     * @param {Object} data - 要导入的数据
     * @returns {boolean} 导入是否成功
     */
    static importData(data) {
        try {
            if (data.history && Array.isArray(data.history)) {
                this.saveItem('lotteryHistory', data.history);
            }
            
            if (data.config && Array.isArray(data.config)) {
                this.savePrizeConfig(data.config);
            }
            
            return true;
        } catch (error) {
            console.error('导入数据失败:', error);
            return false;
        }
    }
}

// 导出模块（支持多种模块系统）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataManager;
} else if (typeof window !== 'undefined') {
    window.DataManager = DataManager;
}