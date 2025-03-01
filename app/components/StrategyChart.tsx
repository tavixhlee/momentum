'use client';

import { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

// 注册Chart.js组件
Chart.register(...registerables);

interface PricePoint {
  timestamp: number;
  price: number;
}

interface StrategyData {
  signal: string;
  shortMA: number;
  longMA: number;
  price: number;
  timestamp: number;
}

export default function StrategyChart() {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [strategyData, setStrategyData] = useState<StrategyData | null>(null);
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);

  // 获取历史价格数据
  const fetchPriceHistory = async () => {
    try {
      const response = await fetch('/api/solana/history');
      
      if (!response.ok) {
        throw new Error('获取历史价格数据失败');
      }
      
      const data = await response.json();
      setPriceHistory(data.data);
    } catch (err) {
      console.error('获取历史价格数据错误:', err);
      setError('获取历史价格数据失败');
    }
  };

  // 获取策略数据
  const fetchStrategyData = async () => {
    try {
      const response = await fetch('/api/solana/strategy');
      
      if (!response.ok) {
        throw new Error('获取策略数据失败');
      }
      
      const data = await response.json();
      setStrategyData(data);
    } catch (err) {
      console.error('获取策略数据错误:', err);
      setError('获取策略数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始化图表
  const initChart = () => {
    if (!chartRef.current || !priceHistory.length || !strategyData) return;
    
    // 销毁旧图表
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;
    
    // 准备数据
    const labels = priceHistory.map(point => 
      format(new Date(point.timestamp), 'MM-dd', { locale: zhCN })
    );
    
    const prices = priceHistory.map(point => point.price);
    
    // 计算移动平均线数据
    // 注意：这里简化处理，实际应用中应该从API获取完整的MA数据
    const shortMAData = Array(prices.length).fill(null);
    const longMAData = Array(prices.length).fill(null);
    
    // 最后一个点使用当前策略数据
    shortMAData[shortMAData.length - 1] = strategyData.shortMA;
    longMAData[longMAData.length - 1] = strategyData.longMA;
    
    // 创建图表
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Solana价格',
            data: prices,
            borderColor: '#0ea5e9',
            backgroundColor: 'rgba(14, 165, 233, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            fill: false,
          },
          {
            label: '短期MA',
            data: shortMAData,
            borderColor: '#10b981',
            borderWidth: 2,
            borderDash: [5, 5],
            tension: 0.1,
            fill: false,
            pointRadius: 0,
          },
          {
            label: '长期MA',
            data: longMAData,
            borderColor: '#f59e0b',
            borderWidth: 2,
            borderDash: [3, 3],
            tension: 0.1,
            fill: false,
            pointRadius: 0,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            mode: 'index',
            intersect: false,
          },
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: '价格与移动平均线'
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: '日期'
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: '价格 (USD)'
            }
          }
        }
      }
    });
  };

  // 初始加载
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchPriceHistory(), fetchStrategyData()]);
      } catch (err) {
        console.error('加载数据错误:', err);
      }
    };
    
    loadData();
    
    // 每5分钟刷新一次
    const intervalId = setInterval(() => {
      fetchStrategyData();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  // 当数据变化时更新图表
  useEffect(() => {
    if (priceHistory.length && strategyData) {
      initChart();
    }
  }, [priceHistory, strategyData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-80">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-danger p-4 h-80 flex flex-col justify-center">
        <p>{error}</p>
        <button 
          onClick={() => {
            setLoading(true);
            setError(null);
            Promise.all([fetchPriceHistory(), fetchStrategyData()]);
          }}
          className="mt-4 px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 mx-auto"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="chart-container">
        <canvas ref={chartRef}></canvas>
      </div>
      
      {strategyData && (
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="p-2 bg-gray-100 rounded">
            <div className="text-sm text-gray-600">当前价格</div>
            <div className="font-bold">${strategyData.price.toFixed(2)}</div>
          </div>
          <div className="p-2 bg-gray-100 rounded">
            <div className="text-sm text-gray-600">短期MA</div>
            <div className="font-bold text-success">${strategyData.shortMA.toFixed(2)}</div>
          </div>
          <div className="p-2 bg-gray-100 rounded">
            <div className="text-sm text-gray-600">长期MA</div>
            <div className="font-bold text-warning">${strategyData.longMA.toFixed(2)}</div>
          </div>
        </div>
      )}
      
      {strategyData && (
        <div className="mt-4 p-3 rounded text-center">
          <div className="text-sm text-gray-600">当前信号</div>
          <div className={`text-xl font-bold ${
            strategyData.signal === 'buy' 
              ? 'signal-buy' 
              : strategyData.signal === 'sell' 
                ? 'signal-sell' 
                : 'signal-hold'
          }`}>
            {strategyData.signal === 'buy' 
              ? '买入' 
              : strategyData.signal === 'sell' 
                ? '卖出' 
                : '持有'}
          </div>
        </div>
      )}
    </div>
  );
} 