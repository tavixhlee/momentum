'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface SignalRecord {
  id: string;
  type: string;
  price: number;
  timestamp: number;
}

// 模拟信号历史数据
// 实际应用中应该从数据库或API获取
const mockSignalHistory: SignalRecord[] = [
  {
    id: '1',
    type: 'buy',
    price: 105.23,
    timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000
  },
  {
    id: '2',
    type: 'sell',
    price: 118.45,
    timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000
  },
  {
    id: '3',
    type: 'buy',
    price: 112.78,
    timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000
  }
];

export default function SignalHistory() {
  const [signals, setSignals] = useState<SignalRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 模拟获取信号历史
  useEffect(() => {
    // 模拟API请求延迟
    const timer = setTimeout(() => {
      setSignals(mockSignalHistory);
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (signals.length === 0) {
    return (
      <div className="text-center text-gray-500 p-8">
        暂无信号历史记录
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              时间
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              信号类型
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              价格
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {signals.map((signal) => (
            <tr key={signal.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {format(new Date(signal.timestamp), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  signal.type === 'buy' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {signal.type === 'buy' ? '买入' : '卖出'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${signal.price.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="mt-4 text-center text-sm text-gray-500">
        <p>注意：这是模拟数据，实际应用中应从数据库获取真实信号历史</p>
      </div>
    </div>
  );
} 