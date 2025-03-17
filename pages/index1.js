// pages/index.js
import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import { Send, Mic, Image, Paperclip, ChevronDown, Settings, User, Bot, Moon, Sun, RefreshCw, Sparkles, PanelLeft } from 'lucide-react';

export default function Home() {
  const [messages, setMessages] = useState([
    { type: 'bot', content: 'สวัสดีครับ! มีอะไรให้ช่วยไหมครับ วันนี้คุณอยากจะถามอะไรดี?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showPromptSuggestions, setShowPromptSuggestions] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);

  const promptSuggestions = [
    "ช่วยเขียนอีเมลธุรกิจ",
    "วิธีแก้ปัญหา JavaScript",
    "แนะนำหนังสือน่าอ่าน",
    "สูตรอาหารไทย",
    "วิธีจัดการความเครียด",
    "เทคนิคการเขียนโค้ด"
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Focus input field when page loads
    inputRef.current?.focus();
    
    // Add class to body for font
    document.body.classList.add('font-prompt');
    
    // Setup keyboard shortcut (Ctrl+/ or Cmd+/) to focus input
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage = { type: 'user', content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);
    
    // Auto-hide prompt suggestions when user sends a message
    setShowPromptSuggestions(false);

    // Simulate AI response (in a real app, this would be an API call)
    setTimeout(() => {
      // Example AI response
      const aiResponse = { 
        type: 'bot', 
        content: `ขอบคุณสำหรับคำถาม! นี่คือคำตอบสำหรับ: "${inputValue}"` 
      };
      setMessages(prev => [...prev, aiResponse]);
      setLoading(false);
    }, 1500);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // Add animation to the transition
    document.documentElement.classList.add('transition-colors', 'duration-300');
    setTimeout(() => {
      document.documentElement.classList.remove('transition-colors', 'duration-300');
    }, 300);
  };

  const selectPromptSuggestion = (suggestion) => {
    setInputValue(suggestion);
    inputRef.current.focus();
  };

  const clearChat = () => {
    // Add simple animation before clearing
    if (chatContainerRef.current) {
      chatContainerRef.current.classList.add('opacity-0', 'transition-opacity', 'duration-300');
      setTimeout(() => {
        setMessages([{ type: 'bot', content: 'สวัสดีครับ! มีอะไรให้ช่วยไหมครับ วันนี้คุณอยากจะถามอะไรดี?' }]);
        chatContainerRef.current.classList.remove('opacity-0');
      }, 300);
    } else {
      setMessages([{ type: 'bot', content: 'สวัสดีครับ! มีอะไรให้ช่วยไหมครับ วันนี้คุณอยากจะถามอะไรดี?' }]);
    }
  };

  return (
    <div className={`flex flex-col min-h-screen transition-colors duration-300 font-prompt ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50'}`}>
      <Head>
        <title>AI Chat Assistant</title>
        <meta name="description" content="คุยกับผู้ช่วย AI อัจฉริยะของเรา" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <style jsx global>{`
          * {
            font-family: 'Prompt', sans-serif;
          }
        `}</style>
      </Head>

      {/* Header */}
      <header className={`sticky top-0 z-10 px-4 py-3 flex justify-between items-center border-b backdrop-blur-md ${darkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-200'} transition-all duration-300`}>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowSidebar(!showSidebar)}
            className={`md:hidden p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors duration-200`}
          >
            <PanelLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Bot className="w-6 h-6 text-blue-500" />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
            </div>
            <h1 className="text-xl font-semibold">UYS AI</h1>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={toggleDarkMode} 
            className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-all duration-200 transform hover:scale-105`}
            title={darkMode ? "สลับเป็นโหมดสว่าง" : "สลับเป็นโหมดมืด"}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button 
            onClick={clearChat}
            className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-all duration-200 transform hover:scale-105`}
            title="เริ่มการสนทนาใหม่"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button 
            className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-all duration-200 transform hover:scale-105`}
            title="การตั้งค่า"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (hidden on mobile) */}
        <div className={`${showSidebar ? 'block' : 'hidden'} md:block w-64 flex-shrink-0 border-r overflow-y-auto ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} transition-all duration-300`}>
          <div className="p-4">
            <h2 className="font-semibold text-lg mb-2 flex items-center">
              <Sparkles className="w-4 h-4 mr-2 text-blue-500" />
              การสนทนาล่าสุด
            </h2>
            <div className={`space-y-2 mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <button className={`w-full text-left px-3 py-2 rounded-lg text-sm ${darkMode ? 'hover:bg-gray-700 bg-gray-700/50' : 'hover:bg-gray-100 bg-gray-100'}`}>
                การสนทนาปัจจุบัน
              </button>
              <button className={`w-full text-left px-3 py-2 rounded-lg text-sm ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                วิธีใช้ Next.js
              </button>
              <button className={`w-full text-left px-3 py-2 rounded-lg text-sm ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                สูตรอาหาร
              </button>
            </div>
          </div>
        </div>

        {/* Main Chat Container */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Prompt Suggestions */}
          {showPromptSuggestions && (
            <div className={`px-4 py-3 ${darkMode ? 'bg-gray-800/50' : 'bg-white/70'} backdrop-blur-sm border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} transition-all duration-300`}>
              <div className="max-w-3xl mx-auto">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <Sparkles className="w-4 h-4 mr-2 text-blue-500" />
                  คำถามยอดนิยม
                </h3>
                <div className="flex flex-wrap gap-2">
                  {promptSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => selectPromptSuggestion(suggestion)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all duration-200 transform hover:scale-105 ${
                        darkMode 
                          ? 'bg-gray-700 hover:bg-gray-600 text-white shadow-md' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-800 shadow-sm'
                      }`}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Chat Messages */}
          <main 
            ref={chatContainerRef}
            className={`flex-1 overflow-y-auto p-4 transition-opacity duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}
          >
            <div className="max-w-3xl mx-auto">
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`flex mb-4 ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`flex max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex items-center justify-center h-8 w-8 rounded-full flex-shrink-0 ${
                      message.type === 'user' 
                        ? 'bg-blue-500 ml-2 shadow-md' 
                        : `${darkMode ? 'bg-gray-700' : 'bg-gray-200'} mr-2`
                    }`}>
                      {message.type === 'user' 
                        ? <User className="w-5 h-5 text-white" /> 
                        : <Bot className="w-5 h-5 text-blue-500" />
                      }
                    </div>
                    <div className={`p-3 rounded-2xl ${
                      message.type === 'user' 
                        ? 'bg-blue-500 text-white shadow-md' 
                        : darkMode ? 'bg-gray-800 text-white shadow-md' : 'bg-white text-gray-800 shadow-sm'
                    } transition-all duration-300`}>
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start mb-4 animate-fadeIn">
                  <div className="flex">
                    <div className={`flex items-center justify-center h-8 w-8 rounded-full mr-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <Bot className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className={`p-4 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                      <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </main>

          {/* Input Area */}
          <footer className={`px-4 py-4 border-t ${darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-gray-200'} backdrop-blur-md transition-colors duration-300`}>
            <div className="max-w-3xl mx-auto relative">
              <form onSubmit={handleSubmit} className="relative">
                <div className={`absolute left-0 top-0 h-full flex items-center justify-center w-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <button
                    type="button"
                    onClick={() => setShowPromptSuggestions(!showPromptSuggestions)}
                    className="transform transition-transform duration-300 hover:scale-110"
                    title={showPromptSuggestions ? "ซ่อนคำแนะนำ" : "แสดงคำแนะนำ"}
                  >
                    <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${showPromptSuggestions ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="พิมพ์ข้อความของคุณที่นี่..."
                  className={`w-full pl-12 pr-36 py-4 rounded-2xl focus:outline-none transition-all duration-300 ${
                    darkMode 
                      ? 'bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 shadow-inner' 
                      : 'bg-gray-100 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 shadow-sm'
                  }`}
                />
                
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1.5">
                  <button 
                    type="button"
                    className={`p-1.5 rounded-full transition-colors duration-200 ${darkMode ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'}`}
                    title="แนบไฟล์"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <button 
                    type="button"
                    className={`p-1.5 rounded-full transition-colors duration-200 ${darkMode ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'}`}
                    title="แนบรูปภาพ"
                  >
                    <Image className="w-5 h-5" />
                  </button>
                  <button 
                    type="button"
                    className={`p-1.5 rounded-full transition-colors duration-200 ${darkMode ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'}`}
                    title="บันทึกเสียง"
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                  <button 
                    type="submit"
                    disabled={!inputValue.trim()}
                    className={`p-3 rounded-full bg-blue-500 text-white transition-all duration-300 ${
                      !inputValue.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600 shadow-md hover:shadow-lg transform hover:scale-105'
                    }`}
                    title="ส่งข้อความ"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
              
              <div className="text-xs text-center mt-2.5 text-gray-500">
                กด <kbd className={`px-1.5 py-0.5 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>Ctrl</kbd> + <kbd className={`px-1.5 py-0.5 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>/</kbd> เพื่อโฟกัสช่องข้อความ
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

