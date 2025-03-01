import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  onClose: () => void;
}

export default function ChatInterface({ onClose }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: 'สวัสดีครับ ผมเป็นผู้ช่วยวิเคราะห์ปัญหายานพาหนะ คุณสามารถอธิบายอาการหรือปัญหาที่พบกับรถของคุณได้เลยครับ',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, isLoading: authLoading } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleCloseRequest = () => {
    setShowConfirmDialog(true);
  };

  const confirmClose = () => {
    setShowConfirmDialog(false);
    onClose();
  };

  const cancelClose = () => {
    setShowConfirmDialog(false);
  };

  const handleSendMessage = async () => {
    if (input.trim() === '') return;
    
    const userMessage = input.trim();
    setInput('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date() }]);
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/vehicle-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userMessage,
          history: messages.map(({ role, content }) => ({ role, content }))
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.response,
          timestamp: new Date()
        }]);
      } else {
        console.error('Error:', data.error);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'ขออภัยครับ เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้ง',
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'ขออภัยครับ เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  };

  // Confirm close dialog
  const ConfirmCloseDialog = () => (
    <AnimatePresence>
      {showConfirmDialog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60]"
          onClick={cancelClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl p-6 max-w-xs w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">ยืนยันการปิดแชท</h3>
            <p className="text-gray-600 mb-6">คุณต้องการปิดแชทนี้ใช่หรือไม่? ประวัติการสนทนาจะไม่ถูกบันทึก</p>
            <div className="flex space-x-3">
              <button
                onClick={cancelClose}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmClose}
                className="flex-1 py-2 bg-red-600 rounded-lg text-white font-medium hover:bg-red-700 transition-colors"
              >
                ปิดแชท
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (authLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <motion.div 
          className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 mx-4"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg md:text-xl font-bold text-gray-800">ระบบช่วยเหลือปัญหายานพาหนะ</h2>
            <button 
              onClick={handleCloseRequest} 
              className="text-gray-500 hover:text-gray-800 transition-colors rounded-full p-1 hover:bg-gray-100"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div className="text-center py-10">
            <div className="flex justify-center">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="mt-6 text-gray-600 font-medium">กำลังโหลด...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <motion.div 
          className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 mx-4"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg md:text-xl font-bold text-gray-800">ระบบช่วยเหลือปัญหายานพาหนะ</h2>
            <button 
              onClick={handleCloseRequest} 
              className="text-gray-500 hover:text-gray-800 transition-colors rounded-full p-1 hover:bg-gray-100"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div className="text-center py-8">
            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">กรุณาเข้าสู่ระบบ</h3>
            <p className="mt-2 text-gray-600">
              คุณต้องเข้าสู่ระบบก่อนใช้งานระบบช่วยเหลือปัญหายานพาหนะ
            </p>
            <div className="mt-8">
              <a 
                href="/login" 
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                เข้าสู่ระบบ
              </a>
            </div>
          </div>
        </motion.div>
        <ConfirmCloseDialog />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div 
        className="bg-white rounded-xl shadow-2xl w-full h-full md:max-w-2xl md:h-[85vh] flex flex-col overflow-hidden"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex justify-between items-center p-3 md:p-4 border-b bg-gradient-to-r from-blue-600 to-blue-500 text-white">
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="bg-white/20 p-1.5 md:p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 9.05a3 3 0 0 0-4.5.7m0 0h-1a2.5 2.5 0 0 0 0 5h1a2 2 0 0 1 0 4h-1"/>
                <circle cx="8.5" cy="8.5" r="6.5"/>
                <path d="M3.75 10A6.5 6.5 0 1 0 15 15.5H7.5"/>
                <path d="m16 16 3 3"/>
              </svg>
            </div>
            <h2 className="text-base md:text-xl font-bold">ระบบช่วยเหลือปัญหายานพาหนะ</h2>
          </div>
          <button 
            onClick={handleCloseRequest} 
            className="hover:bg-white/20 p-2 rounded-full transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 md:p-4 bg-gray-50">
          <div className="max-w-3xl mx-auto space-y-3 md:space-y-4">
            {messages.map((message, index) => (
              <motion.div 
                key={index} 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className={`max-w-[85%] md:max-w-[80%] ${message.role === 'user' ? 'order-1' : 'order-2'}`}>
                  <div className={`p-3 md:p-4 rounded-2xl ${
                    message.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
                      : 'bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-100'
                  }`}>
                    <p className="whitespace-pre-wrap text-sm md:text-base">{message.content}</p>
                  </div>
                  <div className={`text-xs text-gray-500 mt-1 ${
                    message.role === 'user' ? 'text-right mr-2' : 'ml-2'
                  }`}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
                {message.role === 'assistant' && (
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs md:text-sm font-bold mr-2 order-1 mt-1">
                    A
                  </div>
                )}
              </motion.div>
            ))}
            {isLoading && (
              <motion.div 
                className="flex justify-start"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs md:text-sm font-bold mr-2 mt-1">
                  A
                </div>
                <div className="max-w-[85%] md:max-w-[80%]">
                  <div className="p-3 md:p-4 rounded-2xl bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-100">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        <div className="p-3 md:p-4 border-t bg-white">
          <div className="flex items-end gap-2">
            <div className="flex-1 bg-gray-100 rounded-xl p-2">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="พิมพ์ข้อความของคุณที่นี่..."
                className="w-full bg-transparent border-0 focus:ring-0 resize-none max-h-32 min-h-[40px] text-sm md:text-base"
                style={{ overflow: 'hidden' }}
              />
            </div>
            <motion.button
              onClick={handleSendMessage}
              disabled={isLoading || input.trim() === ''}
              className={`p-2.5 md:p-3 rounded-full ${
                isLoading || input.trim() === '' 
                  ? 'bg-gray-300 text-gray-500' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </motion.button>
          </div>
        </div>
      </motion.div>
      
      <ConfirmCloseDialog />
    </div>
  );
}