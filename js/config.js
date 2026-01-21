/**
 * 奖项配置管理模块
 * 负责奖项概率的默认值、动态管理和验证
 */

class PrizeConfig {
    constructor() {
        // 默认奖项配置
        this.defaultPrizes = [
            { amount: 0, probability: 5, name: '谢谢参与', color: '#CCCCCC' },
            { amount: 0.5, probability: 25, name: '小奖励', color: '#81C784' },
            { amount: 1, probability: 25, name: '鼓励奖', color: '#64B5F6' },
            { amount: 5, probability: 20, name: '进步奖', color: '#FFB74D' },
            { amount: 10, probability: 15, name: '优秀奖', color: '#FF8A65' },
            { amount: 20, probability: 6, name: '特别奖', color: '#BA68C8' },
            { amount: 50, probability: 3, name: '超级奖', color: '#F06292' },
            { amount: 100, probability: 1, name: '大奖', color: '#FFD54F' }
        ];
        
        // 加载用户配置
        this.prizes = this.loadConfig();
        
        // 缓存概率计算数组
        this.probabilityCache = null;
        this.updateProbabilityCache();
    }
    
    /**
     * 从本地存储加载配置
     * @returns {Array} 奖项配置数组
     */
    loadConfig() {
        return DataManager.getPrizeConfig(this.defaultPrizes);
    }
    
    /**
     * 保存配置到本地存储
     * @param {Array} prizes - 奖项配置数组
     * @returns {boolean} 保存是否成功
     */
    saveConfig(prizes = null) {
        const configToSave = prizes || this.prizes;
        
        // 验证配置
        if (!this.validateConfig(configToSave)) {
            throw new Error('配置验证失败：概率总和不等于100%');
        }
        
        const success = DataManager.savePrizeConfig(configToSave);
        if (success) {
            this.prizes = configToSave;
            this.updateProbabilityCache();
        }
        
        return success;
    }
    
    /**
     * 验证配置的有效性
     * @param {Array} prizes - 奖项配置数组
     * @returns {boolean} 配置是否有效
     */
    validateConfig(prizes) {
        if (!Array.isArray(prizes) || prizes.length === 0) {
            return false;
        }
        
        // 检查每个奖项的格式
        for (const prize of prizes) {
            if (!prize || typeof prize.amount === 'undefined' || typeof prize.probability === 'undefined') {
                return false;
            }
            
            if (prize.probability < 0 || prize.probability > 100) {
                return false;
            }
        }
        
        // 检查概率总和
        const totalProbability = prizes.reduce((sum, prize) => sum + prize.probability, 0);
        return Math.abs(totalProbability - 100) < 0.01; // 允许0.01的误差
    }
    
    /**
     * 更新概率缓存数组
     */
    updateProbabilityCache() {
        this.probabilityCache = [];
        let cumulative = 0;
        
        for (const prize of this.prizes) {
            cumulative += prize.probability;
            this.probabilityCache.push({
                amount: prize.amount,
                name: prize.name || `${prize.amount}元`,
                color: prize.color || '#FF6B35',
                max: cumulative
            });
        }
    }
    
    /**
     * 进行抽奖
     * @returns {Object} 抽奖结果
     */
    drawPrize() {
        if (!this.probabilityCache || this.probabilityCache.length === 0) {
            throw new Error('奖项配置未初始化');
        }
        
        // 生成1-100的随机数
        const random = Math.random() * 100;
        
        // 根据概率数组查找中奖奖项
        for (const prize of this.probabilityCache) {
            if (random <= prize.max) {
                return {
                    amount: prize.amount,
                    name: prize.name,
                    color: prize.color,
                    random: random.toFixed(2)
                };
            }
        }
        
        // 默认返回第一个奖项（理论上不应该到达这里）
        return {
            amount: this.probabilityCache[0].amount,
            name: this.probabilityCache[0].name,
            color: this.probabilityCache[0].color,
            random: random.toFixed(2)
        };
    }
    
    /**
     * 获取当前配置
     * @returns {Array} 当前奖项配置
     */
    getConfig() {
        return [...this.prizes]; // 返回副本
    }
    
    /**
     * 重置为默认配置
     * @returns {boolean} 重置是否成功
     */
    resetToDefault() {
        return this.saveConfig(this.defaultPrizes);
    }
    
    /**
     * 更新单个奖项的概率
     * @param {number} amount - 奖项金额
     * @param {number} probability - 新概率
     * @returns {boolean} 更新是否成功
     */
    updatePrizeProbability(amount, probability) {
        const prizeIndex = this.prizes.findIndex(p => p.amount === amount);
        if (prizeIndex === -1) {
            return false;
        }
        
        // 更新概率
        this.prizes[prizeIndex].probability = probability;
        
        // 验证并保存
        return this.validateConfig(this.prizes) && this.saveConfig();
    }
    
    /**
     * 批量更新奖项配置
     * @param {Array} newPrizes - 新的奖项配置数组
     * @returns {boolean} 更新是否成功
     */
    updateConfig(newPrizes) {
        if (!this.validateConfig(newPrizes)) {
            return false;
        }
        
        return this.saveConfig(newPrizes);
    }
    
    /**
     * 获取奖项统计信息
     * @returns {Object} 统计信息
     */
    getStatistics() {
        const totalProbability = this.prizes.reduce((sum, prize) => sum + prize.probability, 0);
        
        return {
            totalPrizes: this.prizes.length,
            totalProbability: totalProbability.toFixed(2),
            prizes: this.prizes.map(prize => ({
                amount: prize.amount,
                name: prize.name || `${prize.amount}元`,
                probability: prize.probability,
                color: prize.color || '#FF6B35'
            })),
            isValid: Math.abs(totalProbability - 100) < 0.01
        };
    }
    
    /**
     * 获取奖项展示信息
     * @returns {Array} 格式化的奖项展示信息
     */
    getDisplayInfo() {
        return this.prizes.map(prize => ({
            amount: prize.amount,
            name: prize.name || `${prize.amount}元`,
            probability: prize.probability,
            color: prize.color || '#FF6B35',
            display: prize.amount === 0 ? '谢谢参与' : `¥${prize.amount}`
        }));
    }
    
    /**
     * 模拟抽奖测试
     * @param {number} times - 测试次数
     * @returns {Object} 测试结果
     */
    simulateDraw(times = 1000) {
        const results = {};
        const prizes = this.getDisplayInfo();
        
        // 初始化结果统计
        prizes.forEach(prize => {
            results[prize.display] = 0;
        });
        
        // 执行模拟抽奖
        for (let i = 0; i < times; i++) {
            const result = this.drawPrize();
            const display = result.amount === 0 ? '谢谢参与' : `¥${result.amount}`;
            results[display]++;
        }
        
        // 计算百分比
        const percentages = {};
        for (const [key, count] of Object.entries(results)) {
            percentages[key] = ((count / times) * 100).toFixed(2);
        }
        
        return {
            totalTimes: times,
            results: results,
            percentages: percentages,
            theoretical: this.prizes.map(prize => ({
                name: prize.amount === 0 ? '谢谢参与' : `¥${prize.amount}`,
                probability: prize.probability
            }))
        };
    }
}

// 创建全局实例
if (typeof window !== 'undefined') {
    window.prizeConfig = new PrizeConfig();
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PrizeConfig };
}