import PriceDisplay from './components/PriceDisplay';
import StrategyChart from './components/StrategyChart';
import SignalHistory from './components/SignalHistory';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Solana动量交易策略</h1>
          <p className="text-gray-600 mt-2">基于移动平均线(MA)的动量策略，自动监控买卖信号</p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 价格显示 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">当前价格</h2>
              <PriceDisplay />
            </div>
          </div>
          
          {/* 策略图表 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">价格与移动平均线</h2>
              <StrategyChart />
            </div>
          </div>
          
          {/* 信号历史 */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">信号历史</h2>
              <SignalHistory />
            </div>
          </div>
        </div>
        
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Solana动量交易策略 | 数据来源: CoinGecko</p>
          <p className="mt-1">免责声明: 本应用仅供参考，不构成投资建议。交易加密货币存在风险，请谨慎决策。</p>
        </footer>
      </div>
    </main>
  );
} 