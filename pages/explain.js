// pages/index.js

// นำเข้า React Hooks และคอมโพเนนต์ที่จำเป็นจาก React และแพ็กเกจอื่นๆ
import { useState, useEffect } from 'react'; // useState สำหรับจัดการ state, useEffect สำหรับ side effects เช่น การอัปเดตข้อมูล
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'; // คอมโพเนนต์สำหรับสร้างกราฟราคาคริปโต
import { CurrencyDollarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, WalletIcon, ArrowPathIcon, ChartBarIcon } from '@heroicons/react/24/outline'; // ไอคอนจาก Heroicons เพื่อใช้ใน UI

// คอมโพเนนต์หลักของหน้า Home (หน้าแรกของแอป)
export default function Home() {
  // สถานะ (State) สำหรับจัดการข้อมูลในแอป
  // balance: ยอดเงินคงเหลือของผู้ใช้ (เริ่มต้นที่ 2 ล้านบาท)
  const [balance, setBalance] = useState(2000000);
  
  // cryptos: อาร์เรย์ของคริปโตที่มีให้ซื้อขาย แต่ละตัวมี id, name, symbol, price, change24h, owned, และ history
  const [cryptos, setCryptos] = useState([
    { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', price: 65432.21, change24h: 2.34, owned: 0, history: [] },
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', price: 3421.78, change24h: -1.23, owned: 0, history: [] },
    { id: 'solana', name: 'Solana', symbol: 'SOL', price: 143.56, change24h: 5.67, owned: 0, history: [] },
    { id: 'cardano', name: 'Cardano', symbol: 'ADA', price: 0.58, change24h: -0.45, owned: 0, history: [] },
    { id: 'binancecoin', name: 'Binance Coin', symbol: 'BNB', price: 480.15, change24h: 1.12, owned: 0, history: [] },
    { id: 'ripple', name: 'XRP', symbol: 'XRP', price: 0.62, change24h: -0.89, owned: 0, history: [] },
    { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE', price: 0.15, change24h: 3.45, owned: 0, history: [] },
    { id: 'polkadot', name: 'Polkadot', symbol: 'DOT', price: 8.23, change24h: -2.10, owned: 0, history: [] },
    { id: 'litecoin', name: 'Litecoin', symbol: 'LTC', price: 86.45, change24h: 0.78, owned: 0, history: [] },
    { id: 'chainlink', name: 'Chainlink', symbol: 'LINK', price: 18.90, change24h: 4.20, owned: 0, history: [] },
  ]);
  
  // selectedCrypto: คริปโตที่ผู้ใช้เลือกอยู่ในขณะนั้น (เริ่มต้นที่ Bitcoin)
  const [selectedCrypto, setSelectedCrypto] = useState(cryptos[0]);
  
  // buyAmount: จำนวนเงิน (USD) ที่ผู้ใช้กรอกเพื่อซื้อคริปโต (เริ่มต้นเป็นสตริงว่าง)
  const [buyAmount, setBuyAmount] = useState('');
  
  // sellAmount: จำนวนคริปโตที่ผู้ใช้กรอกเพื่อขาย (เริ่มต้นเป็นสตริงว่าง)
  const [sellAmount, setSellAmount] = useState('');
  
  // timeframe: ช่วงเวลาที่เลือกสำหรับกราฟ (เช่น '1H', '1D', '1W', '1M') ค่าเริ่มต้นคือ '1D'
  const [timeframe, setTimeframe] = useState('1D');
  
  // tradeHistory: อาร์เรย์เก็บประวัติการซื้อขาย (เริ่มต้นว่างเปล่า)
  const [tradeHistory, setTradeHistory] = useState([]);
  
  // isLoading: บูลีนสำหรับแสดงสถานะการโหลดขณะทำธุรกรรม (เริ่มต้นเป็น false)
  const [isLoading, setIsLoading] = useState(false);
  
  // searchQuery: คำค้นหาสำหรับกรองคริปโต (เริ่มต้นเป็นสตริงว่าง)
  const [searchQuery, setSearchQuery] = useState('');
  
  // sortBy: เกณฑ์การเรียงลำดับคริปโต ('name', 'price', 'change') ค่าเริ่มต้นคือ 'name'
  const [sortBy, setSortBy] = useState('name');

  // ฟังก์ชันค้นหาและเรียงลำดับคริปโต
  // filteredCryptos: กรองคริปโตตามคำค้นหา และเรียงลำดับตามเกณฑ์ที่เลือก
  const filteredCryptos = cryptos
    .filter(crypto => 
      // กรองโดยเช็คว่า name หรือ symbol มีคำค้นหา (ไม่สนใจตัวพิมพ์ใหญ่-เล็ก)
      crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      // เรียงลำดับตาม sortBy
      switch(sortBy) {
        case 'price': return b.price - a.price; // เรียงจากราคามากไปน้อย
        case 'change': return b.change24h - a.change24h; // เรียงจากเปอร์เซ็นต์การเปลี่ยนแปลงมากไปน้อย
        default: return a.name.localeCompare(b.name); // ค่าเริ่มต้น: เรียงตามชื่อ (ตัวอักษร)
      }
    });

  // เพิ่มฟีเจอร์ Alert สำหรับแจ้งเตือนเมื่อทำธุรกรรมสำเร็จ
  // showSuccess: บูลีนควบคุมการแสดงข้อความแจ้งเตือน (เริ่มต้นเป็น false)
  const [showSuccess, setShowSuccess] = useState(false);
  // successMessage: ข้อความแจ้งเตือน (เริ่มต้นเป็นสตริงว่าง)
  const [successMessage, setSuccessMessage] = useState('');

  // useEffect สำหรับสร้างประวัติราคาคริปโตแบบสุ่มเมื่อ component เริ่มทำงาน
  useEffect(() => {
    // ฟังก์ชันช่วยสร้างประวัติราคา (history) สำหรับคริปโตแต่ละตัว
    const generateHistory = (basePrice) => {
      const history = []; // อาร์เรย์เก็บประวัติราคา
      const now = new Date(); // เวลาปัจจุบัน
      
      // สร้างข้อมูลย้อนหลัง 30 วัน
      for (let i = 30; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i); // ลบวันย้อนหลัง
        
        // สร้างการเปลี่ยนแปลงราคาแบบสุ่ม (-5% ถึง +5%)
        const randomChange = (Math.random() * 10 - 5) / 100;
        const price = basePrice * (1 + randomChange * (Math.random() + 0.5)); // คำนวณราคาใหม่
        
        // เพิ่มข้อมูลลงใน history
        history.push({
          time: date.toISOString(), // เวลาในรูปแบบ ISO
          price: price, // ราคาที่คำนวณได้
          formattedTime: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), // รูปแบบเวลา (HH:MM)
          formattedDate: date.toLocaleDateString([], { month: 'short', day: 'numeric' }), // รูปแบบวันที่ (MMM DD)
        });
      }
      
      return history;
    };
    
    // อัปเดต cryptos โดยเพิ่ม history ให้แต่ละคริปโต
    setCryptos(cryptos.map(crypto => ({
      ...crypto,
      history: generateHistory(crypto.price)
    })));
  }, []); // ทำงานครั้งเดียวเมื่อ component mount (ไม่มี dependency)

  // useEffect สำหรับอัปเดตราคาคริปโตแบบเรียลไทม์ทุกๆ 5 วินาที
  useEffect(() => {
    // สร้าง interval เพื่ออัปเดตทุก 5 วินาที
    const interval = setInterval(() => {
      setCryptos(prevCryptos => {
        const updated = prevCryptos.map(crypto => {
          // คำนวณราคาใหม่โดยเพิ่มการเปลี่ยนแปลงแบบสุ่ม (-1% ถึง +1%)
          const randomChange = (Math.random() * 2 - 1) / 100;
          const newPrice = crypto.price * (1 + randomChange);
          
          // อัปเดตเปอร์เซ็นต์การเปลี่ยนแปลง 24 ชม. (จำกัดที่ ±10%)
          let newChange = crypto.change24h + (Math.random() * 0.4 - 0.2);
          if (Math.abs(newChange) > 10) newChange = newChange > 0 ? 10 : -10;
          
          // เพิ่มราคาใหม่ลงใน history
          const now = new Date();
          const newHistory = [...crypto.history];
          if (newHistory.length > 100) newHistory.shift(); // ถ้ามากกว่า 100 รายการ ลบอันเก่าที่สุด
          
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
        
        // อัปเดต selectedCrypto ให้สอดคล้องกับราคาใหม่
        const selectedId = selectedCrypto.id;
        const newSelected = updated.find(crypto => crypto.id === selectedId);
        setSelectedCrypto(newSelected);
        
        return updated;
      });
    }, 5000); // อัปเดตทุก 5 วินาที
    
    // Cleanup: ล้าง interval เมื่อ component unmount เพื่อป้องกัน memory leak
    return () => clearInterval(interval);
  }, [selectedCrypto]); // อัปเดตเมื่อ selectedCrypto เปลี่ยนแปลง

  // ฟังก์ชันจัดการการซื้อคริปโต
  const handleBuy = () => {
    // ตรวจสอบว่า buyAmount เป็นตัวเลขที่ถูกต้องและมากกว่า 0
    if (!buyAmount || isNaN(buyAmount) || parseFloat(buyAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    const amountInUSD = parseFloat(buyAmount);
    
    // ตรวจสอบว่าเงินใน balance เพียงพอหรือไม่
    if (amountInUSD > balance) {
      alert('Insufficient balance');
      return;
    }
    
    setIsLoading(true); // แสดงสถานะโหลด
    
    // จำลองการหน่วงเวลา API 1 วินาที
    setTimeout(() => {
      const cryptoAmount = amountInUSD / selectedCrypto.price; // คำนวณจำนวนคริปโตที่ซื้อได้
      
      // อัปเดต cryptos โดยเพิ่มจำนวน owned ของคริปโตที่เลือก
      setCryptos(prevCryptos => {
        return prevCryptos.map(crypto => {
          if (crypto.id === selectedCrypto.id) {
            return { ...crypto, owned: crypto.owned + cryptoAmount };
          }
          return crypto;
        });
      });
      
      // ลดยอดเงินใน balance
      setBalance(prevBalance => prevBalance - amountInUSD);
      setBuyAmount(''); // รีเซ็ตช่องกรอกจำนวน
      
      // บันทึกประวัติการซื้อ
      const now = new Date();
      setTradeHistory(prev => [
        {
          type: 'ซื้อ',
          crypto: selectedCrypto.symbol,
          amount: cryptoAmount,
          price: selectedCrypto.price,
          total: amountInUSD,
          date: now.toLocaleString()
        },
        ...prev
      ]);
      
      setIsLoading(false); // ยกเลิกสถานะโหลด
    }, 1000);
  };
  
  // ฟังก์ชันจัดการการขายคริปโต
  const handleSell = () => {
    // ตรวจสอบว่า sellAmount เป็นตัวเลขที่ถูกต้องและมากกว่า 0
    if (!sellAmount || isNaN(sellAmount) || parseFloat(sellAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    const cryptoAmount = parseFloat(sellAmount);
    const ownedAmount = selectedCrypto.owned;
    
    // ตรวจสอบว่ามีคริปโตเพียงพอสำหรับขายหรือไม่
    if (cryptoAmount > ownedAmount) {
      alert(`You don't have enough ${selectedCrypto.symbol}`);
      return;
    }
    
    setIsLoading(true); // แสดงสถานะโหลด
    
    // จำลองการหน่วงเวลา API 1 วินาที
    setTimeout(() => {
      const amountInUSD = cryptoAmount * selectedCrypto.price; // คำนวณเงินที่ได้จากการขาย
      
      // อัปเดต cryptos โดยลดจำนวน owned ของคริปโตที่เลือก
      setCryptos(prevCryptos => {
        return prevCryptos.map(crypto => {
          if (crypto.id === selectedCrypto.id) {
            return { ...crypto, owned: crypto.owned - cryptoAmount };
          }
          return crypto;
        });
      });
      
      // เพิ่มยอดเงินใน balance
      setBalance(prevBalance => prevBalance + amountInUSD);
      setSellAmount(''); // รีเซ็ตช่องกรอกจำนวน
      
      // บันทึกประวัติการขาย
      const now = new Date();
      setTradeHistory(prev => [
        {
          type: 'ขาย',
          crypto: selectedCrypto.symbol,
          amount: cryptoAmount,
          price: selectedCrypto.price,
          total: amountInUSD,
          date: now.toLocaleString()
        },
        ...prev
      ]);
      
      setIsLoading(false); // ยกเลิกสถานะโหลด
    }, 1000);
  };
  
  // คำนวณมูลค่ารวมของ portfolio
  // portfolioValue = balance + มูลค่าคริปโตที่ถือครองทั้งหมด
  const portfolioValue = balance + cryptos.reduce((total, crypto) => {
    return total + (crypto.owned * crypto.price);
  }, 0);
  
  // ฟังก์ชันจัดรูปแบบสกุลเงิน (แปลงเป็นรูปแบบ THB)
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };
  
  // ฟังก์ชันจัดรูปแบบจำนวนคริปโตตามความแม่นยำ
  const formatCryptoAmount = (value) => {
    if (value < 0.001) return value.toFixed(8); // ถ้าน้อยกว่า 0.001 แสดงทศนิยม 8 ตำแหน่ง
    if (value < 1) return value.toFixed(4); // ถ้าน้อยกว่า 1 แสดงทศนิยม 4 ตำแหน่ง
    return value.toFixed(2); // อื่นๆ แสดงทศนิยม 2 ตำแหน่ง
  };
  
  // ฟังก์ชันดึงข้อมูลสำหรับกราฟตาม timeframe
  const getChartData = () => {
    if (!selectedCrypto?.history) return []; // ถ้าไม่มีประวัติราคา คืนอาร์เรย์ว่าง
    
    let data = [...selectedCrypto.history]; // คัดลอกประวัติราคา
    
    // กรองข้อมูลตาม timeframe
    switch (timeframe) {
      case '1H':
        data = data.slice(-12); // ดึง 12 จุดล่าสุด (1 ชั่วโมง)
        break;
      case '1D':
        data = data.slice(-24); // ดึง 24 จุดล่าสุด (1 วัน)
        break;
      case '1W':
        data = data.filter((_, index) => index % 4 === 0); // ทุกๆ 4 จุด (1 สัปดาห์)
        break;
      case '1M':
        data = data.filter((_, index) => index % 8 === 0); // ทุกๆ 8 จุด (1 เดือน)
        break;
      default:
        break;
    }
    
    return data;
  };
  
  // JSX สำหรับส่วน UI ของแอป
  return (
    // Container หลักของหน้า ใช้ Tailwind CSS เพื่อจัดสไตล์
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {/* Header: แสดงชื่อแอปและข้อมูลยอดเงิน */}
      <header className="bg-gray-800 shadow-lg p-4 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          {/* ชื่อแอปและไอคอน */}
          <h1 className="text-2xl font-bold flex items-center text-blue-400">
            <ChartBarIcon className="h-6 w-6 mr-2 text-blue-400" />
            Blackdog
          </h1>
          {/* แสดงยอดเงินคงเหลือและมูลค่ารวมของ portfolio */}
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
      
      {/* Main Content: ส่วนหลักของหน้า */}
      <main className="container mx-auto p-6 bg-gray-900">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: รายการคริปโตที่เลือกได้ */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-100">สกุลเงินดิจิทัลที่มีอยู่</h2>
            <div className="space-y-3">
              {/* แสดงรายการคริปโต */}
              {cryptos.map(crypto => (
                <div 
                  key={crypto.id} 
                  className={`flex justify-between items-center p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                    selectedCrypto.id === crypto.id ? 'bg-blue-600 shadow-md' : 'bg-gray-700 hover:bg-gray-600 hover:shadow-sm'
                  }`}
                  onClick={() => setSelectedCrypto(crypto)} // เมื่อคลิก เลือกคริปโตนี้
                >
                  <div className="flex items-center">
                    {/* ไอคอนตัวย่อ */}
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
          
          {/* Middle Column: กราฟและส่วนซื้อขาย */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chart: แสดงกราฟราคาคริปโต */}
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
                  {/* ปุ่มเลือก timeframe */}
                  {['1H', '1D', '1W', '1M'].map(tf => (
                    <button
                      key={tf}
                      className={`px-4 py-2 text-sm font-medium ${
                        timeframe === tf ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      } transition-all duration-200`}
                      onClick={() => setTimeframe(tf)} // อัปเดต timeframe
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* กราฟราคาคริปโต */}
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
                <span>อัปเดตอัตโนมัติทุกๆ 5 วินาที</span>
              </div>
            </div>
            
            {/* Trading Section: ส่วนซื้อและขาย */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Buy: ส่วนสำหรับซื้อคริปโต */}
              <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold mb-4 text-green-400">ซื้อ {selectedCrypto.symbol}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">จำนวน (USD)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                      <input
                        type="number"
                        value={buyAmount}
                        onChange={(e) => setBuyAmount(e.target.value)} // อัปเดต buyAmount
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>มีอยู่</span>
                    <span>{formatCurrency(balance)}</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    {/* ปุ่มเลือกเปอร์เซ็นต์ */}
                    {[25, 50, 75, 100].map(percent => (
                      <button
                        key={percent}
                        className="flex-1 bg-gray-700 border border-gray-600 rounded-lg py-2 text-xs hover:bg-gray-600 transition-all duration-200"
                        onClick={() => setBuyAmount((balance * (percent / 100)).toFixed(2))} // คำนวณจำนวนตามเปอร์เซ็นต์
                      >
                        {percent}%
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>โดยประมาณ {selectedCrypto.symbol}</span>
                    <span>{buyAmount ? formatCryptoAmount(parseFloat(buyAmount) / selectedCrypto.price) : '0.00'}</span>
                  </div>
                  
                  <button
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-lg transition-all duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center shadow-sm"
                    onClick={handleBuy} // เรียกฟังก์ชัน handleBuy
                    disabled={isLoading || !buyAmount || parseFloat(buyAmount) <= 0 || parseFloat(buyAmount) > balance} // ปิดใช้งานปุ่มถ้าข้อมูลไม่ถูกต้อง
                  >
                    {isLoading ? (
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      'ซื้อ'
                    )}
                  </button>
                </div>
              </div>
              
              {/* Sell: ส่วนสำหรับขายคริปโต */}
              <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold mb-4 text-red-400">ขาย {selectedCrypto.symbol}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">จำนวน ({selectedCrypto.symbol})</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={sellAmount}
                        onChange={(e) => setSellAmount(e.target.value)} // อัปเดต sellAmount
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>มีอยู่</span>
                    <span>{formatCryptoAmount(selectedCrypto.owned)} {selectedCrypto.symbol}</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    {/* ปุ่มเลือกเปอร์เซ็นต์ */}
                    {[25, 50, 75, 100].map(percent => (
                      <button
                        key={percent}
                        className="flex-1 bg-gray-700 border border-gray-600 rounded-lg py-2 text-xs hover:bg-gray-600 transition-all duration-200"
                        onClick={() => setSellAmount((selectedCrypto.owned * (percent / 100)).toFixed(8))} // คำนวณจำนวนตามเปอร์เซ็นต์
                      >
                        {percent}%
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>โดยประมาณ USD</span>
                    <span>{sellAmount ? formatCurrency(parseFloat(sellAmount) * selectedCrypto.price) : '$0.00'}</span>
                  </div>
                  
                  <button
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 rounded-lg transition-all duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center shadow-sm"
                    onClick={handleSell} // เรียกฟังก์ชัน handleSell
                    disabled={isLoading || !sellAmount || parseFloat(sellAmount) <= 0 || parseFloat(sellAmount) > selectedCrypto.owned} // ปิดใช้งานปุ่มถ้าข้อมูลไม่ถูกต้อง
                  >
                    {isLoading ? (
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      'ขาย'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Portfolio and Trade History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Portfolio: แสดงข้อมูลคริปโตที่ผู้ใช้ถือครอง */}
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
          
          {/* Trade History: แสดงประวัติการซื้อขาย */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-100">ประวัติการเทรด</h2>
            {tradeHistory.length > 0 ? (
              <div className="overflow-y-auto max-h-80">
                <table className="w-full text-gray-100">
                  <thead>
                    <tr className="text-gray-400 text-sm border-b border-gray-700">
                      <th className="pb-3 text-left">ประเภท</th>
                      <th className="pb-3 text-left">สินทรัพย์</th>
                      <th className="pb-3 text-right">จำนวน</th>
                      <th className="pb-3 text-right">ราคา</th>
                      <th className="pb-3 text-right">ทั้งหมด</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tradeHistory.map((trade, index) => (
                      <tr key={index} className="border-b border-gray-700 hover:bg-gray-700 transition-all duration-200">
                        <td className="py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            trade.type === 'ซื้อ' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
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
                <p>ยังไม่มีการเทรด</p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Footer: แสดงข้อมูลลิขสิทธิ์และคำอธิบายเพิ่มเติม */}
      <footer className="bg-gray-800 p-4 mt-6">
        <div className="container mx-auto text-center text-gray-400 text-sm">
          <p>CryptoTrade Simulator © {new Date().getFullYear()}</p>
          <p className="mt-1">This is a simulated trading platform for educational purposes only.</p>
        </div>
      </footer>
    </div>
  );
}

// styles/globals.css
// เพิ่มในไฟล์ globals.css เพื่อใช้ Tailwind CSS
// @tailwind base;
// @tailwind components;
// @tailwind utilities;

// package.json dependency example
// ตัวอย่าง dependencies ที่ต้องติดตั้ง
// "dependencies": {
//   "next": "12.3.1",
//   "react": "18.2.0",
//   "react-dom": "18.2.0",
//   "recharts": "^2.1.16",
//   "@heroicons/react": "^2.0.13"
// }

// tailwind.config.js
// การตั้งค่า Tailwind CSS
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