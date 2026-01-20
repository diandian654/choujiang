# 儿童作业奖励抽奖系统 - 需求文档

## 需求概述
基于纯前端技术栈开发一个轻量级静态抽奖页面应用，专门为孩子完成作业后的奖励抽奖场景设计。

## 核心功能模块

### 1. 抽奖交互模块
**功能描述**：提供完整的抽奖流程体验，从确认作业完成到显示中奖结果
**实现逻辑**：
- 初始状态显示"开始抽奖"按钮，点击前需用户确认"我已完成作业"
- 采用刮刮乐式动画效果，用户通过鼠标/手指滑动覆盖层揭晓结果
- 抽奖完成后显示中奖金额，并记录到历史记录
- 提供"重新抽奖"功能，支持连续抽奖体验

**技术实现**：
```javascript
// 刮刮乐实现示例
class ScratchCard {
  constructor(canvas, callback) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.callback = callback;
    this.isDrawing = false;
    this.initEvents();
  }
  
  initEvents() {
    // 鼠标和触摸事件监听
    this.canvas.addEventListener('mousedown', () => this.isDrawing = true);
    this.canvas.addEventListener('mouseup', () => this.isDrawing = false);
    this.canvas.addEventListener('mousemove', (e) => this.draw(e));
  }
  
  draw(e) {
    if (!this.isDrawing) return;
    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.beginPath();
    this.ctx.arc(e.offsetX, e.offsetY, 20, 0, Math.PI * 2);
    this.ctx.fill();
  }
}
```

### 2. 奖项配置模块
**功能描述**：提供灵活的奖项概率配置功能，通过隐藏入口进入设置页面
**实现逻辑**：
- 页面底部版权文字长按/双击触发设置入口
- 可视化调整8个固定奖项（0元、0.5元、1元、5元、10元、20元、50元、100元）的中奖概率
- 支持概率总和自动校验，确保总和为100%
- 提供保存设置和重置默认比例功能

**技术实现**：
```javascript
// 奖项配置管理
class PrizeConfig {
  constructor() {
    this.defaultPrizes = [
      { amount: 0, probability: 30 },
      { amount: 0.5, probability: 20 },
      { amount: 1, probability: 20 },
      { amount: 5, probability: 15 },
      { amount: 10, probability: 10 },
      { amount: 20, probability: 3 },
      { amount: 50, probability: 1.5 },
      { amount: 100, probability: 0.5 }
    ];
    this.loadConfig();
  }
  
  saveConfig(prizes) {
    localStorage.setItem('prizeConfig', JSON.stringify(prizes));
  }
  
  drawPrize() {
    const random = Math.random() * 100;
    let cumulative = 0;
    for (const prize of this.prizes) {
      cumulative += prize.probability;
      if (random <= cumulative) {
        return prize.amount;
      }
    }
  }
}
```

### 3. 数据存储模块
**功能描述**：管理抽奖历史记录和配置数据的本地持久化存储
**实现逻辑**：
- 使用localStorage存储历史抽奖记录
- 存储用户自定义的奖项概率配置
- 支持数据导出和清空功能

**技术实现**：
```javascript
// 数据存储管理
class DataManager {
  static saveHistory(record) {
    const history = JSON.parse(localStorage.getItem('lotteryHistory') || '[]');
    history.unshift({
      ...record,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('lotteryHistory', JSON.stringify(history.slice(0, 100))); // 保留最近100条
  }
  
  static getHistory() {
    return JSON.parse(localStorage.getItem('lotteryHistory') || '[]');
  }
  
  static clearHistory() {
    localStorage.removeItem('lotteryHistory');
  }
}
```

## 架构技术方案

### 前端架构设计
采用模块化的JavaScript ES6+架构，使用原生DOM API，无第三方框架依赖：

```
项目结构：
├── index.html              # 主页面
├── css/
│   ├── main.css            # 主样式文件
│   └── components.css      # 组件样式
├── js/
│   ├── app.js             # 应用主入口
│   ├── lottery.js         # 抽奖核心逻辑
│   ├── scratch.js         # 刮刮乐组件
│   ├── config.js          # 配置管理
│   └── storage.js         # 数据存储
└── assets/
    └── images/            # 图片资源
```

