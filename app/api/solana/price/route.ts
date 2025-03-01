import { NextResponse } from 'next/server';
import axios from 'axios';

// 缓存价格数据，避免频繁请求API
let priceCache: { price: number; timestamp: number } | null = null;
const CACHE_TTL = 60 * 1000; // 1分钟缓存

export async function GET() {
  try {
    // 如果缓存有效，直接返回缓存数据
    if (priceCache && Date.now() - priceCache.timestamp < CACHE_TTL) {
      return NextResponse.json({ 
        price: priceCache.price,
        timestamp: priceCache.timestamp,
        cached: true 
      });
    }

    // 从CoinGecko获取Solana价格
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price',
      {
        params: {
          ids: 'solana',
          vs_currencies: 'usd',
          include_24hr_change: true,
          x_cg_api_key: process.env.COINGECKO_API_KEY || '',
        },
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    const price = response.data.solana.usd;
    const change24h = response.data.solana.usd_24h_change;
    const timestamp = Date.now();

    // 更新缓存
    priceCache = { price, timestamp };

    return NextResponse.json({ 
      price,
      change24h,
      timestamp,
      cached: false 
    });
  } catch (error) {
    console.error('获取Solana价格失败:', error);
    return NextResponse.json(
      { error: '获取价格数据失败' },
      { status: 500 }
    );
  }
} 