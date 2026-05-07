'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabaseFetch } from '@/lib/supabase';
import ReadingMode from '@/components/ReadingMode';

export default function Home() {
  const [readingPoem, setReadingPoem] = useState<any | null>(null);
  const [poems, setPoems] = useState<any[]>([]);
  const [winners, setWinners] = useState<any[]>([]);
  const [themes, setThemes] = useState<any[]>([]);
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [activeTheme, setActiveTheme] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [poemsData, themesData, sponsorsData] = await Promise.all([
          supabaseFetch('poems', 'select=*,author:authors(name)&order=created_at.desc'),
          supabaseFetch('themes', 'select=*'),
          supabaseFetch('sponsors', 'select=*')
        ]);

        if (poemsData) {
          setPoems(poemsData);
          setWinners(poemsData.filter((p: any) => p.is_winner).sort((a: any, b: any) => (a.rank || 99) - (b.rank || 99)));
        }
        if (themesData) setThemes(themesData);
        if (sponsorsData) setSponsors(sponsorsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filteredPoems = activeTheme === 'all' 
    ? poems 
    : poems.filter(p => p.theme_id?.toString() === activeTheme.toString());

  return (
    <>
      <div className={`transition-all duration-500 ${readingPoem ? 'opacity-10 blur-sm pointer-events-none' : ''}`}>
        <nav className="flex justify-between items-center py-8 px-8 md:px-16 sticky top-0 bg-bg/90 backdrop-blur-md z-10 border-b border-border/10">
          <div className="flex items-center gap-4">
            <img 
              src="/favicon.png" 
              alt="Lens Community Logo" 
              className="h-16 md:h-20 w-auto object-contain"
              onLoad={(e) => {
                // Sembunyikan teks teks jika logo berhasil dimuat karena logo sudah ada tulisannya
                e.currentTarget.parentElement?.querySelector('.brand-text')?.classList.add('hidden');
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.querySelector('.fallback-logo')?.classList.remove('hidden');
                e.currentTarget.parentElement?.querySelector('.brand-text')?.classList.remove('hidden');
              }}
            />
            <div className="fallback-logo hidden w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white font-bold">L</div>
            <div className="brand-text font-serif text-2xl italic tracking-wide text-text">Lens Community</div>
          </div>
          <div className="hidden md:flex space-x-8 text-sm font-medium">
            <a href="#hall-of-fame" className="hover:text-accent transition-colors">Hall of Fame</a>
            <a href="#katalog" className="hover:text-accent transition-colors">Katalog</a>
            <a href="#sponsor" className="hover:text-accent transition-colors">Sponsor</a>
          </div>
        </nav>

        <header className="text-center py-24 px-4 max-w-3xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-5xl md:text-7xl mb-6 text-text"
          >
            Menuju Temu Sastra: <span className="text-accent italic">Lentera Puisi 2026</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-light text-gray-600 text-lg md:text-xl"
          >
            Sebuah perjalanan menuju perayaan kata, merayakan kedalaman makna dalam harmoni visual.
          </motion.p>
        </header>

        <main className="max-w-7xl mx-auto px-4 md:px-8 pb-24">
          {/* Hall of Fame */}
          <section id="hall-of-fame" className="py-16">
            <h2 className="font-serif text-3xl text-center mb-12">Hall of Fame</h2>
            
            {loading ? (
              <div className="text-center text-gray-400">Memuat data...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {winners.map((winner, idx) => (
                  <motion.div
                    key={winner.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      onClick={() => setReadingPoem(winner)}
                      className="relative bg-white/80 backdrop-blur-sm p-8 border border-primary/30 cursor-pointer group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col h-full"
                    >
                      <div className="absolute -top-3 left-6 bg-highlight px-3 font-serif italic text-sm text-text border border-border">
                        Juara {winner.rank}
                      </div>
                    <h3 className="font-serif text-2xl mb-2 group-hover:text-accent transition-colors">{winner.title}</h3>
                    <p className="text-sm text-primary mb-6 font-serif italic">{winner.author?.name}</p>
                    <p className="font-light italic text-gray-600 flex-grow line-clamp-4">
                      {winner.content.substring(0, 150)}...
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          {/* Katalog */}
          <section id="katalog" className="py-16">
            <h2 className="font-serif text-3xl text-center mb-8">Eksplorasi Karya</h2>
            
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <button 
                onClick={() => setActiveTheme('all')}
                className={`px-6 py-2 rounded-full border transition-all ${
                  activeTheme === 'all' 
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
                  className={`px-6 py-2 rounded-full border transition-all ${
                    activeTheme === theme.id 
                    ? 'bg-primary text-white border-primary' 
                    : 'border-border/30 text-text hover:bg-highlight'
                }`}
              >
                {theme.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {!loading && filteredPoems.length === 0 && (
              <p className="col-span-full text-center text-primary/60">Tidak ada puisi di kategori ini.</p>
            )}
            {filteredPoems.map((poem, idx) => (
              <motion.div
                key={poem.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setReadingPoem(poem)}
                className="bg-white/50 backdrop-blur-sm p-8 border border-border/20 cursor-pointer group hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col h-full"
              >
                <h3 className="font-serif text-xl mb-2 group-hover:text-accent transition-colors">{poem.title}</h3>
                <p className="text-sm text-primary/70 mb-6 font-serif italic">{poem.author?.name}</p>
                  <p className="font-light italic text-gray-600 flex-grow line-clamp-4">
                    {poem.content.substring(0, 150)}...
                  </p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Sponsor */}
          <section id="sponsor" className="py-24 border-t border-border/20 mt-16">
            <h2 className="font-serif text-2xl text-center mb-12 text-primary/60">Didukung Oleh</h2>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
              {sponsors.map(sponsor => (
                <a 
                  key={sponsor.id} 
                  href={sponsor.website_url || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:scale-110 transition-transform duration-300"
                  title={sponsor.name}
                >
                  {sponsor.logo_url ? (
                    <img src={sponsor.logo_url} alt={sponsor.name} className="h-12 md:h-16 w-auto object-contain" />
                  ) : (
                    <div className="font-serif text-2xl font-semibold text-text">{sponsor.name}</div>
                  )}
                </a>
              ))}
              {!loading && sponsors.length === 0 && (
                <div className="font-serif text-2xl font-semibold opacity-40">Lens Foundation</div>
              )}
            </div>
          </section>
        </main>
      </div>

      <ReadingMode poem={readingPoem} onClose={() => setReadingPoem(null)} />
    </>
  );
}
