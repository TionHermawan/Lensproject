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

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        <nav className="flex justify-between items-center py-4 px-4 md:px-16 sticky top-0 bg-bg/95 backdrop-blur-md z-50 border-b border-border/10 transition-all duration-300">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Lens Community Logo"
              className="h-8 md:h-10 w-auto object-contain"
              onError={(e) => {
                // Fallback jika logo.png belum ada
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.querySelector('.fallback-logo')?.classList.remove('hidden');
              }}
            />
            <div className="fallback-logo hidden w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white font-bold text-xs">L</div>
            <div className="font-serif text-lg md:text-xl italic tracking-wide text-text">Lens Community</div>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 text-sm font-medium">
            <a href="#hall-of-fame" className="hover:text-accent transition-colors">Hall of Fame</a>
            <a href="#katalog" className="hover:text-accent transition-colors">Katalog</a>
            <a href="#buku-fisik" className="hover:text-accent transition-colors">Buku Fisik</a>
            <a href="#sponsor" className="hover:text-accent transition-colors">Sponsor</a>
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
            <a href="#hall-of-fame" onClick={() => setIsMobileMenuOpen(false)} className="block hover:text-accent transition-colors border-b border-border/5 pb-2">Hall of Fame</a>
            <a href="#katalog" onClick={() => setIsMobileMenuOpen(false)} className="block hover:text-accent transition-colors border-b border-border/5 pb-2">Katalog</a>
            <a href="#buku-fisik" onClick={() => setIsMobileMenuOpen(false)} className="block hover:text-accent transition-colors border-b border-border/5 pb-2">Buku Fisik</a>
            <a href="#sponsor" onClick={() => setIsMobileMenuOpen(false)} className="block hover:text-accent transition-colors">Sponsor</a>
          </div>
        </div>

        <header className="text-center py-24 px-4 max-w-3xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-5xl md:text-7xl mb-6 text-text"
          >
            Temu Sastra: <br /> <span className="text-accent italic">Lentera Puisi 2026</span>
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

          {/* Pembelian Buku Fisik */}
          <section id="buku-fisik" className="py-24 border-t border-border/20 mt-8">
            <div className="max-w-5xl mx-auto bg-gradient-to-br from-highlight/50 to-white/80 rounded-3xl p-8 md:p-12 shadow-2xl border border-primary/10 flex flex-col md:flex-row gap-12 items-center">

              {/* Preview Buku */}
              <div className="w-full md:w-1/2 flex justify-center" style={{ perspective: '1000px' }}>
                <motion.div
                  initial={{ rotateY: -20, opacity: 0 }}
                  whileInView={{ rotateY: 0, opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  className="relative group cursor-pointer"
                >
                  <div className="w-64 h-96 bg-primary rounded-r-2xl rounded-l-md shadow-2xl overflow-hidden relative border-l-8 border-[#3b352b] transform transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-y-12">
                    <div className="absolute inset-0 bg-black/20 mix-blend-multiply pointer-events-none"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none"></div>
                    <div className="p-8 h-full flex flex-col justify-between text-[#E5E0D8]">
                      <div>
                        <p className="text-xs tracking-widest uppercase mb-2 opacity-80">Antologi</p>
                        <h3 className="font-serif text-3xl font-bold leading-tight">Lentera<br />Puisi 2026</h3>
                      </div>
                      <div className="mt-auto">
                        <div className="w-12 h-1 bg-accent mb-4"></div>
                        <p className="font-light text-sm opacity-90">Lens Community</p>
                      </div>
                    </div>
                  </div>
                  {/* Efek bayangan */}
                  <div className="absolute -bottom-6 left-4 right-4 h-6 bg-black/30 blur-xl rounded-[100%] transition-opacity duration-500 group-hover:opacity-60"></div>
                </motion.div>
              </div>

              {/* Pembelian */}
              <div className="w-full md:w-1/2">
                <div className="mb-8">
                  <h2 className="font-serif text-4xl mb-3 text-text">Miliki Bukunya</h2>
                  <p className="text-gray-600 font-light">Dapatkan antologi puisi eksklusif Lentera Puisi 2026 dalam bentuk fisik. Cetakan terbatas dengan desain premium. Pembelian kini lebih mudah, aman, dan dapat dilacak pengirimannya melalui Shopee.</p>
                </div>

                <div className="space-y-4">
                  <a
                    href="https://shopee.co.id/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full mt-6 bg-[#ee4d2d] hover:bg-[#ee4d2d]/90 text-white font-medium py-4 px-6 rounded-xl transition-all flex justify-center items-center gap-3 hover:shadow-lg transform hover:-translate-y-1"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm-9.83-3.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1v2h2l3.6 7.59-1.35 2.44C4.52 15.37 5.48 17 7 17h12v-2H7l.17-.25z"/>
                    </svg>
                    <span>Pesan Sekarang</span>
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Sponsor */}
          <section id="sponsor" className="py-8 border-t border-border/20 mt-4">
            <h2 className="font-serif text-sm text-center mb-4 text-primary/60 uppercase tracking-widest">Didukung Oleh</h2>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
              {sponsors.map(sponsor => (
                <a
                  key={sponsor.id}
                  href={sponsor.website_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:scale-105 transition-transform duration-300"
                  title={sponsor.name}
                >
                  {sponsor.logo_url ? (
                    <img src={sponsor.logo_url} alt={sponsor.name} className="w-[400px] h-[100px] object-contain" />
                  ) : (
                    <div className="font-serif text-lg font-semibold text-text">{sponsor.name}</div>
                  )}
                </a>
              ))}
              {!loading && sponsors.length === 0 && (
                <div className="font-serif text-lg font-semibold opacity-40">Lens Foundation</div>
              )}
            </div>
          </section>
        </main>
      </div>

      <ReadingMode poem={readingPoem} onClose={() => setReadingPoem(null)} />
    </>
  );
}
