/**
 * 刮刮乐动画组件
 * 基于Canvas实现交互式刮刮乐效果
 */

class ScratchCard {
    constructor(canvas, prize, onComplete) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.prize = prize;
        this.onComplete = onComplete;
        
        // 状态管理
        this.isDrawing = false;
        this.scratched = 0;
        this.totalPixels = 0;
        this.isRevealed = false;
        
        // 配置参数
        this.config = {
            scratchRadius: 25,           // 刮开半径
            scratchPercent: 60,          // 自动揭晓阈值（百分比）
            coverColor: ['#4CAF50', '#8BC34A'], // 覆盖层渐变色
            textColor: 'white',           // 覆盖层文字颜色
            prizeBgColor: '#FFE082',      // 中奖层背景色
            prizeTextColor: '#FF6B35',    // 中奖层文字颜色
            enableSound: true,            // 是否启用音效
            enableVibration: true         // 是否启用震动（移动端）
        };
        
        // 初始化
        this.init();
    }
    
    /**
     * 初始化刮刮乐卡片
     */
    init() {
        // 设置画布尺寸
        this.setupCanvas();
        
        // 绘制底层中奖信息
        this.drawPrizeLayer();
        
        // 绘制覆盖层
        this.drawCoverLayer();
        
        // 计算总像素数
        this.calculateTotalPixels();
        
        // 绑定事件
        this.bindEvents();
        
        // 预加载资源
        this.preloadResources();
    }
    
    /**
     * 设置画布尺寸
     */
    setupCanvas() {
        // 获取设备像素比
        const dpr = window.devicePixelRatio || 1;
        
        // 设置实际尺寸
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        // 缩放画布上下文
        this.ctx.scale(dpr, dpr);
        
        // 设置CSS尺寸
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
    }
    
    /**
     * 绘制底层中奖信息
     */
    drawPrizeLayer() {
        const width = this.canvas.width / (window.devicePixelRatio || 1);
        const height = this.canvas.height / (window.devicePixelRatio || 1);
        
        // 绘制背景
        this.ctx.fillStyle = this.config.prizeBgColor;
        this.ctx.fillRect(0, 0, width, height);
        
        // 绘制装饰图案
        this.drawDecorations(width, height);
        
        // 绘制中奖金额
        this.ctx.fillStyle = this.config.prizeTextColor;
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        const prizeText = this.prize.amount === 0 ? '谢谢参与' : `¥${this.prize.amount}`;
        this.ctx.fillText(prizeText, width / 2, height / 2);
        
        // 绘制奖品名称
        if (this.prize.name && this.prize.amount > 0) {
            this.ctx.font = '20px Arial';
            this.ctx.fillStyle = '#666';
            this.ctx.fillText(this.prize.name, width / 2, height / 2 + 40);
        }
        
        // 绘制星星装饰
        this.drawStars(width, height);
    }
    
    /**
     * 绘制装饰图案
     * @param {number} width - 画布宽度
     * @param {number} height - 画布高度
     */
    drawDecorations(width, height) {
        this.ctx.save();
        
        // 绘制彩带效果
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 20 + 10;
            
            this.ctx.fillStyle = `hsla(${Math.random() * 360}, 70%, 60%, 0.3)`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }
    
    /**
     * 绘制星星装饰
     * @param {number} width - 画布宽度
     * @param {number} height - 画布高度
     */
    drawStars(width, height) {
        this.ctx.save();
        this.ctx.fillStyle = '#FFD700';
        
        // 在四个角绘制星星
        const starPositions = [
            { x: 20, y: 20 },
            { x: width - 20, y: 20 },
            { x: 20, y: height - 20 },
            { x: width - 20, y: height - 20 }
        ];
        
        starPositions.forEach(pos => {
            this.drawStar(pos.x, pos.y, 5, 10, 5);
        });
        
        this.ctx.restore();
    }
    
    /**
     * 绘制星星
     * @param {number} cx - 中心X坐标
     * @param {number} cy - 中心Y坐标
     * @param {number} spikes - 星尖数量
     * @param {number} outerRadius - 外半径
     * @param {number} innerRadius - 内半径
     */
    drawStar(cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;
        
        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy - outerRadius);
        
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            this.ctx.lineTo(x, y);
            rot += step;
            
            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            this.ctx.lineTo(x, y);
            rot += step;
        }
        
        this.ctx.lineTo(cx, cy - outerRadius);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    /**
     * 绘制覆盖层
     */
    drawCoverLayer() {
        const width = this.canvas.width / (window.devicePixelRatio || 1);
        const height = this.canvas.height / (window.devicePixelRatio || 1);
        
        // 创建渐变覆盖层
        const gradient = this.ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, this.config.coverColor[0]);
        gradient.addColorStop(1, this.config.coverColor[1]);
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, width, height);
        
        // 添加纹理效果
        this.addTexture(width, height);
        
        // 添加提示文字
        this.addCoverText(width, height);
    }
    
    /**
     * 添加纹理效果
     * @param {number} width - 画布宽度
     * @param {number} height - 画布高度
     */
    addTexture(width, height) {
        this.ctx.save();
        
        // 添加噪点效果
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 2;
            
            this.ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.3})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }
    
    /**
     * 添加覆盖层文字
     * @param {number} width - 画布宽度
     * @param {number} height - 画布高度
     */
    addCoverText(width, height) {
        this.ctx.save();
        
        this.ctx.fillStyle = this.config.textColor;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // 主标题
        this.ctx.font = 'bold 24px Arial';
        this.ctx.fillText('刮开有惊喜', width / 2, height / 2 - 20);
        
        // 副标题
        this.ctx.font = '16px Arial';
        this.ctx.fillText('刮开试试手气', width / 2, height / 2 + 10);
        
        // 小提示
        this.ctx.font = '14px Arial';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.fillText('👆 刮开这里', width / 2, height / 2 + 35);
        
        this.ctx.restore();
    }
    
    /**
     * 计算总像素数
     */
    calculateTotalPixels() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        this.totalPixels = width * height;
    }
    
    /**
     * 绑定事件监听
     */
    bindEvents() {
        // 鼠标事件
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseleave', () => this.stopDrawing());
        
        // 触摸事件（移动端）
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startDrawing(e);
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.draw(e);
        });
        
        this.canvas.addEventListener('touchend', () => {
            this.stopDrawing();
        });
        
        // 防止右键菜单
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
    
    /**
     * 开始绘制
     * @param {Event} e - 事件对象
     */
    startDrawing(e) {
        if (this.isRevealed) return;
        
        this.isDrawing = true;
        this.playSound('start');
        
        // 触发震动反馈（移动端）
        if (this.config.enableVibration && navigator.vibrate) {
            navigator.vibrate(10);
        }
    }
    
    /**
     * 绘制刮开效果
     * @param {Event} e - 事件对象
     */
    draw(e) {
        if (!this.isDrawing || this.isRevealed) return;
        
        const pos = this.getCursorPosition(e);
        if (!pos) return;
        
        // 设置刮开模式
        this.ctx.globalCompositeOperation = 'destination-out';
        
        // 创建刮开的圆形区域
        this.ctx.beginPath();
        this.ctx.arc(pos.x, pos.y, this.config.scratchRadius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 播放刮开音效
        this.playSound('scratch');
        
        // 检查刮开进度
        this.checkProgress();
    }
    
    /**
     * 停止绘制
     */
    stopDrawing() {
        this.isDrawing = false;
    }
    
    /**
     * 获取鼠标/触摸位置
     * @param {Event} e - 事件对象
     * @returns {Object|null} 坐标对象
     */
    getCursorPosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        if (e.touches && e.touches.length > 0) {
            // 触摸事件 - 修复移动端位置计算
            const touch = e.touches[0];
            return {
                x: (touch.clientX - rect.left) * dpr,
                y: (touch.clientY - rect.top) * dpr
            };
        } else if (e.changedTouches && e.changedTouches.length > 0) {
            // 兼容一些移动设备
            const touch = e.changedTouches[0];
            return {
                x: (touch.clientX - rect.left) * dpr,
                y: (touch.clientY - rect.top) * dpr
            };
        } else if (e.offsetX !== undefined) {
            // 鼠标事件
            return {
                x: e.offsetX * dpr,
                y: e.offsetY * dpr
            };
        }
        
        return null;
    }
    
    /**
     * 检查刮开进度
     */
    checkProgress() {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const pixels = imageData.data;
        let transparent = 0;
        
        // 计算透明像素数量
        for (let i = 3; i < pixels.length; i += 4) {
            if (pixels[i] < 128) {
                transparent++;
            }
        }
        
        // 计算刮开百分比
        const percentage = (transparent / this.totalPixels) * 100;
        
        // 达到阈值时自动揭晓
        if (percentage > this.config.scratchPercent && !this.isRevealed) {
            this.reveal();
        }
    }
    
    /**
     * 揭晓结果
     */
    reveal() {
        if (this.isRevealed) return;
        
        this.isRevealed = true;
        
        // 清除整个画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 重新绘制底层中奖信息
        this.drawPrizeLayer();
        
        // 添加揭晓动画效果
        this.addRevealAnimation();
        
        // 播放揭晓音效
        this.playSound('reveal');
        
        // 触发震动反馈
        if (this.config.enableVibration && navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
        }
        
        // 触发完成回调
        if (this.onComplete) {
            setTimeout(() => {
                this.onComplete(this.prize);
            }, 500);
        }
    }
    
    /**
     * 添加揭晓动画效果
     */
    addRevealAnimation() {
        const width = this.canvas.width / (window.devicePixelRatio || 1);
        const height = this.canvas.height / (window.devicePixelRatio || 1);
        
        this.ctx.save();
        
        // 添加闪光效果
        const gradient = this.ctx.createRadialGradient(
            width / 2, height / 2, 0,
            width / 2, height / 2, Math.max(width, height) / 2
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, width, height);
        
        this.ctx.restore();
        
        // 动画淡出
        setTimeout(() => {
            this.drawPrizeLayer();
        }, 200);
    }
    
    /**
     * 预加载资源
     */
    preloadResources() {
        // 预加载音效（如果需要）
        if (this.config.enableSound) {
            this.loadSounds();
        }
    }
    
    /**
     * 加载音效
     */
    loadSounds() {
        // 这里可以加载实际的音效文件
        this.sounds = {
            start: 'scratch-start',
            scratch: 'scratch',
            reveal: 'reveal'
        };
    }
    
    /**
     * 播放音效
     * @param {string} type - 音效类型
     */
    playSound(type) {
        if (!this.config.enableSound) return;
        
        // 这里可以实现实际的音效播放
        // 临时使用Web Audio API创建简单的音效
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            switch (type) {
                case 'start':
                    oscillator.frequency.value = 800;
                    gainNode.gain.value = 0.1;
                    oscillator.start();
                    oscillator.stop(audioContext.currentTime + 0.1);
                    break;
                case 'scratch':
                    oscillator.frequency.value = 600 + Math.random() * 400;
                    gainNode.gain.value = 0.05;
                    oscillator.start();
                    oscillator.stop(audioContext.currentTime + 0.05);
                    break;
                case 'reveal':
                    oscillator.frequency.value = 1200;
                    gainNode.gain.value = 0.15;
                    oscillator.start();
                    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.5);
                    oscillator.stop(audioContext.currentTime + 0.5);
                    break;
            }
        } catch (error) {
            // 音效播放失败不影响主要功能
            console.log('音效播放失败:', error);
        }
    }
    
    /**
     * 销毁实例
     */
    destroy() {
        // 清理事件监听
        this.canvas.removeEventListener('mousedown', this.startDrawing);
        this.canvas.removeEventListener('mousemove', this.draw);
        this.canvas.removeEventListener('mouseup', this.stopDrawing);
        this.canvas.removeEventListener('mouseleave', this.stopDrawing);
        this.canvas.removeEventListener('touchstart', this.startDrawing);
        this.canvas.removeEventListener('touchmove', this.draw);
        this.canvas.removeEventListener('touchend', this.stopDrawing);
        
        // 清理资源
        this.ctx = null;
        this.canvas = null;
        this.onComplete = null;
    }
}

// 导出模块
if (typeof window !== 'undefined') {
    window.ScratchCard = ScratchCard;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ScratchCard };
}