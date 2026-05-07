'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface Poem {
  id: number;
  title: string;
  author: { name: string };
  content: string;
  is_winner: boolean;
  rank: number | null;
}

interface ReadingModeProps {
  poem: Poem | null;
  onClose: () => void;
}

export default function ReadingMode({ poem, onClose }: ReadingModeProps) {
  return (
    <AnimatePresence>
      {poem && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-bg overflow-y-auto py-20 px-4"
        >
          <button
            onClick={onClose}
            className="fixed top-8 right-8 text-text hover:text-accent transition-colors hover:scale-110 transform"
          >
            <X size={40} strokeWidth={1} />
          </button>
          
          <div className="max-w-2xl mx-auto text-center">
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="font-serif text-4xl md:text-5xl mb-2 text-text"
            >
              {poem.title}
            </motion.h2>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-accent font-serif italic mb-16"
            >
              {poem.author?.name}
            </motion.p>
            
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg leading-loose text-left whitespace-pre-line"
            >
              {poem.content}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
