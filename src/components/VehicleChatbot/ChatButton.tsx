import { useState } from 'react';
import ChatInterface from './ChatInterface';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatButton() {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <motion.button
        onClick={handleOpen}
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-full p-3 md:p-4 shadow-xl transition-all duration-300 flex items-center z-40"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="mr-1 md:mr-2"
          >
            <path d="M14 9.05a3 3 0 0 0-4.5.7m0 0h-1a2.5 2.5 0 0 0 0 5h1a2 2 0 0 1 0 4h-1"/>
            <circle cx="8.5" cy="8.5" r="6.5"/>
            <path d="M3.75 10A6.5 6.5 0 1 0 15 15.5H7.5"/>
            <path d="m16 16 3 3"/>
          </svg>
          <span className="text-sm md:text-base font-medium">ปรึกษาปัญหารถ</span>
        </div>
      </motion.button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="z-50"
          >
            <ChatInterface onClose={handleClose} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}