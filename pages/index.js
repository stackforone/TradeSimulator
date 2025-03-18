import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CurrencyDollarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, WalletIcon, ArrowPathIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { Howl } from 'howler';
import toast, { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Localization setup
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: { /* English translations */ } },
    th: {
      translation: {
        buy: 'ซื้อ',
        sell: 'ขาย',
        balance: 'ยอดเงินคงเหลือ',
        portfolio: 'พอร์ตโฟลิโอ',
        tradeHistory: 'ประวัติการเทรด',
        setAlert: 'ตั้งค่าการแจ้งเตือน',
        priceTarget: 'ราคาเป้าหมาย',
        condition: 'เงื่อนไข',
        above: 'สูงกว่า',
        below: 'ต่ำกว่า',
        alertsSet: 'การแจ้งเตือนที่ตั้งไว้',
        noAlerts: 'ยังไม่มีการตั้งค่าการแจ้งเตือน',
        news: 'ข่าวคริปโตล่าสุด',
        trend: 'แนวโน้ม 7 วัน',
        ranking: 'อันดับผู้ใช้',
        totalValue: 'มูลค่ารวมของพอร์ตโฟลิโอ',
        spot: 'Spot',
        margin: 'Margin',
        futures: 'Futures',
        orderBook: 'Order Book',
        depthChart: 'Depth Chart',
        pnl: 'กำไรและขาดทุน (PNL)',
        riskManagement: 'การจัดการความเสี่ยง',
      },
    },
  },
  lng: 'th',
  fallbackLng: 'en',
});

