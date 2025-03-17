// pages/index.js
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CurrencyDollarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, WalletIcon, ArrowPathIcon, ChartBarIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const [balance, setBalance] = useState(10000);
  const [cryptos, setCryptos] = useState([
    { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', price: 65432.21, change24h: 2.34, owned: 0, history: [] },
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', price: 3421.78, change24h: -1.23, owned: 0, history: [] },
    { id: 'solana', name: 'Solana', symbol: 'SOL', price: 143.56, change24h: 5.67, owned: 0, history: [] },
    { id: 'cardano', name: 'Cardano', symbol: 'ADA', price: 0.58, change24h: -0.45, owned: 0, history: [] },
  ]);
  const [selectedCrypto, setSelectedCrypto] = useState(cryptos[0]);
  const [buyAmount, setBuyAmount] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [timeframe, setTimeframe] = useState('1D');
  const [tradeHistory, setTradeHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
   
  // Generate random price history for each crypto on mount
  useEffect(() => {
    const generateHistory = (basePrice) => {
      const history = [];
      const now = new Date();
      
      for (let i = 30; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        const randomChange = (Math.random() * 10 - 5) / 100; // Random change between -5% and 5%
        const price = basePrice * (1 + randomChange * (Math.random() + 0.5));
        
        history.push({
          time: date.toISOString(),
          price: price,
          formattedTime: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          formattedDate: date.toLocaleDateString([], { month: 'short', day: 'numeric' }),
        });
      }
      
      return history;
    };
    
    setCryptos(cryptos.map(crypto => ({
      ...crypto,
      history: generateHistory(crypto.price)
    })));
  }, []);
  
  // Update prices every few seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCryptos(prevCryptos => {
        const updated = prevCryptos.map(crypto => {
          // Calculate new price with random change
          const randomChange = (Math.random() * 2 - 1) / 100; // Random change between -1% and 1%
          const newPrice = crypto.price * (1 + randomChange);
          
          // Calculate new 24h change with some randomness
          let newChange = crypto.change24h + (Math.random() * 0.4 - 0.2);
          if (Math.abs(newChange) > 10) newChange = newChange > 0 ? 10 : -10;
          
          // Add new price to history
          const now = new Date();
          const newHistory = [...crypto.history];
          if (newHistory.length > 100) newHistory.shift();
          
          newHistory.push({
            time: now.toISOString(),
            price: newPrice,
            formattedTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            formattedDate: now.toLocaleDateString([], { month: 'short', day: 'numeric' }),
          });
          
          return {
            ...crypto,
            price: newPrice,
            change24h: newChange,
            history: newHistory
          };
        });
        
        // Also update the selected crypto
        const selectedId = selectedCrypto.id;
        const newSelected = updated.find(crypto => crypto.id === selectedId);
        setSelectedCrypto(newSelected);
        
        return updated;
      });
    }, 5000);
    
    return () => clearInterval(interval);
  }, [selectedCrypto]);
  
  const handleBuy = () => {
    if (!buyAmount || isNaN(buyAmount) || parseFloat(buyAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    const amountInUSD = parseFloat(buyAmount);
    
    if (amountInUSD > balance) {
      alert('Insufficient balance');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const cryptoAmount = amountInUSD / selectedCrypto.price;
      
      setCryptos(prevCryptos => {
        return prevCryptos.map(crypto => {
          if (crypto.id === selectedCrypto.id) {
            return { ...crypto, owned: crypto.owned + cryptoAmount };
          }
          return crypto;
        });
      });
      
      setBalance(prevBalance => prevBalance - amountInUSD);
      setBuyAmount('');
      
      const now = new Date();
      setTradeHistory(prev => [
        {
          type: 'BUY',
          crypto: selectedCrypto.symbol,
          amount: cryptoAmount,
          price: selectedCrypto.price,
          total: amountInUSD,
          date: now.toLocaleString()
        },
        ...prev
      ]);
      
      setIsLoading(false);
    }, 1000);
  };
  
  const handleSell = () => {
    if (!sellAmount || isNaN(sellAmount) || parseFloat(sellAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    const cryptoAmount = parseFloat(sellAmount);
    const ownedAmount = selectedCrypto.owned;
    
    if (cryptoAmount > ownedAmount) {
      alert(`You don't have enough ${selectedCrypto.symbol}`);
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const amountInUSD = cryptoAmount * selectedCrypto.price;
      
      setCryptos(prevCryptos => {
        return prevCryptos.map(crypto => {
          if (crypto.id === selectedCrypto.id) {
            return { ...crypto, owned: crypto.owned - cryptoAmount };
          }
          return crypto;
        });
      });
      
      setBalance(prevBalance => prevBalance + amountInUSD);
      setSellAmount('');
      
      const now = new Date();
      setTradeHistory(prev => [
        {
          type: 'SELL',
          crypto: selectedCrypto.symbol,
          amount: cryptoAmount,
          price: selectedCrypto.price,
          total: amountInUSD,
          date: now.toLocaleString()
        },
        ...prev
      ]);
      
      setIsLoading(false);
    }, 1000);
  };
  
  // Calculate total portfolio value
  const portfolioValue = balance + cryptos.reduce((total, crypto) => {
    return total + (crypto.owned * crypto.price);
  }, 0);
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };
  
  // Format crypto amount
  const formatCryptoAmount = (value) => {
    if (value < 0.001) return value.toFixed(8);
    if (value < 1) return value.toFixed(4);
    return value.toFixed(2);
  };
  
  // Get chart data based on timeframe
  const getChartData = () => {
    if (!selectedCrypto?.history) return [];
    
    let data = [...selectedCrypto.history];
    
    switch (timeframe) {
      case '1H':
        data = data.slice(-12); // Last 12 5-minute intervals
        break;
      case '1D':
        data = data.slice(-24); // Last 24 hours
        break;
      case '1W':
        data = data.filter((_, index) => index % 4 === 0); // Every 4th point
        break;
      case '1M':
        data = data.filter((_, index) => index % 8 === 0); // Every 8th point
        break;
      default:
        break;
    }
    
    return data;
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg p-4 sticky top-0 z-10">
  <div className="container mx-auto flex justify-between items-center">
    <h1 className="text-2xl font-bold flex items-center text-blue-400">
      <ChartBarIcon className="h-6 w-6 mr-2 text-blue-400" />
      Blackdog
    </h1>
    <div className="flex items-center space-x-4">
      <div className="flex items-center bg-gray-700 rounded-lg px-3 py-2 shadow-sm">
        <WalletIcon className="h-5 w-5 mr-2 text-green-400" />
        <span className="text-sm font-medium">{formatCurrency(balance)}</span>
      </div>
      <div className="flex items-center bg-gray-700 rounded-lg px-3 py-2 shadow-sm">
        <CurrencyDollarIcon className="h-5 w-5 mr-2 text-blue-400" />
        <span className="text-sm font-medium">{formatCurrency(portfolioValue)}</span>
      </div>
    </div>
  </div>
</header>
      
      {/* Main Content */}
      <main className="container mx-auto p-6 bg-gray-900">
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Left Column - Crypto List */}
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-gray-100">Available Cryptocurrencies</h2>
      <div className="space-y-3">
        {cryptos.map(crypto => (
          <div 
            key={crypto.id} 
            className={`flex justify-between items-center p-4 rounded-lg cursor-pointer transition-all duration-300 ${
              selectedCrypto.id === crypto.id ? 'bg-blue-600 shadow-md' : 'bg-gray-700 hover:bg-gray-600 hover:shadow-sm'
            }`}
            onClick={() => setSelectedCrypto(crypto)}
          >
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-sm font-bold mr-3">
                {crypto.symbol.charAt(0)}
              </div>
              <div>
                <h3 className="font-medium text-gray-100">{crypto.name}</h3>
                <p className="text-xs text-gray-400">{crypto.symbol}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-100">{formatCurrency(crypto.price)}</p>
              <p className={`text-xs ${crypto.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {crypto.change24h >= 0 ? '+' : ''}{crypto.change24h.toFixed(2)}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
    
    {/* Middle Column - Chart and Trading */}
    <div className="lg:col-span-2 space-y-6">
      {/* Chart */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-100">{selectedCrypto.name} ({selectedCrypto.symbol})</h2>
            <div className="flex items-center mt-2">
              <span className="text-3xl font-bold mr-3 text-gray-100">{formatCurrency(selectedCrypto.price)}</span>
              <span className={`flex items-center ${selectedCrypto.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {selectedCrypto.change24h >= 0 ? (
                  <ArrowTrendingUpIcon className="h-5 w-5 mr-1" />
                ) : (
                  <ArrowTrendingDownIcon className="h-5 w-5 mr-1" />
                )}
                {selectedCrypto.change24h >= 0 ? '+' : ''}{selectedCrypto.change24h.toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="flex border border-gray-600 rounded-lg overflow-hidden">
            {['1H', '1D', '1W', '1M'].map(tf => (
              <button
                key={tf}
                className={`px-4 py-2 text-sm font-medium ${
                  timeframe === tf ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                } transition-all duration-200`}
                onClick={() => setTimeframe(tf)}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
        
        <div className="h-80 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={getChartData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="formattedTime" 
                tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                axisLine={{ stroke: '#4B5563' }}
              />
              <YAxis 
                tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                axisLine={{ stroke: '#4B5563' }}
                domain={['dataMin', 'dataMax']}
                tickFormatter={(value) => formatCurrency(value).replace('$', '')}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff' }}
                formatter={(value) => [formatCurrency(value), 'Price']}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#3B82F6" 
                dot={false} 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <ArrowPathIcon className="h-4 w-4" />
          <span>Auto updating every 5 seconds</span>
        </div>
      </div>
      
      {/* Trading Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Buy */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-green-400">Buy {selectedCrypto.symbol}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Amount (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  value={buyAmount}
                  onChange={(e) => setBuyAmount(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div className="flex justify-between text-sm text-gray-300">
              <span>Available</span>
              <span>{formatCurrency(balance)}</span>
            </div>
            
            <div className="flex space-x-2">
              {[25, 50, 75, 100].map(percent => (
                <button
                  key={percent}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg py-2 text-xs hover:bg-gray-600 transition-all duration-200"
                  onClick={() => setBuyAmount((balance * (percent / 100)).toFixed(2))}
                >
                  {percent}%
                </button>
              ))}
            </div>
            
            <div className="flex justify-between text-sm text-gray-300">
              <span>Estimated {selectedCrypto.symbol}</span>
              <span>{buyAmount ? formatCryptoAmount(parseFloat(buyAmount) / selectedCrypto.price) : '0.00'}</span>
            </div>
            
            <button
              className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-lg transition-all duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center shadow-sm"
              onClick={handleBuy}
              disabled={isLoading || !buyAmount || parseFloat(buyAmount) <= 0 || parseFloat(buyAmount) > balance}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Buy'
              )}
            </button>
          </div>
        </div>
        
        {/* Sell */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-red-400">Sell {selectedCrypto.symbol}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Amount ({selectedCrypto.symbol})</label>
              <div className="relative">
                <input
                  type="number"
                  value={sellAmount}
                  onChange={(e) => setSellAmount(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div className="flex justify-between text-sm text-gray-300">
              <span>Available</span>
              <span>{formatCryptoAmount(selectedCrypto.owned)} {selectedCrypto.symbol}</span>
            </div>
            
            <div className="flex space-x-2">
              {[25, 50, 75, 100].map(percent => (
                <button
                  key={percent}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg py-2 text-xs hover:bg-gray-600 transition-all duration-200"
                  onClick={() => setSellAmount((selectedCrypto.owned * (percent / 100)).toFixed(8))}
                >
                  {percent}%
                </button>
              ))}
            </div>
            
            <div className="flex justify-between text-sm text-gray-300">
              <span>Estimated USD</span>
              <span>{sellAmount ? formatCurrency(parseFloat(sellAmount) * selectedCrypto.price) : '$0.00'}</span>
            </div>
            
            <button
              className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 rounded-lg transition-all duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center shadow-sm"
              onClick={handleSell}
              disabled={isLoading || !sellAmount || parseFloat(sellAmount) <= 0 || parseFloat(sellAmount) > selectedCrypto.owned}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Sell'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  {/* Portfolio and Trade History */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
    {/* Portfolio */}
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-gray-100">Your Portfolio</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-gray-100">
          <thead>
            <tr className="text-gray-400 text-sm border-b border-gray-700">
              <th className="pb-3 text-left">Asset</th>
              <th className="pb-3 text-right">Amount</th>
              <th className="pb-3 text-right">Price</th>
              <th className="pb-3 text-right">Value</th>
            </tr>
          </thead>
          <tbody>
            {cryptos.map(crypto => (
              <tr key={crypto.id} className="border-b border-gray-700 hover:bg-gray-700 transition-all duration-200">
                <td className="py-4 flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold mr-3">
                    {crypto.symbol.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{crypto.name}</p>
                    <p className="text-xs text-gray-400">{crypto.symbol}</p>
                  </div>
                </td>
                <td className="py-4 text-right">
                  {formatCryptoAmount(crypto.owned)}
                </td>
                <td className="py-4 text-right">
                  {formatCurrency(crypto.price)}
                </td>
                <td className="py-4 text-right">
                  {formatCurrency(crypto.owned * crypto.price)}
                </td>
              </tr>
            ))}
            <tr className="bg-gray-700">
              <td colSpan="3" className="py-4 pl-3 font-semibold">
                Total Portfolio Value
              </td>
              <td className="py-4 text-right font-semibold">
                {formatCurrency(portfolioValue)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    {/* Trade History */}
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-gray-100">Trade History</h2>
      {tradeHistory.length > 0 ? (
        <div className="overflow-y-auto max-h-80">
          <table className="w-full text-gray-100">
            <thead>
              <tr className="text-gray-400 text-sm border-b border-gray-700">
                <th className="pb-3 text-left">Type</th>
                <th className="pb-3 text-left">Asset</th>
                <th className="pb-3 text-right">Amount</th>
                <th className="pb-3 text-right">Price</th>
                <th className="pb-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {tradeHistory.map((trade, index) => (
                <tr key={index} className="border-b border-gray-700 hover:bg-gray-700 transition-all duration-200">
                  <td className="py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      trade.type === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {trade.type}
                    </span>
                  </td>
                  <td className="py-4">{trade.crypto}</td>
                  <td className="py-4 text-right">{formatCryptoAmount(trade.amount)}</td>
                  <td className="py-4 text-right">{formatCurrency(trade.price)}</td>
                  <td className="py-4 text-right">{formatCurrency(trade.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <p>No trades yet</p>
        </div>
      )}
    </div>
  </div>
</main>
      
      {/* Footer */}
      <footer className="bg-gray-800 p-4 mt-6">
        <div className="container mx-auto text-center text-gray-400 text-sm">
          <p>CryptoTrade Simulator &copy; {new Date().getFullYear()}</p>
          <p className="mt-1">This is a simulated trading platform for educational purposes only.</p>
        </div>
      </footer>
    </div>
  );
}

// styles/globals.css
// Add this to your globals.css file for Tailwind CSS
// @tailwind base;
// @tailwind components;
// @tailwind utilities;

// package.json dependency example
// "dependencies": {
//   "next": "12.3.1",
//   "react": "18.2.0",
//   "react-dom": "18.2.0",
//   "recharts": "^2.1.16",
//   "@heroicons/react": "^2.0.13"
// }

// tailwind.config.js
// module.exports = {
//   content: [
//     "./pages/**/*.{js,ts,jsx,tsx}",
//     "./components/**/*.{js,ts,jsx,tsx}",
//   ],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// }