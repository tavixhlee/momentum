'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface PriceData {
  price: number;
  change24h: number;
  timestamp: number;
}

export default function PriceDisplay() {
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // 获取价格数据
  const fetchPriceData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/solana/price');
      
      if (!response.ok) {
        throw new Error('获取价格数据失败');
      }
      
      const data = await response.json();
      setPriceData(data);
      setLastUpdated(formatDistanceToNow(new Date(data.timestamp), { addSuffix: true, locale: zhCN }));
      setError(null);
    } catch (err) {
      setError('获取价格数据失败');
      console.error('获取价格数据错误:', err);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载和定时刷新
  useEffect(() => {
    fetchPriceData();
    
    // 每60秒刷新一次
    const intervalId = setInterval(fetchPriceData, 60000);
    
    // 清理定时器
    return () => clearInterval(intervalId);
  }, []);

  // 更新"最后更新"文本
  useEffect(() => {
    if (priceData) {
      const updateTextInterval = setInterval(() => {
        setLastUpdated(formatDistanceToNow(new Date(priceData.timestamp), { addSuffix: true, locale: zhCN }));
      }, 10000);
      
      return () => clearInterval(updateTextInterval);
    }
  }, [priceData]);

  if (loading && !priceData) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-danger p-4">
        <p>{error}</p>
        <button 
          onClick={fetchPriceData}
          className="mt-2 px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div>
      {priceData && (
        <>
          <div className="flex flex-col items-center">
            <div className="text-4xl font-bold mb-2">
              ${priceData.price.toFixed(2)}
            </div>
            <div className={`text-lg font-semibold ${priceData.change24h >= 0 ? 'text-success' : 'text-danger'}`}>
              {priceData.change24h >= 0 ? '↑' : '↓'} {Math.abs(priceData.change24h).toFixed(2)}%
            </div>
            <div className="text-sm text-gray-500 mt-2">
              最后更新: {lastUpdated}
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-2 gap-4">
            <button 
              onClick={fetchPriceData}
              className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 text-sm"
            >
              刷新
            </button>
            <a 
              href="https://www.coingecko.com/en/coins/solana" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-center text-sm"
            >
              查看详情
            </a>
          </div>
        </>
      )}
    </div>
  );
} 