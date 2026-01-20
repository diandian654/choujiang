/**
 * 应用主入口文件
 * 负责应用初始化、全局配置和错误处理
 */

class LotteryApp {
    constructor() {
        this.version = '1.0.0';
        this.isInitialized = false;
        this.modules = {};
        
        // 应用配置
        this.config = {
            debug: false,              // 调试模式
            enableAnalytics: false,     // 启用统计
            enablePWA: true,           // 启用PWA功能
            maxHistoryItems: 100,       // 最大历史记录数
            animationDuration: 300,     // 动画持续时间
            vibrationDuration: 50      // 震动持续时间
        };
        
        // 错误处理
        this.errorHandler = new ErrorHandler();
        
        // 初始化
        this.init();
    }
    
    /**
     * 初始化应用
     */
    async init() {
        try {
            console.log('🎉 儿童作业奖励抽奖系统启动中...');
            
            // 检查浏览器兼容性
            this.checkCompatibility();
            
            // 加载配置
            this.loadConfig();
            
            // 初始化模块
            await this.initModules();
            
            // 设置全局错误处理
            this.setupErrorHandling();
            
            // 初始化PWA功能
            this.initPWA();
            
            // 设置状态管理
            this.setupStateManagement();
            
            // 标记初始化完成
            this.isInitialized = true;
            
            console.log('✅ 应用初始化完成');
            
            // 触发初始化完成事件
            this.emit('app:ready');
            
        } catch (error) {
            this.errorHandler.handle(error, '应用初始化失败');
        }
    }
    
    /**
     * 检查浏览器兼容性
     */
    checkCompatibility() {
        const requiredFeatures = [
            'localStorage',
            'Canvas',
            'requestAnimationFrame'
        ];
        
        const missingFeatures = [];
        
        // 检查localStorage
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
        } catch (e) {
            missingFeatures.push('localStorage');
        }
        
        // 检查Canvas
        const canvas = document.createElement('canvas');
        if (!canvas.getContext) {
            missingFeatures.push('Canvas');
        }
        
        // 检查requestAnimationFrame
        if (!window.requestAnimationFrame) {
            missingFeatures.push('requestAnimationFrame');
        }
        
        if (missingFeatures.length > 0) {
            throw new Error(`浏览器不兼容，缺少以下功能：${missingFeatures.join(', ')}`);
        }
        
