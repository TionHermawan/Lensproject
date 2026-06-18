'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { supabaseFetch } from '@/lib/supabase';
import ReadingMode from '@/components/ReadingMode';

export default function Katalog() {
  const [readingPoem, setReadingPoem] = useState<any | null>(null);
  const [poems, setPoems] = useState<any[]>([]);
  const [themes, setThemes] = useState<any[]>([]);
  const [activeTheme, setActiveTheme] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [poemsData, themesData] = await Promise.all([
          supabaseFetch('poems', 'select=*,author:authors(name)&order=created_at.desc'),
          supabaseFetch('themes', 'select=*')
        ]);

        if (poemsData) {
          setPoems(poemsData);
        }
        if (themesData) setThemes(themesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filteredPoems = poems.filter(p => {
    const matchesTheme = activeTheme === 'all' || p.theme_id?.toString() === activeTheme.toString();
    const matchesSearch = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (p.author?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTheme && matchesSearch;
  });

  return (
    <>
      <div className={`transition-all duration-500 min-h-screen flex flex-col ${readingPoem ? 'opacity-10 blur-sm pointer-events-none' : ''}`}>
        <nav className="flex justify-between items-center py-4 px-4 md:px-16 sticky top-0 bg-bg/95 backdrop-blur-md z-50 border-b border-border/10 transition-all duration-300">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Lens Community Logo"
              className="h-8 md:h-10 w-auto object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.querySelector('.fallback-logo')?.classList.remove('hidden');
              }}
            />
            <div className="fallback-logo hidden w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white font-bold text-xs">L</div>
            <div className="font-serif text-lg md:text-xl italic tracking-wide text-text">Lens Community</div>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 text-sm font-medium">
            <Link href="/#hall-of-fame" className="hover:text-accent transition-colors">Hall of Fame</Link>
            <Link href="/katalog" className="text-accent transition-colors">Katalog</Link>
            <Link href="/#buku-fisik" className="hover:text-accent transition-colors">Buku Fisik</Link>
            <Link href="/#sponsor" className="hover:text-accent transition-colors">Sponsor</Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-text hover:text-accent transition-colors focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </nav>

        {/* Mobile Menu Dropdown */}
        <div 
          className={`md:hidden fixed left-0 right-0 bg-bg/95 backdrop-blur-md border-b border-border/10 transition-all duration-300 ease-in-out z-40 overflow-hidden ${
            isMobileMenuOpen ? 'max-h-64 opacity-100 py-4 shadow-lg' : 'max-h-0 opacity-0 py-0'
          }`}
        >
          <div className="flex flex-col px-6 space-y-4 text-center font-serif text-lg">
            <Link href="/#hall-of-fame" onClick={() => setIsMobileMenuOpen(false)} className="block hover:text-accent transition-colors border-b border-border/5 pb-2">Hall of Fame</Link>
            <Link href="/katalog" onClick={() => setIsMobileMenuOpen(false)} className="block text-accent transition-colors border-b border-border/5 pb-2">Katalog</Link>
            <Link href="/#buku-fisik" onClick={() => setIsMobileMenuOpen(false)} className="block hover:text-accent transition-colors border-b border-border/5 pb-2">Buku Fisik</Link>
            <Link href="/#sponsor" onClick={() => setIsMobileMenuOpen(false)} className="block hover:text-accent transition-colors">Sponsor</Link>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 md:px-8 py-12 flex-grow w-full">
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl md:text-5xl mb-4 text-text">Katalog Karya</h1>
            <p className="font-light text-gray-600">Jelajahi seluruh karya puisi dari Temu Sastra Lentera Puisi 2026.</p>
          </div>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto mb-10 relative">
            <input 
              type="text" 
              placeholder="Cari judul puisi atau nama penulis..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 rounded-full border border-border/40 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-text pr-12"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <button
              onClick={() => setActiveTheme('all')}
              className={`px-6 py-2 rounded-full border transition-all ${activeTheme === 'all'
                  ? 'bg-[#2D2D2D] text-white border-[#2D2D2D]'
                  : 'border-[#E5E0D8] text-[#2D2D2D] hover:bg-gray-100'
                }`}
            >
              Semua
            </button>
            {themes.map(theme => (
              <button
                key={theme.id}
                onClick={() => setActiveTheme(theme.id)}
                className={`px-6 py-2 rounded-full border transition-all ${activeTheme === theme.id
                    ? 'bg-primary text-white border-primary'
                    : 'border-border/30 text-text hover:bg-highlight'
                  }`}
              >
                {theme.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              <p className="col-span-full text-center text-primary/60">Memuat data...</p>
            ) : filteredPoems.length === 0 ? (
              <p className="col-span-full text-center text-primary/60">Tidak ada puisi yang ditemukan.</p>
            ) : (
              filteredPoems.map((poem, idx) => (
                <motion.div
                  key={poem.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (idx % 10) * 0.05 }}
                  onClick={() => setReadingPoem(poem)}
                  className="bg-white/50 backdrop-blur-sm p-8 border border-border/20 cursor-pointer group hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col h-full"
                >
                  <h3 className="font-serif text-xl mb-2 group-hover:text-accent transition-colors">{poem.title}</h3>
                  <p className="text-sm text-primary/70 mb-6 font-serif italic">{poem.author?.name}</p>
                  <p className="font-light italic text-gray-600 flex-grow line-clamp-4">
                    {poem.content.substring(0, 150)}...
                  </p>
                </motion.div>
              ))
            )}
          </div>
        </main>
      </div>

      <ReadingMode poem={readingPoem} onClose={() => setReadingPoem(null)} />
    </>
  );
}