### 技术选型
- **HTML5**：语义化标签，支持移动端适配
- **CSS3**：Flexbox布局，CSS动画，响应式设计
- **JavaScript ES6+**：模块化、Promise、异步处理
- **Canvas API**：实现刮刮乐效果
- **LocalStorage API**：本地数据持久化

## 影响文件清单

### 新建文件
1. **index.html** - 主页面文件
   - 绝对路径：D:\projectSpace\comateSpace\choujiang\index.html
   - 影响：应用入口，包含所有UI结构

2. **css/main.css** - 主样式文件
   - 绝对路径：D:\projectSpace\comateSpace\choujiang\css\main.css
   - 影响：全局样式、响应式布局

3. **css/components.css** - 组件样式
   - 绝对路径：D:\projectSpace\comateSpace\choujiang\css\components.css
   - 影响：抽奖卡片、按钮、弹窗等组件样式

4. **js/app.js** - 应用主入口
   - 绝对路径：D:\projectSpace\comateSpace\choujiang\js\app.js
   - 影响：应用初始化、事件绑定

5. **js/lottery.js** - 抽奖核心逻辑
   - 绝对路径：D:\projectSpace\comateSpace\choujiang\js\lottery.js
   - 影响：抽奖算法、状态管理

6. **js/scratch.js** - 刮刮乐组件
   - 绝对路径：D:\projectSpace\comateSpace\choujiang\js\scratch.js
   - 影响：刮刮乐动画效果

7. **js/config.js** - 配置管理
   - 绝对路径：D:\projectSpace\comateSpace\choujiang\js\config.js
   - 影响：奖项概率配置

8. **js/storage.js** - 数据存储
   - 绝对路径：D:\projectSpace\comateSpace\choujiang\js\storage.js
   - 影响：历史记录、配置数据持久化

9. **README.md** - 项目说明文档
   - 绝对路径：D:\projectSpace\comateSpace\choujiang\README.md
   - 影响：部署指南、使用说明

## 实现细节

### 刮刮乐动画实现
```javascript
// 刮刮乐完整实现
class ScratchCard {
  constructor(canvas, prize, onComplete) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.prize = prize;
    this.onComplete = onComplete;
    this.scratched = 0;
    this.totalPixels = 0;
    
    this.init();
  }
  
  init() {
    // 设置画布尺寸
    this.canvas.width = 300;
    this.canvas.height = 200;
    
    // 绘制底层中奖信息
    this.drawPrizeLayer();
    
    // 绘制覆盖层
    this.drawCoverLayer();
    
    // 计算总像素数
    this.totalPixels = this.canvas.width * this.canvas.height;
    
    // 绑定事件
    this.bindEvents();
  }
  
  drawPrizeLayer() {
    this.ctx.fillStyle = '#FFE082';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = '#FF6B35';
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(`¥${this.prize}`, this.canvas.width/2, this.canvas.height/2);
  }
  
  drawCoverLayer() {
    // 创建渐变覆盖层
    const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
    gradient.addColorStop(0, '#4CAF50');
    gradient.addColorStop(1, '#8BC34A');
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 添加提示文字
    this.ctx.fillStyle = 'white';
    this.ctx.font = '20px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('刮开有惊喜', this.canvas.width/2, this.canvas.height/2 - 20);
    this.ctx.fillText('刮开试试手气', this.canvas.width/2, this.canvas.height/2 + 10);
  }
  
  bindEvents() {
    // 鼠标事件
    this.canvas.addEventListener('mousedown', () => this.startDrawing());
    this.canvas.addEventListener('mousemove', (e) => this.draw(e));
    this.canvas.addEventListener('mouseup', () => this.stopDrawing());
    this.canvas.addEventListener('mouseleave', () => this.stopDrawing());
    
    // 触摸事件（移动端）
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.startDrawing();
    });
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const mockEvent = {
        offsetX: touch.clientX - rect.left,
        offsetY: touch.clientY - rect.top
      };
      this.draw(mockEvent);
    });
    this.canvas.addEventListener('touchend', () => this.stopDrawing());
  }
  
  startDrawing() {
    this.isDrawing = true;
  }
  
  draw(e) {
    if (!this.isDrawing) return;
    
    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.beginPath();
    this.ctx.arc(e.offsetX, e.offsetY, 25, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.checkProgress();
  }
  
  stopDrawing() {
    this.isDrawing = false;
  }
  
  checkProgress() {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const pixels = imageData.data;
    let transparent = 0;
    
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] < 128) transparent++;
    }
    
    const percentage = (transparent / this.totalPixels) * 100;
    
    if (percentage > 60) {
      this.reveal();
    }
  }
  
  reveal() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawPrizeLayer();
    this.onComplete(this.prize);
  }
}
```

