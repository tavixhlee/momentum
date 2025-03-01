import { NextResponse } from 'next/server';
import axios from 'axios';

// 缓存历史数据
let historyCache: { data: any; timestamp: number } | null = null;
const CACHE_TTL = 30 * 60 * 1000; // 30分钟缓存

export async function GET() {
  try {
    // 如果缓存有效，直接返回缓存数据
    if (historyCache && Date.now() - historyCache.timestamp < CACHE_TTL) {
      return NextResponse.json({ 
        data: historyCache.data,
        timestamp: historyCache.timestamp,
        cached: true 
      });
    }

    // 从CoinGecko获取Solana历史价格数据
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/coins/solana/market_chart',
      {
        params: {
          vs_currency: 'usd',
          days: 30,
          interval: 'daily',
          x_cg_api_key: process.env.COINGECKO_API_KEY || '',
        },
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    const prices = response.data.prices.map((item: [number, number]) => ({
      timestamp: item[0],
      price: item[1]
    }));

    // 更新缓存
    historyCache = { 
      data: prices, 
      timestamp: Date.now() 
    };

    return NextResponse.json({ 
      data: prices,
      timestamp: Date.now(),
      cached: false 
    });
  } catch (error) {
    console.error('获取Solana历史价格失败:', error);
    return NextResponse.json(
      { error: '获取历史价格数据失败' },
      { status: 500 }
    );
  }
} 