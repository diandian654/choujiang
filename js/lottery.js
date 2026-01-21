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
        
        // 历史记录切换按钮
        const toggleHistoryBtn = document.getElementById('toggle-history');
        if (toggleHistoryBtn) {
            toggleHistoryBtn.addEventListener('click', () => this.toggleHistory());
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
     * 显示自动开奖卡片
     */
    showScratchCard() {
        const wrapper = document.getElementById('scratch-wrapper');
        const canvas = document.getElementById('scratch-canvas');
        const startBtn = document.getElementById('start-lottery');
        const statusText = document.getElementById('lottery-status');
        
        if (wrapper && canvas && startBtn && statusText) {
            // 隐藏开始按钮，显示开奖区域
            startBtn.style.display = 'none';
            wrapper.style.display = 'block';
            statusText.textContent = '正在开奖，请稍候...';
            
            // 创建自动开奖实例
            if (window.AutoRevealCard) {
                const autoReveal = new window.AutoRevealCard(canvas, this.currentPrize, (prize) => {
                    this.onScratchComplete(prize);
                });
                autoReveal.init();
            } else {
                // 如果自动开奖组件未加载，2秒后直接显示结果
                this.startCountdownAndReveal();
            }
        }
    }
    
    /**
     * 开始倒计时并自动开奖
     */
    startCountdownAndReveal() {
        const wrapper = document.getElementById('scratch-wrapper');
        const canvas = document.getElementById('scratch-canvas');
        const statusText = document.getElementById('lottery-status');
        
        if (!wrapper || !canvas || !statusText) return;
        
        // 创建进度条容器
        this.createProgressBar();
        
        // 开始倒计时动画
        this.animateCountdown(canvas);
    }
    
    /**
     * 创建进度条
     */
    createProgressBar() {
        const wrapper = document.getElementById('scratch-wrapper');
        if (!wrapper) return;
        
        // 先清除可能存在的旧进度条
        this.clearProgressBar();
        
        // 创建进度条HTML
        const progressHTML = `
            <div class="countdown-container" id="countdown-container">
                <div class="progress-container">
                    <div class="progress-bar" id="lottery-progress" style="width: 0%"></div>
                </div>
                <div class="progress-text" id="progress-text">正在开奖...</div>
            </div>
        `;
        
        // 在wrapper内插入进度条
        wrapper.insertAdjacentHTML('afterbegin', progressHTML);
    }
    
    /**
     * 清除进度条
     */
    clearProgressBar() {
        const existingContainer = document.getElementById('countdown-container');
        if (existingContainer) {
            existingContainer.remove();
        }
    }
    
    /**
     * 动画倒计时
     * @param {HTMLElement} canvas - Canvas元素
     */
    animateCountdown(canvas) {
        let progress = 0;
        const totalDuration = 2000; // 2秒
        const startTime = Date.now();
        const progressBar = document.getElementById('lottery-progress');
        const progressText = document.getElementById('progress-text');
        const statusText = document.getElementById('lottery-status');
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            progress = Math.min(elapsed / totalDuration, 1);
            
            // 更新进度条
            if (progressBar) {
                progressBar.style.width = `${progress * 100}%`;
            }
            
            // 更新进度文字
            if (progressText) {
                const remaining = Math.ceil((1 - progress) * 2);
                progressText.textContent = remaining > 0 ? `开奖倒计时: ${remaining}秒` : '即将揭晓...';
            }
            
            // 添加Canvas动画
            this.drawCountdownAnimation(canvas, progress);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // 动画结束，显示结果
                this.onCountdownComplete();
            }
        };
        
        animate();
    }
    
    /**
     * 绘制倒计时动画
     * @param {HTMLElement} canvas - Canvas元素
     * @param {number} progress - 进度(0-1)
     */
    drawCountdownAnimation(canvas, progress) {
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const width = canvas.width / dpr;
        const height = canvas.height / dpr;
        
        // 清除画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 确保Canvas本身居中
        canvas.style.margin = '0 auto';
        canvas.style.display = 'block';
        
        // 绘制背景（确保居中）
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#f0f0f0');
        gradient.addColorStop(1, '#ffffff');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // 精确计算中心点
        const centerX = Math.floor(width / 2);
        const centerY = Math.floor(height / 2);
        
        // 绘制旋转的抽奖轮盘（确保居中）
        const radius = Math.min(width, height) * 0.25; // 动态调整半径
        
        // 背景圆（严格居中）
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = '#FFE082';
        ctx.fill();
        
        // 绘制扇形（围绕中心点）
        const colors = ['#FF6B35', '#4CAF50', '#2196F3', '#FF9800', '#9C27B0'];
        const segments = 8;
        
        for (let i = 0; i < segments; i++) {
            const startAngle = (i * Math.PI * 2 / segments) + (progress * Math.PI * 2);
            const endAngle = ((i + 1) * Math.PI * 2 / segments) + (progress * Math.PI * 2);
            
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = colors[i % colors.length];
            ctx.fill();
            
            // 添加边框
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
        }
        
        // 中心圆（严格居中）
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.25, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        
        // 添加闪光效果（居中覆盖）
        if (progress > 0.8) {
            const flashOpacity = (Math.random() * 0.3 + 0.2) * (progress - 0.8) * 5;
            ctx.fillStyle = `rgba(255, 255, 255, ${flashOpacity})`;
            ctx.fillRect(0, 0, width, height);
        }
    }
    
    /**
     * 倒计时完成处理
     */
    onCountdownComplete() {
        const progressText = document.getElementById('progress-text');
        const statusText = document.getElementById('lottery-status');
        
        if (progressText) {
            progressText.textContent = '🎉 开奖揭晓！';
        }
        
        if (statusText) {
            statusText.textContent = '恭喜你获得了奖励！';
        }
        
        // 延迟显示结果
        setTimeout(() => {
            this.showPrizeResult(this.currentPrize);
            this.saveToHistory(this.currentPrize);
        }, 500);
    }
    
    /**
     * 添加开奖动画效果
     * @param {HTMLElement} canvas - Canvas元素
     */
    addRevealAnimation(canvas) {
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const width = canvas.width / dpr;
        const height = canvas.height / dpr;
        
        // 绘制动画背景
        let animationFrame = 0;
        const maxFrames = 120; // 2秒，60fps
        
        const animate = () => {
            if (animationFrame >= maxFrames) {
                // 动画结束，显示结果
                this.drawPrizeBackground(ctx, width, height, this.currentPrize);
                return;
            }
            
            // 清除画布
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // 绘制进度背景
            const progress = animationFrame / maxFrames;
            this.drawAnimatedBackground(ctx, width, height, progress);
            
            animationFrame++;
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    /**
     * 绘制动画背景
     * @param {CanvasRenderingContext2D} ctx - Canvas上下文
     * @param {number} width - 宽度
     * @param {number} height - 高度
     * @param {number} progress - 进度(0-1)
     */
    drawAnimatedBackground(ctx, width, height, progress) {
        // 创建渐变背景
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        const hue = (progress * 360) % 360;
        gradient.addColorStop(0, `hsl(${hue}, 70%, 60%)`);
        gradient.addColorStop(1, `hsl(${(hue + 60) % 360}, 70%, 50%)`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // 添加旋转的圆圈动画
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = 50 + progress * 30;
        
        for (let i = 0; i < 3; i++) {
            const angle = (progress * Math.PI * 2) + (i * Math.PI * 2 / 3);
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            ctx.beginPath();
            ctx.arc(x, y, 20 - i * 5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${0.3 - i * 0.1})`;
            ctx.fill();
        }
        
        // 添加闪烁效果
        if (progress > 0.8) {
            const opacity = (Math.random() * 0.5 + 0.5) * (progress - 0.8) * 5;
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.fillRect(0, 0, width, height);
        }
    }
    
    /**
     * 绘制中奖背景
     * @param {CanvasRenderingContext2D} ctx - Canvas上下文
     * @param {number} width - 宽度
     * @param {number} height - 高度
     * @param {Object} prize - 中奖信息
     */
    drawPrizeBackground(ctx, width, height, prize) {
        // 清除画布
        ctx.clearRect(0, 0, width * (window.devicePixelRatio || 1), height * (window.devicePixelRatio || 1));
        
        // 绘制中奖背景
        const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2);
        gradient.addColorStop(0, '#FFE082');
        gradient.addColorStop(1, '#FFD54F');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // 绘制边框
        ctx.strokeStyle = '#FF6B35';
        ctx.lineWidth = 3;
        ctx.strokeRect(0, 0, width, height);
        
        // 绘制中奖文字
        ctx.fillStyle = '#FF6B35';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const prizeText = prize.amount === 0 ? '谢谢参与' : `¥${prize.amount}`;
        ctx.fillText(prizeText, width / 2, height / 2);
        
        // 绘制奖品名称
        if (prize.name && prize.amount > 0) {
            ctx.font = '20px Arial';
            ctx.fillStyle = '#666';
            ctx.fillText(prize.name, width / 2, height / 2 + 40);
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
     * 切换历史记录显示
     */
    toggleHistory() {
        const container = document.getElementById('history-container');
        const toggleBtn = document.getElementById('toggle-history');
        
        if (container && toggleBtn) {
            if (container.style.display === 'none') {
                // 显示历史记录
                container.style.display = 'block';
                toggleBtn.textContent = '隐藏抽奖历史';
                toggleBtn.classList.remove('btn-secondary');
                toggleBtn.classList.add('btn-primary');
                
                // 更新历史记录显示
                this.updateHistoryDisplay();
            } else {
                // 隐藏历史记录
                container.style.display = 'none';
                toggleBtn.textContent = '查看抽奖历史';
                toggleBtn.classList.remove('btn-primary');
                toggleBtn.classList.add('btn-secondary');
            }
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
                        <div class="probability-input-group">
                            <input type="number" 
                                   class="probability-input" 
                                   data-amount="${prize.amount}"
                                   min="0" 
                                   max="100" 
                                   step="0.5" 
                                   value="${prize.probability}"
                                   placeholder="0">
                            <span class="probability-unit">%</span>
                        </div>
                    </div>
                    <div class="probability-hint">
                        <span>当前: <strong>${prize.probability}%</strong></span>
                    </div>
                </div>
            `;
        });
        
        configsContainer.innerHTML = html;
        
        // 绑定输入框事件
        this.bindInputEvents();
        this.updateTotalProbability();
    }
    
    /**
     * 绑定输入框事件
     */
    bindInputEvents() {
        const inputs = document.querySelectorAll('.probability-input');
        
        inputs.forEach(input => {
            // 输入时实时更新提示
            input.addEventListener('input', (e) => {
                this.handleInputChange(e);
            });
            
            // 失去焦点时验证和保存
            input.addEventListener('blur', (e) => {
                this.handleInputBlur(e);
            });
            
            // 键盘事件支持
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleInputBlur(e);
                }
            });
        });
    }
    
    /**
     * 处理输入变化
     * @param {Event} e - 输入事件
     */
    handleInputChange(e) {
        const amount = parseFloat(e.target.dataset.amount);
        let probability = parseFloat(e.target.value);
        
        // 验证输入值
        if (isNaN(probability) || probability < 0) {
            probability = 0;
        } else if (probability > 100) {
            probability = 100;
        }
        
        // 限制小数位数为1位
        probability = Math.round(probability * 2) / 2;
        
        // 更新输入框显示
        e.target.value = probability;
        
        // 更新提示文字
        this.updateProbabilityHint(amount, probability);
        
        // 更新总计
        this.updateTotalFromInputs();
    }
    
    /**
     * 处理输入框失去焦点
     * @param {Event} e - 失焦事件
     */
    handleInputBlur(e) {
        const amount = parseFloat(e.target.dataset.amount);
        const probability = parseFloat(e.target.value) || 0;
        
        // 验证并修正值
        const validProbability = Math.max(0, Math.min(100, probability));
        e.target.value = validProbability;
        
        // 更新提示
        this.updateProbabilityHint(amount, validProbability);
        
        // 保存到临时配置
        this.saveTemporaryConfig(amount, validProbability);
    }
    
    /**
     * 更新概率提示
     * @param {number} amount - 奖项金额
     * @param {number} probability - 概率值
     */
    updateProbabilityHint(amount, probability) {
        const input = document.querySelector(`.probability-input[data-amount="${amount}"]`);
        if (!input) return;
        
        const hintDiv = input.closest('.prize-config').querySelector('.probability-hint span');
        if (hintDiv) {
            hintDiv.innerHTML = `当前: <strong>${probability}%</strong>`;
        }
    }
    
    /**
     * 保存临时配置
     * @param {number} amount - 奖项金额
     * @param {number} probability - 概率值
     */
    saveTemporaryConfig(amount, probability) {
        if (!this.tempProbabilities) {
            this.tempProbabilities = {};
        }
        this.tempProbabilities[amount] = probability;
    }
    
    /**
     * 从输入框更新总计
     */
    updateTotalFromInputs() {
        const inputs = document.querySelectorAll('.probability-input');
        let total = 0;
        
        inputs.forEach(input => {
            const probability = parseFloat(input.value) || 0;
            total += probability;
        });
        
        // 更新总计显示
        const totalSpan = document.getElementById('total-probability');
        if (totalSpan) {
            totalSpan.textContent = total.toFixed(1);
            
            // 根据是否为100%改变颜色
            if (Math.abs(total - 100) < 0.1) {
                totalSpan.style.color = '#4CAF50';
            } else {
                totalSpan.style.color = '#F44336';
            }
        }
    }
    
    /**
     * 保存所有输入框的值
     */
    saveAllInputValues() {
        try {
            // 获取当前配置
            const prizes = window.prizeConfig.getConfig();
            
            // 更新所有输入框的值到配置中
            const updatedPrizes = prizes.map(prize => {
                const newProbability = this.tempProbabilities ? this.tempProbabilities[prize.amount] : prize.probability;
                return {
                    ...prize,
                    probability: newProbability
                };
            });
            
            // 批量更新配置
            const success = window.prizeConfig.updateConfig(updatedPrizes);
            
            if (success) {
                console.log('配置保存成功');
            }
        } catch (error) {
            console.error('保存配置失败:', error);
            this.showError('保存失败，请重试');
        }
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
        // 先保存所有输入框的值
        this.saveAllInputValues();
        
        // 验证总概率
        const totalSpan = document.getElementById('total-probability');
        const total = parseFloat(totalSpan.textContent) || 0;
        
        if (Math.abs(total - 100) > 0.1) {
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