### 移动端适配实现
```css
/* 响应式设计 */
@media (max-width: 768px) {
  .lottery-container {
    padding: 10px;
  }
  
  .scratch-canvas {
    width: 100%;
    max-width: 300px;
    height: 200px;
  }
  
  .prize-amount {
    font-size: 2.5rem;
  }
}

@media (max-width: 480px) {
  .header h1 {
    font-size: 1.8rem;
  }
  
  .btn-primary {
    width: 100%;
    margin: 10px 0;
  }
}
```

## 边界条件与异常处理

### 抽奖算法异常处理
```javascript
class LotteryError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
}

function safeDrawPrize() {
  try {
    // 检查配置完整性
    if (!prizeConfig || !Array.isArray(prizeConfig.prizes)) {
      throw new LotteryError('奖项配置无效', 'INVALID_CONFIG');
    }
    
    // 检查概率总和
    const totalProbability = prizeConfig.prizes.reduce((sum, prize) => sum + prize.probability, 0);
    if (Math.abs(totalProbability - 100) > 0.01) {
      throw new LotteryError('概率总和不等于100%', 'INVALID_PROBABILITY');
    }
    
    return prizeConfig.drawPrize();
  } catch (error) {
    console.error('抽奖异常:', error);
    return 0; // 异常时返回0元
  }
}
```

### 本地存储异常处理
```javascript
function safeLocalStorageSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      // 存储空间不足，清理旧数据
      clearOldHistory();
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (retryError) {
        console.error('存储失败:', retryError);
      }
    }
  }
}
```

## 数据流动路径

### 抽奖流程数据流
```
用户点击"开始抽奖" 
→ 显示确认对话框 
→ 用户确认"我已完成作业" 
→ 生成随机数计算中奖结果 
→ 创建刮刮乐卡片 
→ 用户刮开卡片 
→ 显示中奖结果 
→ 保存到历史记录 
→ 更新UI状态
```

### 配置修改数据流
```
用户长按版权文字 
→ 显示设置页面 
→ 调整奖项概率 
→ 校验概率总和 
→ 保存到localStorage 
→ 更新全局配置 
→ 返回主页面
```

## 预期成果

### 交付物清单
1. **完整的项目文件结构**：可直接本地运行的HTML页面
2. **移动端优化的童趣化UI**：色彩明亮、交互友好
3. **功能完善的抽奖系统**：包含刮刮乐动画和概率配置
4. **详细的项目文档**：README.md包含部署指南
5. **GitHub Pages部署方案**：完整的静态网站部署流程

### 技术指标
- **兼容性**：支持Chrome 60+、Safari 12+、现代移动浏览器
- **性能**：页面加载时间<2秒，动画流畅度>60fps
- **响应式**：完美适配320px-1920px屏幕宽度
- **存储效率**：localStorage使用量<1MB
- **代码质量**：ES6+语法，模块化架构，完整注释

### 用户体验目标
- **易用性**：孩子可独立操作，无复杂学习成本
- **趣味性**：刮刮乐动画增加互动乐趣
- **可靠性**：异常处理完善，避免用户困惑
- **可配置性**：家长可灵活调整奖励策略
