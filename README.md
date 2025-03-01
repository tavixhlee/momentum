# Solana动量交易策略

基于移动平均线(MA)的Solana动量交易策略，当出现买卖信号时自动发送通知。

## 功能特点

- 实时监控Solana价格
- 基于短期和长期移动平均线的动量策略
- 当出现买入或卖出信号时发送通知
- 支持Telegram和电子邮件通知
- 价格和信号可视化图表
- 部署在Vercel上

## 安装与设置

1. 克隆仓库
```bash
git clone https://github.com/yourusername/solana-momentum-strategy.git
cd solana-momentum-strategy
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
复制`.env.local.example`文件为`.env.local`并填写必要的配置：
- Solana RPC URL
- 通知设置（Telegram或电子邮件）
- 策略参数

4. 运行开发服务器
```bash
npm run dev
```

5. 构建生产版本
```bash
npm run build
```

## 部署到Vercel

1. 安装Vercel CLI
```bash
npm install -g vercel
```

2. 部署
```bash
vercel
```

## 策略说明

该策略基于短期和长期移动平均线(MA)的交叉来生成买卖信号：

- 当短期MA从下方穿过长期MA时，生成买入信号
- 当短期MA从上方穿过长期MA时，生成卖出信号
- 可以通过环境变量调整MA周期和信号阈值

## 许可证

MIT 