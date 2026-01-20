/**
 * 抽奖核心逻辑模块
 * 负责抽奖流程管理、状态控制和业务逻辑
 */

class LotteryManager {
    constructor() {
        // 抽奖状态枚举
        this.STATE = {
            READY: 'ready',        // 准备状态
            CONFIRMING: 'confirming', // 确认中
            DRAWING: 'drawing',    // 抽奖中
            REVEALING: 'revealing', // 揭晓中
            COMPLETED: 'completed'  // 已完成
        };
        
        // 当前状态
        this.currentState = this.STATE.READY;
        
        // 当前抽奖结果
        this.currentPrize = null;
        
        // 抽奖历史
        this.history = [];
        
        // 事件回调
        this.callbacks = {};
        
        // 初始化
        this.init();
    }
    
    /**
     * 初始化抽奖管理器
     */
    init() {
        // 加载历史记录
        this.loadHistory();
        
        // 绑定全局事件
        this.bindEvents();
        
        // 设置初始状态
        this.updateUI();
    }
    
    /**
     * 加载历史记录
     */
    loadHistory() {
        this.history = DataManager.getHistory();
    }
    
    /**
     * 绑定事件监听
     */
    bindEvents() {
        // 开始抽奖按钮
        const startBtn = document.getElementById('start-lottery');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startLottery());
        }
        
        // 重新抽奖按钮
        const restartBtn = document.getElementById('restart-lottery');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => this.restartLottery());
        }
        
        // 确认对话框按钮
        const confirmYesBtn = document.getElementById('confirm-yes');
        if (confirmYesBtn) {
            confirmYesBtn.addEventListener('click', () => this.confirmLottery());
        }
        
        const confirmNoBtn = document.getElementById('confirm-no');
        if (confirmNoBtn) {
            confirmNoBtn.addEventListener('click', () => this.cancelLottery());
        }
        
        // 清空历史按钮
        const clearHistoryBtn = document.getElementById('clear-history');
        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        }
        
        // 设置入口
        const copyright = document.getElementById('copyright');
        if (copyright) {
            // 长按事件
            let pressTimer;
            copyright.addEventListener('mousedown', () => {
                pressTimer = setTimeout(() => {
                    this.showSettings();
                }, 1500); // 长按1.5秒
            });
            
            copyright.addEventListener('mouseup', () => {
                clearTimeout(pressTimer);
            });
            
            copyright.addEventListener('mouseleave', () => {
                clearTimeout(pressTimer);
            });
            
            // 双击事件
            copyright.addEventListener('dblclick', () => {
                this.showSettings();
            });
            
            // 触摸事件（移动端）
            copyright.addEventListener('touchstart', (e) => {
                pressTimer = setTimeout(() => {
                    this.showSettings();
                }, 1500);
            });
            
            copyright.addEventListener('touchend', () => {
                clearTimeout(pressTimer);
            });
        }
        
        // 设置面板按钮
        const saveSettingsBtn = document.getElementById('save-settings');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        }
        
        const resetSettingsBtn = document.getElementById('reset-settings');
        if (resetSettingsBtn) {
            resetSettingsBtn.addEventListener('click', () => this.resetSettings());
        }
        
        const closeSettingsBtn = document.getElementById('close-settings');
        if (closeSettingsBtn) {
            closeSettingsBtn.addEventListener('click', () => this.hideSettings());
        }
    }
    
    /**
     * 开始抽奖
     */
    startLottery() {
        if (this.currentState !== this.STATE.READY) {
            return;
        }
        
        // 显示确认对话框
        this.showConfirmDialog();
        this.setState(this.STATE.CONFIRMING);
    }
    
    /**
     * 显示确认对话框
     */
    showConfirmDialog() {
        const modal = document.getElementById('confirm-modal');
        if (modal) {
            modal.classList.add('active');
        }
    }
    
    /**
     * 隐藏确认对话框
     */
    hideConfirmDialog() {
        const modal = document.getElementById('confirm-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    }
    
    /**
     * 确认抽奖
     */
    confirmLottery() {
        this.hideConfirmDialog();
        this.performLottery();
    }
    
    /**
     * 取消抽奖
     */
    cancelLottery() {
        this.hideConfirmDialog();
        this.setState(this.STATE.READY);
    }
    
    /**
     * 执行抽奖
     */
    performLottery() {
        this.setState(this.STATE.DRAWING);
        
        try {
            // 生成抽奖结果
            this.currentPrize = window.prizeConfig.drawPrize();
            
            // 更新状态
            this.setState(this.STATE.REVEALING);
            
            // 显示刮刮乐
            this.showScratchCard();
            
        } catch (error) {
            console.error('抽奖失败:', error);
            this.showError('抽奖出现错误，请重试');
            this.setState(this.STATE.READY);
        }
    }
    
    /**
     * 显示刮刮乐卡片
     */
    showScratchCard() {
        const wrapper = document.getElementById('scratch-wrapper');
        const canvas = document.getElementById('scratch-canvas');
        const startBtn = document.getElementById('start-lottery');
        const statusText = document.getElementById('lottery-status');
        
        if (wrapper && canvas && startBtn && statusText) {
            // 隐藏开始按钮，显示刮刮乐
            startBtn.style.display = 'none';
            wrapper.style.display = 'block';
            statusText.textContent = '刮开卡片，看看你的运气！';
            
            // 创建刮刮乐实例
            if (window.ScratchCard) {
                const scratchCard = new window.ScratchCard(canvas, this.currentPrize, (prize) => {
                    this.onScratchComplete(prize);
                });
                scratchCard.init();
            } else {
                // 如果刮刮乐组件未加载，直接显示结果
                this.onScratchComplete(this.currentPrize);
            }
        }
    }
    
    /**
     * 刮刮乐完成回调
     * @param {Object} prize - 中奖结果
     */
    onScratchComplete(prize) {
        this.setState(this.STATE.COMPLETED);
        this.showPrizeResult(prize);
        this.saveToHistory(prize);
    }
    
    /**
     * 显示中奖结果
     * @param {Object} prize - 中奖结果
     */
    showPrizeResult(prize) {
        const wrapper = document.getElementById('scratch-wrapper');
        const resultDiv = document.getElementById('prize-result');
        const amountSpan = document.getElementById('prize-amount');
        const restartBtn = document.getElementById('restart-lottery');
        const statusText = document.getElementById('lottery-status');
        
        if (wrapper && resultDiv && amountSpan && restartBtn && statusText) {
            // 隐藏刮刮乐，显示结果
            wrapper.style.display = 'none';
            resultDiv.style.display = 'block';
            restartBtn.style.display = 'inline-block';
            
            // 设置中奖金额
            amountSpan.textContent = prize.amount === 0 ? '谢谢参与' : `¥${prize.amount}`;
            amountSpan.style.color = prize.color || '#FF6B35';
            
            // 更新状态文字
            if (prize.amount === 0) {
                statusText.textContent = '很遗憾，下次继续加油！';
            } else {
                statusText.textContent = '恭喜你获得了奖励！';
            }
        }
    }
    
    /**
     * 保存到历史记录
     * @param {Object} prize - 中奖结果
     */
    saveToHistory(prize) {
        const record = {
            prize: prize.amount,
            name: prize.name,
            color: prize.color,
            timestamp: new Date().toISOString()
        };
        
        const success = DataManager.saveHistory(record);
        if (success) {
            this.loadHistory();
            this.updateHistoryDisplay();
        }
    }
    
    /**
     * 重新抽奖
     */
    restartLottery() {
        this.currentPrize = null;
        this.setState(this.STATE.READY);
        this.updateUI();
    }
    
    /**
     * 设置状态
     * @param {string} newState - 新状态
     */
    setState(newState) {
        this.currentState = newState;
        this.triggerCallback('stateChange', {
            oldState: this.currentState,
            newState: newState
        });
    }
    
    /**
     * 更新UI显示
     */
    updateUI() {
        const startBtn = document.getElementById('start-lottery');
        const restartBtn = document.getElementById('restart-lottery');
        const wrapper = document.getElementById('scratch-wrapper');
        const resultDiv = document.getElementById('prize-result');
        const statusText = document.getElementById('lottery-status');
        
        // 重置到初始状态
        if (startBtn) startBtn.style.display = 'inline-block';
        if (restartBtn) restartBtn.style.display = 'none';
        if (wrapper) wrapper.style.display = 'none';
        if (resultDiv) resultDiv.style.display = 'none';
        if (statusText) statusText.textContent = '准备好接受奖励了吗？';
        
        // 更新历史记录显示
        this.updateHistoryDisplay();
    }
    
    /**
     * 更新历史记录显示
     */
    updateHistoryDisplay() {
        const historyList = document.getElementById('history-list');
        const clearBtn = document.getElementById('clear-history');
        
        if (!historyList) return;
        
        if (this.history.length === 0) {
            historyList.innerHTML = '<p style="color: #999; text-align: center;">暂无抽奖记录</p>';
            if (clearBtn) clearBtn.style.display = 'none';
        } else {
            // 构建历史记录HTML
            let html = '';
            this.history.slice(0, 10).forEach((record, index) => {
                const date = new Date(record.timestamp);
                const timeStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
                const prizeDisplay = record.prize === 0 ? '谢谢参与' : `¥${record.prize}`;
                
                html += `
                    <div class="history-item">
                        <div>
                            <div class="history-time">${timeStr}</div>
                            <div style="font-size: 0.9rem; color: #666;">${record.name || prizeDisplay}</div>
                        </div>
                        <div class="history-amount" style="color: ${record.color || '#FF6B35'}">
                            ${prizeDisplay}
                        </div>
                    </div>
                `;
            });
            
            historyList.innerHTML = html;
            if (clearBtn) clearBtn.style.display = 'inline-block';
        }
    }
    
    /**
     * 清空历史记录
     */
    clearHistory() {
        if (confirm('确定要清空所有抽奖记录吗？')) {
            const success = DataManager.clearHistory();
            if (success) {
                this.history = [];
                this.updateHistoryDisplay();
                this.showMessage('历史记录已清空');
            } else {
                this.showError('清空失败，请重试');
            }
        }
    }
    
    /**
     * 显示设置面板
     */
    showSettings() {
        const panel = document.getElementById('settings-panel');
        if (panel) {
            panel.classList.add('active');
            this.renderSettingsPanel();
        }
    }
    
    /**
     * 隐藏设置面板
     */
    hideSettings() {
        const panel = document.getElementById('settings-panel');
        if (panel) {
            panel.classList.remove('active');
        }
    }
    
    /**
     * 渲染设置面板
     */
    renderSettingsPanel() {
        const configsContainer = document.getElementById('prize-configs');
        if (!configsContainer) return;
        
        const prizes = window.prizeConfig.getDisplayInfo();
        let html = '';
        
        prizes.forEach((prize, index) => {
            html += `
                <div class="prize-config">
                    <div class="prize-label">
                        <span style="color: ${prize.color}">${prize.display}</span>
                        <span class="probability-value">${prize.probability}%</span>
                    </div>
                    <input type="range" 
                           class="probability-slider" 
                           data-amount="${prize.amount}"
                           min="0" 
                           max="100" 
                           step="0.5" 
                           value="${prize.probability}">
                </div>
            `;
        });
        
        configsContainer.innerHTML = html;
        
        // 绑定滑块事件
        this.bindSliderEvents();
        this.updateTotalProbability();
    }
    
    /**
     * 绑定滑块事件
     */
    bindSliderEvents() {
        const sliders = document.querySelectorAll('.probability-slider');
        sliders.forEach(slider => {
            slider.addEventListener('input', (e) => {
                const amount = parseFloat(e.target.dataset.amount);
                const probability = parseFloat(e.target.value);
                
                // 更新显示
                const valueSpan = e.target.parentElement.querySelector('.probability-value');
                if (valueSpan) {
                    valueSpan.textContent = `${probability}%`;
                }
                
                // 更新配置（临时）
                window.prizeConfig.updatePrizeProbability(amount, probability);
                
                // 更新总计
                this.updateTotalProbability();
            });
        });
    }
    
    /**
     * 更新概率总计显示
     */
    updateTotalProbability() {
        const stats = window.prizeConfig.getStatistics();
        const totalSpan = document.getElementById('total-probability');
        if (totalSpan) {
            totalSpan.textContent = stats.totalProbability;
            
            // 根据是否为100%改变颜色
            if (stats.isValid) {
                totalSpan.style.color = '#4CAF50';
            } else {
                totalSpan.style.color = '#F44336';
            }
        }
    }
    
    /**
     * 保存设置
     */
    saveSettings() {
        const stats = window.prizeConfig.getStatistics();
        if (!stats.isValid) {
            this.showError('概率总和不等于100%，请调整后重试');
            return;
        }
        
        try {
            const success = window.prizeConfig.saveConfig();
            if (success) {
                this.showMessage('设置已保存');
                this.hideSettings();
            } else {
                this.showError('保存失败，请重试');
            }
        } catch (error) {
            this.showError('配置验证失败：' + error.message);
        }
    }
    
    /**
     * 重置设置
     */
    resetSettings() {
        if (confirm('确定要重置为默认设置吗？')) {
            const success = window.prizeConfig.resetToDefault();
            if (success) {
                this.showMessage('已重置为默认设置');
                this.renderSettingsPanel();
            } else {
                this.showError('重置失败，请重试');
            }
        }
    }
    
    /**
     * 注册回调函数
     * @param {string} event - 事件名称
     * @param {Function} callback - 回调函数
     */
    on(event, callback) {
        if (!this.callbacks[event]) {
            this.callbacks[event] = [];
        }
        this.callbacks[event].push(callback);
    }
    
    /**
     * 触发回调
     * @param {string} event - 事件名称
     * @param {any} data - 事件数据
     */
    triggerCallback(event, data) {
        if (this.callbacks[event]) {
            this.callbacks[event].forEach(callback => callback(data));
        }
    }
    
    /**
     * 显示消息
     * @param {string} message - 消息内容
     */
    showMessage(message) {
        // 这里可以实现更友好的消息提示
        console.log('Message:', message);
        // 临时使用alert，后续可以替换为更好的UI
        alert(message);
    }
    
    /**
     * 显示错误
     * @param {string} error - 错误信息
     */
    showError(error) {
        console.error('Error:', error);
        // 临时使用alert，后续可以替换为更好的UI
        alert(error);
    }
}

// 创建全局实例
if (typeof window !== 'undefined') {
    window.lotteryManager = new LotteryManager();
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LotteryManager };
}