export default function Home() {
  const { t } = useTranslation();

  // States
  const [balance, setBalance] = useState(20000000);
  const [marginBalance, setMarginBalance] = useState(1000000);
  const [cryptos, setCryptos] = useState([
    { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', price: 65432.21, change24h: 2.34, owned: 0, history: [] },
    { id: 'solana', name: 'Solana', symbol: 'SOL', price: 143.56, change24h: 5.67, owned: 0, history: [] },
    { id: 'cardano', name: 'Cardano', symbol: 'ADA', price: 0.58, change24h: -0.45, owned: 0, history: [] },
    { id: 'binancecoin', name: 'Binance Coin', symbol: 'BNB', price: 480.15, change24h: 1.12, owned: 0, history: [] },
    { id: 'ripple', name: 'XRP', symbol: 'XRP', price: 0.62, change24h: -0.89, owned: 0, history: [] },
    { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE', price: 0.15, change24h: 3.45, owned: 0, history: [] },
    { id: 'polkadot', name: 'Polkadot', symbol: 'DOT', price: 8.23, change24h: -2.10, owned: 0, history: [] },
    { id: 'litecoin', name: 'Litecoin', symbol: 'LTC', price: 86.45, change24h: 0.78, owned: 0, history: [] },
    { id: 'chainlink', name: 'Chainlink', symbol: 'LINK', price: 18.90, change24h: 4.20, owned: 0, history: [] },
  ]);
  const [selectedCrypto, setSelectedCrypto] = useState(cryptos[0]);
  const [buyAmount, setBuyAmount] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [orderType, setOrderType] = useState('market');
  const [timeframe, setTimeframe] = useState('1D');
  const [tradeHistory, setTradeHistory] = useState([]);
  const [openOrders, setOpenOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [alerts, setAlerts] = useState([]);
  const [alertPrice, setAlertPrice] = useState('');
  const [alertDirection, setAlertDirection] = useState('above');
  const [comparedCryptos, setComparedCryptos] = useState([]);
  const [transactionFee] = useState(0.001);
  const [news, setNews] = useState([]);
  const [leaderboard] = useState([
    { name: 'User1', portfolioValue: 5000000 },
    { name: 'User2', portfolioValue: 4500000 },
    { name: 'User3', portfolioValue: 4000000 },
  ]);
  const [tradingMode, setTradingMode] = useState('spot');
  const [leverage, setLeverage] = useState(1);
  const [pnl, setPnl] = useState({ realized: 0, unrealized: 0 });
  const [riskRewardRatio, setRiskRewardRatio] = useState(2);
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });

  // Sound Effects
  const buySound = new Howl({ src: ['/sounds/buy.mp3'] });
  const sellSound = new Howl({ src: ['/sounds/sell.mp3'] });

  // Load/Save localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedBalance = localStorage.getItem('balance');
      const storedTradeHistory = localStorage.getItem('tradeHistory');
      if (storedBalance) setBalance(parseFloat(storedBalance));
      if (storedTradeHistory) setTradeHistory(JSON.parse(storedTradeHistory));
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('balance', balance);
      localStorage.setItem('tradeHistory', JSON.stringify(tradeHistory));
    }
  }, [balance, tradeHistory]);

  // Generate price history
  useEffect(() => {
    const generateHistory = (basePrice) => {
      const history = [];
      const now = new Date();
      for (let i = 30; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const randomChange = (Math.random() * 10 - 5) / 100;
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
    setCryptos(cryptos.map(crypto => ({ ...crypto, history: generateHistory(crypto.price) })));
  }, []);

  // Mock news fetch
  useEffect(() => {
    const fetchNews = async () => {
      const mockNews = [
        { title: 'Bitcoin Hits $70K', description: 'BTC reaches new high.', url: '#' },
        { title: 'Ethereum Upgrade', description: 'ETH 2.0 rollout begins.', url: '#' },
        { title: 'Solana Surge', description: 'SOL up 10% in 24h.', url: '#' },
      ];
      setNews(mockNews);
    };
    fetchNews();
  }, []);

  // Price updates and order execution
  useEffect(() => {
    const interval = setInterval(() => {
      setCryptos(prevCryptos => {
        const updated = prevCryptos.map(crypto => {
          const randomChange = (Math.random() * 2 - 1) / 100;
          const newPrice = crypto.price * (1 + randomChange);
          let newChange = crypto.change24h + (Math.random() * 0.4 - 0.2);
          if (Math.abs(newChange) > 10) newChange = newChange > 0 ? 10 : -10;
          const now = new Date();
          const newHistory = [...crypto.history];
          if (newHistory.length > 100) newHistory.shift();
          newHistory.push({
            time: now.toISOString(),
            price: newPrice,
            formattedTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            formattedDate: now.toLocaleDateString([], { month: 'short', day: 'numeric' }),
          });

          // Check open orders
          openOrders.forEach((order, index) => {
            if (order.crypto === crypto.symbol) {
              if (order.type === 'buy' && order.price >= newPrice) {
                executeOrder(order);
                setOpenOrders(prev => prev.filter((_, i) => i !== index));
              } else if (order.type === 'sell' && order.price <= newPrice) {
                executeOrder(order);
                setOpenOrders(prev => prev.filter((_, i) => i !== index));
              }
            }
          });

          return { ...crypto, price: newPrice, change24h: newChange, history: newHistory };
        });
        const selectedId = selectedCrypto.id;
        const newSelected = updated.find(crypto => crypto.id === selectedId);
        setSelectedCrypto(newSelected);
        return updated;
      });

      // PNL calculation
      const unrealized = cryptos.reduce((total, crypto) => {
        const entryPrice = tradeHistory.find(t => t.crypto === crypto.symbol)?.price || crypto.price;
        return total + crypto.owned * (crypto.price - entryPrice);
      }, 0);
      setPnl(prev => ({ ...prev, unrealized }));

      // Order Book update
      const basePrice = selectedCrypto.price;
      const bids = Array.from({ length: 10 }, (_, i) => ({ price: basePrice - (i + 1) * 10, amount: Math.random() * 10 }));
      const asks = Array.from({ length: 10 }, (_, i) => ({ price: basePrice + (i + 1) * 10, amount: Math.random() * 10 }));
      setOrderBook({ bids, asks });
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedCrypto, openOrders, tradeHistory]);

  // Functions
  const setPriceAlert = (cryptoId, targetPrice, direction) => {
    if (isNaN(targetPrice) || targetPrice <= 0) {
      toast.error('กรุณากรอกราคาเป้าหมายที่ถูกต้อง');
      return;
    }
    setAlerts(prev => [...prev, { cryptoId, targetPrice: parseFloat(targetPrice), direction }]);
    toast.success('ตั้งค่าการแจ้งเตือนสำเร็จ!');
  };

  const removeAlert = (index) => {
    setAlerts(prev => prev.filter((_, i) => i !== index));
    toast.success('ลบการแจ้งเตือนสำเร็จ!');
  };

  const toggleCompare = (crypto) => {
    setComparedCryptos(prev =>
      prev.includes(crypto.id) ? prev.filter(id => id !== crypto.id) : [...prev, crypto.id].slice(0, 3)
    );
  };

  const placeOrder = (type) => {
    const amount = type === 'buy' ? parseFloat(buyAmount) : parseFloat(sellAmount);
    if (!amount || isNaN(amount) || amount <= 0) {
      toast.error('กรุณากรอกจำนวนที่ถูกต้อง');
      return;
    }

    const price = orderType === 'limit' ? parseFloat(limitPrice) : selectedCrypto.price;
    const totalCost = amount * price * leverage;
    const fee = totalCost * transactionFee;
    const netCost = type === 'buy' ? totalCost + fee : totalCost - fee;

    if (tradingMode === 'spot' && type === 'buy' && netCost > balance) {
      toast.error('ยอดเงินคงเหลือไม่เพียงพอ');
      return;
    } else if (tradingMode === 'margin' && type === 'buy' && netCost > marginBalance) {
      toast.error('ยอดเงิน Margin ไม่เพียงพอ');
      return;
    } else if (type === 'sell' && amount > selectedCrypto.owned) {
      toast.error(`คุณไม่มี ${selectedCrypto.symbol} เพียงพอ`);
      return;
    }

    const order = {
      type,
      crypto: selectedCrypto.symbol,
      amount: type === 'buy' ? amount / price : amount,
      price,
      leverage,
      stopLoss: stopLoss ? parseFloat(stopLoss) : null,
      takeProfit: takeProfit ? parseFloat(takeProfit) : null,
      timestamp: new Date().toLocaleString(),
      status: orderType === 'market' ? 'filled' : 'open',
    };

    setIsLoading(true);
    setTimeout(() => {
      if (order.status === 'filled') {
        executeOrder(order);
      } else {
        setOpenOrders(prev => [...prev, order]);
        toast.success('ตั้งคำสั่ง Limit สำเร็จ');
      }
      setBuyAmount('');
      setSellAmount('');
      setLimitPrice('');
      setStopLoss('');
      setTakeProfit('');
      setIsLoading(false);
    }, 1000);
  };

  const executeOrder = (order) => {
    const totalCost = order.amount * order.price * order.leverage;
    const fee = totalCost * transactionFee;
    const netAmount = order.type === 'buy' ? totalCost + fee : totalCost - fee;

    setCryptos(prev =>
      prev.map(crypto =>
        crypto.id === selectedCrypto.id
          ? { ...crypto, owned: crypto.owned + (order.type === 'buy' ? order.amount : -order.amount) }
          : crypto
      )
    );

    if (tradingMode === 'spot') {
      setBalance(prev => prev + (order.type === 'buy' ? -netAmount : netAmount));
    } else if (tradingMode === 'margin' || tradingMode === 'futures') {
      setMarginBalance(prev => prev + (order.type === 'buy' ? -netAmount : netAmount));
      checkMarginLiquidation();
    }

    setTradeHistory(prev => [...prev, { ...order, total: totalCost, fee }]);
    setPnl(prev => ({
      ...prev,
      realized: prev.realized + (order.type === 'sell' ? netAmount - totalCost : 0),
    }));

    order.type === 'buy' ? buySound.play() : sellSound.play();
  };

  const checkMarginLiquidation = () => {
    const portfolioValue = cryptos.reduce((total, c) => total + c.owned * c.price, 0);
    if (tradingMode === 'margin' && portfolioValue < marginBalance * 0.1) {
      toast.error('Margin Call! พอร์ตถูกล้าง');
      setMarginBalance(0);
      setCryptos(prev => prev.map(c => ({ ...c, owned: 0 })));
    }
  };

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  const portfolioValue = balance + cryptos.reduce((total, crypto) => total + crypto.owned * crypto.price, 0);
  const formatCurrency = (value) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  const formatCryptoAmount = (value) => (value < 0.001 ? value.toFixed(8) : value < 1 ? value.toFixed(4) : value.toFixed(2));

  const getMultiChartData = () => {
    if (!comparedCryptos.length) {
      let data = [...selectedCrypto.history];
      switch (timeframe) {
        case '1H': return data.slice(-12);
        case '1D': return data.slice(-24);
        case '1W': return data.filter((_, index) => index % 4 === 0);
        case '1M': return data.filter((_, index) => index % 8 === 0);
        default: return data;
      }
    }
    const combinedData = [];
    const timestamps = selectedCrypto.history.slice(-24).map(item => item.time);
    timestamps.forEach((time, index) => {
      const entry = { time: selectedCrypto.history[index]?.formattedTime };
      comparedCryptos.forEach(cryptoId => {
        const crypto = cryptos.find(c => c.id === cryptoId);
        entry[crypto.symbol] = crypto.history[index]?.price || 0;
      });
      combinedData.push(entry);
    });
    return combinedData;
  };

  const getTrend = (history) => {
    if (history.length < 2) return 'N/A';
    const recentPrices = history.slice(-7).map(item => item.price);
    const avgChange = recentPrices.reduce((sum, price, idx) => (idx === 0 ? 0 : sum + ((price - recentPrices[idx - 1]) / recentPrices[idx - 1])), 0) / (recentPrices.length - 1);
    return avgChange > 0 ? 'ขาขึ้น' : 'ขาลง';
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white' : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900'} font-sans overflow-x-hidden`}>
      <Toaster position="top-right" toastOptions={{ duration: 5000, className: 'glass-toast' }} />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        className="fixed top-0 left-0 right-0 glass-card py-3 px-4 z-50 shadow-lg bg-gradient-to-r from-gray-900/90 via-gray-800/90 to-gray-900/90"
      >
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-1 sm:gap-0">
          <motion.h1 whileHover={{ scale: 1.05 }} className="text-lg sm:text-xl font-extrabold flex items-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
            <ChartBarIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
            Simulator
          </motion.h1>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <motion.div whileHover={{ scale: 1.05 }} className="glass-card px-2 py-1 sm:px-3 sm:py-1.5 flex items-center rounded-full bg-gradient-to-r from-green-500/20 to-green-600/20">
              <WalletIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 text-green-400" />
              <span className="text-sm sm:text-base font-semibold">{formatCurrency(balance)}</span>
            </motion.div>
            {tradingMode !== 'spot' && (
              <motion.div whileHover={{ scale: 1.05 }} className="glass-card px-2 py-1 sm:px-3 sm:py-1.5 flex items-center rounded-full bg-gradient-to-r from-yellow-500/20 to-yellow-600/20">
                <WalletIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 text-yellow-400" />
                <span className="text-sm sm:text-base font-semibold">{formatCurrency(marginBalance)} (Margin)</span>
              </motion.div>
            )}
            <motion.div whileHover={{ scale: 1.05 }} className="glass-card px-2 py-1 sm:px-3 sm:py-1.5 flex items-center rounded-full bg-gradient-to-r from-blue-500/20 to-blue-600/20">
              <CurrencyDollarIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 text-blue-400" />
              <span className="text-sm sm:text-base font-semibold">{formatCurrency(portfolioValue)}</span>
            </motion.div>
            <motion.button whileHover={{ rotate: 180, scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={toggleTheme} className="glass-card p-1.5 sm:p-2 rounded-full bg-gradient-to-r from-gray-700/50 to-gray-600/50">
              {theme === 'dark' ? '☀️' : '🌙'}
            </motion.button>
            <div className="flex space-x-1 sm:space-x-2">
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => i18n.changeLanguage('en')} className="glass-card px-2 py-1 sm:px-2.5 sm:py-1 rounded-full text-xs sm:text-sm bg-gradient-to-r from-blue-500/30 to-blue-600/30">
                EN
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => i18n.changeLanguage('th')} className="glass-card px-2 py-1 sm:px-2.5 sm:py-1 rounded-full text-xs sm:text-sm bg-gradient-to-r from-purple-500/30 to-purple-600/30">
                TH
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto pt-20 sm:pt-24 p-6">
        {/* Trading Mode Selector */}
        <div className="flex justify-center mb-6">
          <div className="glass-card rounded-lg overflow-hidden flex">
            {['spot', 'margin', 'futures'].map(mode => (
              <motion.button
                key={mode}
                whileHover={{ scale: 1.05 }}
                className={`px-4 py-2 text-md font-medium ${tradingMode === mode ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
                onClick={() => setTradingMode(mode)}
              >
                {t(mode)}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Crypto List */}
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">{t('portfolio')}</h2>
            <div className="space-y-4">
              <AnimatePresence>
                {cryptos.map(crypto => (
                  <motion.div
                    key={crypto.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className={`glass-card p-4 rounded-lg cursor-pointer hover:shadow-lg transition-all duration-300 ${
                      selectedCrypto.id === crypto.id ? 'bg-gradient-to-r from-blue-500 to-purple-600 shadow-md border-2 border-blue-400 text-white' : 'hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-600 text-gray-300'
                    }`}
                    onClick={() => setSelectedCrypto(crypto)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <input type="checkbox" checked={comparedCryptos.includes(crypto.id)} onChange={() => toggleCompare(crypto)} className="mr-3 accent-blue-500" />
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-lg font-bold text-white mr-3">
                          {crypto.symbol.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{crypto.name}</h3>
                          <p className="text-sm">{crypto.symbol}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">{formatCurrency(crypto.price)}</p>
                        <p className={`text-sm ${crypto.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>{crypto.change24h >= 0 ? '+' : ''}{crypto.change24h.toFixed(2)}%</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Chart and Trading */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chart */}
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-xl p-6 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">{selectedCrypto.name} ({selectedCrypto.symbol})</h2>
                  <div className="flex items-center mt-2">
                    <span className="text-4xl font-extrabold mr-3">{formatCurrency(selectedCrypto.price)}</span>
                    <span className={`flex items-center text-lg ${selectedCrypto.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {selectedCrypto.change24h >= 0 ? <ArrowTrendingUpIcon className="h-6 w-6 mr-1" /> : <ArrowTrendingDownIcon className="h-6 w-6 mr-1" />}
                      {selectedCrypto.change24h >= 0 ? '+' : ''}{selectedCrypto.change24h.toFixed(2)}%
                    </span>
                  </div>
                  <p className="text-md mt-1">{t('trend')}: <span className={getTrend(selectedCrypto.history) === 'ขาขึ้น' ? 'text-green-400' : 'text-red-400'}>{getTrend(selectedCrypto.history)}</span></p>
                </div>
                <div className="flex glass-card rounded-lg overflow-hidden">
                  {['1H', '1D', '1W', '1M'].map(tf => (
                    <motion.button
                      key={tf}
                      whileHover={{ scale: 1.05 }}
                      className={`px-4 py-2 text-md font-medium ${timeframe === tf ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
                      onClick={() => setTimeframe(tf)}
                    >
                      {tf}
                    </motion.button>
                  ))}
                </div>
              </div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="h-96 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getMultiChartData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis dataKey="time" tick={{ fill: '#D1D5DB', fontSize: 12 }} axisLine={{ stroke: 'rgba(255, 255, 255, 0.2)' }} />
                    <YAxis tick={{ fill: '#D1D5DB', fontSize: 12 }} axisLine={{ stroke: 'rgba(255, 255, 255, 0.2)' }} domain={['dataMin', 'dataMax']} tickFormatter={(value) => formatCurrency(value).replace('฿', '')} />
                    <Tooltip contentStyle={{ background: 'rgba(31, 41, 55, 0.9)', border: 'none', borderRadius: '8px', color: '#fff' }} formatter={(value) => [formatCurrency(value), 'Price']} labelFormatter={(label) => `Time: ${label}`} />
                    {comparedCryptos.length > 0 ? (
                      comparedCryptos.map((cryptoId, index) => {
                        const crypto = cryptos.find(c => c.id === cryptoId);
                        return (
                          <Line key={crypto.id} type="monotone" dataKey={crypto.symbol} stroke={['#3B82F6', '#FBBF24', '#EF4444'][index]} dot={false} strokeWidth={2} />
                        );
                      })
                    ) : (
                      <Line type="monotone" dataKey="price" stroke="#3B82F6" dot={false} strokeWidth={2} />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <ArrowPathIcon className="h-4 w-4 animate-spin-slow" />
                <span>อัปเดตอัตโนมัติทุกๆ 5 วินาที</span>
              </div>
            </motion.div>

            {/* Trading Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="glass-card rounded-xl p-6 shadow-xl">
                <h3 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-600">{t('buy')} {selectedCrypto.symbol}</h3>
                <div className="space-y-4">
                  {tradingMode !== 'spot' && (
                    <div>
                      <label className="block text-md font-medium text-gray-200 mb-2">Leverage</label>
                      <select value={leverage} onChange={(e) => setLeverage(parseInt(e.target.value))} className="w-full glass-input py-3 px-4 rounded-lg">
                        {[1, 2, 5, 10].map(l => (
                          <option key={l} value={l}>{l}x</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-md font-medium text-gray-200 mb-2">จำนวน (USD)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                      <input
                        type="number"
                        value={buyAmount}
                        onChange={(e) => setBuyAmount(e.target.value)}
                        className="w-full glass-input py-3 px-10 rounded-lg focus:ring-2 focus:ring-green-500 transition-all duration-300"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-md font-medium text-gray-200 mb-2">ประเภทคำสั่ง</label>
                    <select value={orderType} onChange={(e) => setOrderType(e.target.value)} className="w-full glass-input py-3 px-4 rounded-lg">
                      <option value="market">Market</option>
                      <option value="limit">Limit</option>
                    </select>
                  </div>
                  {orderType === 'limit' && (
                    <div>
                      <label className="block text-md font-medium text-gray-200 mb-2">ราคา Limit (USD)</label>
                      <input
                        type="number"
                        value={limitPrice}
                        onChange={(e) => setLimitPrice(e.target.value)}
                        className="w-full glass-input py-3 px-4 rounded-lg"
                        placeholder="0.00"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-md font-medium text-gray-200 mb-2">Stop-Loss (USD)</label>
                    <input
                      type="number"
                      value={stopLoss}
                      onChange={(e) => setStopLoss(e.target.value)}
                      className="w-full glass-input py-3 px-4 rounded-lg"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-md font-medium text-gray-200 mb-2">Take-Profit (USD)</label>
                    <input
                      type="number"
                      value={takeProfit}
                      onChange={(e) => setTakeProfit(e.target.value)}
                      className="w-full glass-input py-3 px-4 rounded-lg"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="flex justify-between text-md text-gray-300">
                    <span>{t('balance')}</span>
                    <span>{formatCurrency(tradingMode === 'spot' ? balance : marginBalance)}</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => placeOrder('buy')}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading || !buyAmount || parseFloat(buyAmount) <= 0}
                  >
                    {isLoading ? (
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      t('buy')
                    )}
                  </motion.button>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="glass-card rounded-xl p-6 shadow-xl">
                <h3 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-red-600">{t('sell')} {selectedCrypto.symbol}</h3>
                <div className="space-y-4">
                  {tradingMode !== 'spot' && (
                    <div>
                      <label className="block text-md font-medium text-gray-200 mb-2">Leverage</label>
                      <select value={leverage} onChange={(e) => setLeverage(parseInt(e.target.value))} className="w-full glass-input py-3 px-4 rounded-lg">
                        {[1, 2, 5, 10].map(l => (
                          <option key={l} value={l}>{l}x</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-md font-medium text-gray-200 mb-2">จำนวน ({selectedCrypto.symbol})</label>
                    <input
                      type="number"
                      value={sellAmount}
                      onChange={(e) => setSellAmount(e.target.value)}
                      className="w-full glass-input py-3 px-4 rounded-lg focus:ring-2 focus:ring-red-500 transition-all duration-300"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-md font-medium text-gray-200 mb-2">ประเภทคำสั่ง</label>
                    <select value={orderType} onChange={(e) => setOrderType(e.target.value)} className="w-full glass-input py-3 px-4 rounded-lg">
                      <option value="market">Market</option>
                      <option value="limit">Limit</option>
                    </select>
                  </div>
                  {orderType === 'limit' && (
                    <div>
                      <label className="block text-md font-medium text-gray-200 mb-2">ราคา Limit (USD)</label>
                      <input
                        type="number"
                        value={limitPrice}
                        onChange={(e) => setLimitPrice(e.target.value)}
                        className="w-full glass-input py-3 px-4 rounded-lg"
                        placeholder="0.00"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-md font-medium text-gray-200 mb-2">Stop-Loss (USD)</label>
                    <input
                      type="number"
                      value={stopLoss}
                      onChange={(e) => setStopLoss(e.target.value)}
                      className="w-full glass-input py-3 px-4 rounded-lg"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-md font-medium text-gray-200 mb-2">Take-Profit (USD)</label>
                    <input
                      type="number"
                      value={takeProfit}
                      onChange={(e) => setTakeProfit(e.target.value)}
                      className="w-full glass-input py-3 px-4 rounded-lg"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="flex justify-between text-md text-gray-300">
                    <span>มีอยู่</span>
                    <span>{formatCryptoAmount(selectedCrypto.owned)} {selectedCrypto.symbol}</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => placeOrder('sell')}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading || !sellAmount || parseFloat(sellAmount) <= 0 || parseFloat(sellAmount) > selectedCrypto.owned}
                  >
                    {isLoading ? (
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      t('sell')
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </div>

            {/* Open Orders */}
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card rounded-xl p-6 shadow-xl">
              <h3 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">คำสั่งที่รอ</h3>
              {openOrders.length > 0 ? (
                <div className="space-y-3">
                  {openOrders.map((order, index) => (
                    <motion.div key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-3 rounded-lg flex justify-between items-center">
                      <p>{order.type === 'buy' ? t('buy') : t('sell')} {order.crypto} - {formatCryptoAmount(order.amount)} @ {formatCurrency(order.price)}</p>
                      <p>{order.timestamp}</p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-md text-gray-400">ยังไม่มีคำสั่งที่รอ</p>
              )}
            </motion.div>

            {/* Order Book */}
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="glass-card rounded-xl p-6 shadow-xl">
              <h3 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">{t('orderBook')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-md font-semibold text-green-400">Bids</h4>
                  {orderBook.bids.map((bid, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>{formatCurrency(bid.price)}</span>
                      <span>{bid.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="text-md font-semibold text-red-400">Asks</h4>
                  {orderBook.asks.map((ask, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>{formatCurrency(ask.price)}</span>
                      <span>{ask.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Depth Chart */}
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="glass-card rounded-xl p-6 shadow-xl">
              <h3 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">{t('depthChart')}</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart>
                  <Line type="step" data={orderBook.bids} dataKey="price" stroke="#10B981" dot={false} />
                  <Line type="step" data={orderBook.asks} dataKey="price" stroke="#EF4444" dot={false} />
                  <XAxis dataKey="price" />
                  <YAxis />
                  <Tooltip />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* PNL */}
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="glass-card rounded-xl p-6 shadow-xl">
              <h3 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">{t('pnl')}</h3>
              <div className="space-y-2">
                <p>Realized PNL: {formatCurrency(pnl.realized)}</p>
                <p>Unrealized PNL: {formatCurrency(pnl.unrealized)}</p>
              </div>
            </motion.div>

            {/* Risk Management */}
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }} className="glass-card rounded-xl p-6 shadow-xl">
              <h3 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">{t('riskManagement')}</h3>
              <div>
                <label className="block text-md font-medium text-gray-200 mb-2">Risk/Reward Ratio</label>
                <input
                  type="number"
                  value={riskRewardRatio}
                  onChange={(e) => setRiskRewardRatio(parseFloat(e.target.value))}
                  className="w-full glass-input py-3 px-4 rounded-lg"
                  placeholder="2"
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Portfolio and Trade History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }} className="glass-card rounded-xl p-6 shadow-xl flex flex-col">
            <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">{t('portfolio')}</h2>
            <div className="w-full">
              <table className="w-full min-w-[300px] table-auto">
                <thead>
                  <tr className="text-gray-300 text-md border-b border-gray-700">
                    <th className="pb-3 text-left">Asset</th>
                    <th className="pb-3 text-right">Amount</th>
                    <th className="pb-3 text-right">Price</th>
                    <th className="pb-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {cryptos.filter(crypto => crypto.owned > 0).map(crypto => (
                    <motion.tr
                      key={crypto.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 * cryptos.indexOf(crypto) }}
                      className="border-b border-gray-700 hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-600 transition-all duration-300"
                    >
                      <td className="py-4 flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-md font-bold text-white mr-3">
                          {crypto.symbol.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-md">{crypto.name}</p>
                          <p className="text-sm text-gray-400">{crypto.symbol}</p>
                        </div>
                      </td>
                      <td className="py-4 text-right">{formatCryptoAmount(crypto.owned)}</td>
                      <td className="py-4 text-right">{formatCurrency(crypto.price)}</td>
                      <td className="py-4 text-right">{formatCurrency(crypto.owned * crypto.price)}</td>
                    </motion.tr>
                  ))}
                  {cryptos.some(crypto => crypto.owned > 0) ? (
                    <tr className="bg-gradient-to-r from-gray-700 to-gray-600">
                      <td colSpan="3" className="py-4 pl-3 font-semibold text-md">{t('totalValue')}</td>
                      <td className="py-4 text-right font-semibold text-md">{formatCurrency(portfolioValue)}</td>
                    </tr>
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-4 text-center text-gray-400">
                        <p className="text-md">ยังไม่มีเหรียญในพอร์ตโฟลิโอ</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }} className="glass-card rounded-xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">{t('tradeHistory')}</h2>
            {tradeHistory.length > 0 ? (
              <div className="overflow-y-auto max-h-80">
                <table className="w-full">
                  <thead>
                    <tr className="text-gray-300 text-md border-b border-gray-700">
                      <th className="pb-3 text-left">ประเภท</th>
                      <th className="pb-3 text-left">สินทรัพย์</th>
                      <th className="pb-3 text-right">จำนวน</th>
                      <th className="pb-3 text-right">ราคา</th>
                      <th className="pb-3 text-right">ทั้งหมด</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tradeHistory.map((trade, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 * index }}
                        className="border-b border-gray-700 hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-600 transition-all duration-300"
                      >
                        <td className="py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${trade.type === t('buy') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {trade.type}
                          </span>
                        </td>
                        <td className="py-4">{trade.crypto}</td>
                        <td className="py-4 text-right">{formatCryptoAmount(trade.amount)}</td>
                        <td className="py-4 text-right">{formatCurrency(trade.price)}</td>
                        <td className="py-4 text-right">{formatCurrency(trade.total)}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p className="text-md">ยังไม่มีการเทรด</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* News Feed and Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="glass-card rounded-xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">{t('news')}</h2>
            <div className="space-y-4">
              {news.map((article, index) => (
                <motion.div key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 * index }} className="border-b border-gray-700 pb-4">
                  <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-md font-semibold transition-colors duration-300">
                    {article.title}
                  </a>
                  <p className="text-sm text-gray-300 mt-1">{article.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }} className="glass-card rounded-xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">{t('ranking')}</h2>
            <div className="space-y-4">
              {leaderboard.map((user, index) => (
                <motion.div key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 * index }} className="flex justify-between items-center border-b border-gray-700 pb-2">
                  <span className="text-md">{index + 1}. {user.name}</span>
                  <span className="text-md">{formatCurrency(user.portfolioValue)}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <motion.footer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }} className="glass-card p-4 mt-6">
        <div className="container mx-auto text-center text-gray-300 text-md">
          <p>CryptoTrade Simulator จำลองการซื้อขาย {new Date().getFullYear()}</p>
          <p className="mt-1">นี่เป็นแพลตฟอร์มการซื้อขายจำลองเพื่อวัตถุประสงค์ทางการศึกษาเท่านั้น</p>
        </div>
      </motion.footer>
    </div>
  );
}
