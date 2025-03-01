import { NextResponse } from 'next/server';
import axios from 'axios';
import { SMA } from 'technicalindicators';
import { sendNotification } from '@/app/lib/notification';

// 缓存策略结果
let strategyCache: { 
  signal: string; 
  shortMA: number; 
  longMA: number; 
  price: number;
  timestamp: number 
} | null = null;
const CACHE_TTL = 15 * 60 * 1000; // 15分钟缓存

// 上一个信号状态
let lastSignal: string | null = null;

export async function GET() {
  try {
    const currentTime = Date.now();
    
    // 如果缓存有效，直接返回缓存数据
    if (strategyCache && currentTime - strategyCache.timestamp < CACHE_TTL) {
      return NextResponse.json({ 
        ...strategyCache,
        cached: true 
      });
    }

    // 获取历史价格数据
    const historyResponse = await axios.get('/api/solana/history');
    const priceData = historyResponse.data.data.map((item: any) => item.price);
    
    // 获取当前价格
    const priceResponse = await axios.get('/api/solana/price');
    const currentPrice = priceResponse.data.price;
    
    // 计算移动平均线
    const shortPeriod = parseInt(process.env.SHORT_MA_PERIOD || '9');
    const longPeriod = parseInt(process.env.LONG_MA_PERIOD || '21');
    const threshold = parseFloat(process.env.SIGNAL_THRESHOLD || '0.02');
    
    // 添加当前价格到数据中
    const allPrices = [...priceData, currentPrice];
    
    // 计算短期MA
    const shortMA = SMA.calculate({
      period: shortPeriod,
      values: allPrices
    }).pop() || 0;
    
    // 计算长期MA
    const longMA = SMA.calculate({
      period: longPeriod,
      values: allPrices
    }).pop() || 0;
    
    // 计算信号
    let signal = 'hold';
    if (shortMA > longMA * (1 + threshold)) {
      signal = 'buy';
    } else if (shortMA < longMA * (1 - threshold)) {
      signal = 'sell';
    }
    
    // 检查信号变化并发送通知
    if (lastSignal !== null && lastSignal !== signal) {
      await sendNotification({
        type: signal,
        price: currentPrice,
        shortMA,
        longMA,
        timestamp: currentTime
      });
    }
    
    // 更新上一个信号
    lastSignal = signal;
    
    // 更新缓存
    strategyCache = {
      signal,
      shortMA,
      longMA,
      price: currentPrice,
      timestamp: currentTime
    };
    
    return NextResponse.json({
      ...strategyCache,
      cached: false
    });
  } catch (error) {
    console.error('计算策略失败:', error);
    return NextResponse.json(
      { error: '计算策略失败' },
      { status: 500 }
    );
  }
} 