        console.log('✅ 浏览器兼容性检查通过');
    }
    
    /**
     * 加载应用配置
     */
    loadConfig() {
        try {
            const savedConfig = localStorage.getItem('appConfig');
            if (savedConfig) {
                const parsedConfig = JSON.parse(savedConfig);
                this.config = { ...this.config, ...parsedConfig };
            }
            
            // 设置调试模式
            if (this.config.debug) {
                console.log('🐛 调试模式已启用');
            }
            
        } catch (error) {
            console.warn('配置加载失败，使用默认配置:', error);
        }
    }
    
    /**
     * 保存应用配置
     */
    saveConfig() {
        try {
            localStorage.setItem('appConfig', JSON.stringify(this.config));
        } catch (error) {
            console.warn('配置保存失败:', error);
        }
    }
    
    /**
     * 初始化模块
     */
    async initModules() {
        try {
            // 等待DOM加载完成
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }
            
            // 初始化数据存储模块
            this.modules.storage = DataManager;
            
            // 初始化配置模块
            if (window.prizeConfig) {
                this.modules.prizeConfig = window.prizeConfig;
            }
            
            // 初始化抽奖管理器
            if (window.lotteryManager) {
                this.modules.lotteryManager = window.lotteryManager;
                
                // 绑定事件监听
                this.bindModuleEvents();
            }
            
            console.log('✅ 模块初始化完成');
            
        } catch (error) {
            throw new Error(`模块初始化失败: ${error.message}`);
        }
    }
    
    /**
     * 绑定模块事件
     */
    bindModuleEvents() {
        if (!this.modules.lotteryManager) return;
        
        // 监听状态变化
        this.modules.lotteryManager.on('stateChange', (data) => {
            this.handleStateChange(data);
        });
        
        // 监听抽奖完成
        this.modules.lotteryManager.on('lotteryComplete', (data) => {
            this.handleLotteryComplete(data);
        });
    }
    
    /**
     * 处理状态变化
     * @param {Object} data - 状态数据
     */
    handleStateChange(data) {
        if (this.config.debug) {
            console.log('🔄 状态变化:', data);
        }
        
        // 更新页面标题
        this.updatePageTitle(data.newState);
        
        // 发送统计数据（如果启用）
        if (this.config.enableAnalytics) {
            this.sendAnalytics('state_change', data);
        }
    }
    
    /**
     * 处理抽奖完成
     * @param {Object} data - 抽奖结果
     */
    handleLotteryComplete(data) {
        if (this.config.debug) {
            console.log('🎊 抽奖完成:', data);
        }
        
        // 发送统计数据
        if (this.config.enableAnalytics) {
            this.sendAnalytics('lottery_complete', data);
        }
        
        // 触发庆祝动画
        this.triggerCelebration(data);
    }
    
    /**
     * 更新页面标题
     * @param {string} state - 当前状态
     */
    updatePageTitle(state) {
        const titles = {
            ready: '儿童作业奖励抽奖系统',
            confirming: '确认作业完成',
            drawing: '抽奖中...',
            revealing: '揭晓中...',
            completed: '恭喜中奖！'
        };
        
        document.title = titles[state] || titles.ready;
    }
    
    /**
     * 触发庆祝动画
     * @param {Object} data - 中奖数据
     */
    triggerCelebration(data) {
        if (data.prize.amount > 0) {
            // 创建彩带效果
            this.createConfetti();
        }
    }
    
    /**
     * 创建彩带效果
     */
    createConfetti() {
        // 简单的彩带效果实现
        const colors = ['#FF6B35', '#4CAF50', '#FFE082', '#BA68C8', '#64B5F6'];
        const confettiCount = 50;
        
        for (let i = 0; i < confettiCount; i++) {
            setTimeout(() => {
                this.createConfettiPiece(colors[Math.floor(Math.random() * colors.length)]);
            }, i * 30);
        }
    }
    
    /**
     * 创建单个彩带片
     * @param {string} color - 彩带颜色
     */
    createConfettiPiece(color) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background: ${color};
            left: ${Math.random() * 100}%;
            top: -10px;
            opacity: 1;
            transform: rotate(${Math.random() * 360}deg);
            transition: all 2s ease-out;
            pointer-events: none;
            z-index: 9999;
        `;
        
        document.body.appendChild(confetti);
        
        // 动画
        setTimeout(() => {
            confetti.style.top = '100%';
            confetti.style.opacity = '0';
            confetti.style.transform = `rotate(${Math.random() * 720}deg) translateX(${Math.random() * 200 - 100}px)`;
        }, 100);
        
        // 清理
        setTimeout(() => {
            if (document.body.contains(confetti)) {
                document.body.removeChild(confetti);
            }
        }, 2100);
    }
    
    /**
     * 设置全局错误处理
     */
    setupErrorHandling() {
        // 全局错误监听
        window.addEventListener('error', (event) => {
            this.errorHandler.handle(event.error, '全局错误');
            event.preventDefault();
        });
        
        // Promise错误监听
        window.addEventListener('unhandledrejection', (event) => {
            this.errorHandler.handle(event.reason, 'Promise错误');
            event.preventDefault();
        });
    }
    
    /**
     * 初始化PWA功能
     */
    initPWA() {
        if (!this.config.enablePWA) return;
        
        // 注册Service Worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('✅ Service Worker注册成功:', registration);
                })
                .catch(error => {
                    console.warn('⚠️ Service Worker注册失败:', error);
                });
        }
        
        // 监听应用安装提示
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallPrompt();
        });
    }
    
    /**
     * 显示安装提示
     */
    showInstallPrompt() {
        // 这里可以实现安装提示UI
        console.log('📱 应用可以安装到主屏幕');
    }
    
    /**
     * 设置状态管理
     */
    setupStateManagement() {
        // 监听页面可见性变化
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.handlePageHidden();
            } else {
                this.handlePageVisible();
            }
        });
        
        // 监听页面卸载
        window.addEventListener('beforeunload', () => {
            this.handlePageUnload();
        });
    }
    
    /**
     * 处理页面隐藏
     */
    handlePageHidden() {
        console.log('📱 页面隐藏');
        // 暂停动画、音效等
    }
    
    /**
     * 处理页面可见
     */
    handlePageVisible() {
        console.log('📱 页面可见');
        // 恢复动画、音效等
    }
    
    /**
     * 处理页面卸载
     */
    handlePageUnload() {
        console.log('👋 页面卸载');
        // 保存状态、清理资源
        this.saveConfig();
    }
    
    /**
     * 发送统计数据
     * @param {string} event - 事件名称
     * @param {Object} data - 事件数据
     */
    sendAnalytics(event, data) {
        // 这里可以实现实际的统计发送逻辑
        if (this.config.debug) {
            console.log('📊 统计数据:', { event, data });
        }
    }
    
    /**
     * 显示错误消息
     * @param {string} message - 错误消息
     */
    showError(message) {
        // 创建错误提示UI
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #F44336;
            color: white;
            padding: 12px 24px;
            border-radius: 4px;
            z-index: 10000;
            animation: slideDown 0.3s ease;
            max-width: 80%;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        // 自动移除
        setTimeout(() => {
            if (document.body.contains(errorDiv)) {
                document.body.removeChild(errorDiv);
            }
        }, 3000);
    }
    
    /**
     * 显示成功消息
     * @param {string} message - 成功消息
     */
    showMessage(message) {
        // 创建成功提示UI
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #4CAF50;
            color: white;
            padding: 12px 24px;
            border-radius: 4px;
            z-index: 10000;
            animation: slideDown 0.3s ease;
            max-width: 80%;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        messageDiv.textContent = message;
        
        document.body.appendChild(messageDiv);
        
        // 自动移除
        setTimeout(() => {
            if (document.body.contains(messageDiv)) {
                document.body.removeChild(messageDiv);
            }
        }, 3000);
    }
    
    /**
     * 触发事件
     * @param {string} eventName - 事件名称
     * @param {any} data - 事件数据
     */
    emit(eventName, data = null) {
        const event = new CustomEvent(eventName, { detail: data });
        document.dispatchEvent(event);
    }
    
    /**
     * 获取应用信息
     * @returns {Object} 应用信息
     */
    getInfo() {
        return {
            version: this.version,
            isInitialized: this.isInitialized,
            config: this.config,
            modules: Object.keys(this.modules)
        };
    }
}

/**
 * 错误处理器
 */
class ErrorHandler {
    constructor() {
        this.errors = [];
        this.maxErrors = 50;
    }
    
    /**
     * 处理错误
     * @param {Error} error - 错误对象
     * @param {string} context - 错误上下文
     */
    handle(error, context = '未知错误') {
        const errorInfo = {
            message: error.message || error,
            stack: error.stack,
            context: context,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        // 记录错误
        this.errors.push(errorInfo);
        
        // 限制错误记录数量
        if (this.errors.length > this.maxErrors) {
            this.errors = this.errors.slice(-this.maxErrors);
        }
        
        // 输出到控制台
        console.error(`❌ ${context}:`, error);
        
        // 显示用户友好的错误提示
        if (window.app) {
            window.app.showError(this.getUserFriendlyMessage(error));
        }
    }
    
    /**
     * 获取用户友好的错误消息
     * @param {Error} error - 错误对象
     * @returns {string} 用户友好的错误消息
     */
    getUserFriendlyMessage(error) {
        const message = error.message || error.toString();
        
        // 常见错误映射
        const errorMap = {
            'QuotaExceededError': '存储空间不足，请清理浏览器数据',
            'NetworkError': '网络连接失败，请检查网络设置',
            'TypeError': '操作失败，请重试',
            'localStorage': '数据保存失败，请检查浏览器设置'
        };
        
        for (const [key, value] of Object.entries(errorMap)) {
            if (message.includes(key)) {
                return value;
            }
        }
        
        return '操作失败，请刷新页面重试';
    }
    
    /**
     * 获取错误列表
     * @returns {Array} 错误列表
     */
    getErrors() {
        return [...this.errors];
    }
    
    /**
     * 清空错误记录
     */
    clearErrors() {
        this.errors = [];
    }
}

// 创建全局应用实例
window.app = new LotteryApp();

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LotteryApp, ErrorHandler };
}