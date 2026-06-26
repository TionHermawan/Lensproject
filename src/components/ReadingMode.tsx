'use client';

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
          className="fixed inset-0 z-50 bg-bg overflow-y-auto"
        >
          {/* Refined close button with subtle backdrop blur & hover effect */}
          <button
            onClick={onClose}
            className="fixed top-8 right-8 z-50 p-2.5 rounded-full border border-text/10 bg-white/30 backdrop-blur-md text-text/60 hover:text-text hover:bg-white/50 hover:scale-105 transition-all duration-300 transform cursor-pointer"
            aria-label="Tutup"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
          
          <div className="max-w-xl mx-auto py-24 px-6 text-left">
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="font-serif text-3xl md:text-4xl font-bold mb-3 tracking-tight text-text leading-tight"
            >
              {poem.title}
            </motion.h2>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-text/70 font-serif italic mb-16 text-base md:text-lg"
            >
              Karya: {poem.author?.name}
            </motion.p>
            
            <motion.pre 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="font-serif text-base md:text-lg text-text/90 leading-[2.2] whitespace-pre-wrap break-words max-w-full overflow-x-auto"
            >
              {poem.content}
            </motion.pre>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
