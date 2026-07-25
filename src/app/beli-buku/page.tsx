'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Info, Phone, RefreshCw } from 'lucide-react';
import { supabaseInsert } from '@/lib/supabase';

export default function BeliBuku() {
  // Navigation Mobile Menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Form State
  const [namaLengkap, setNamaLengkap] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  
  const [jumlahBuku, setJumlahBuku] = useState('1 Eksemplar');
  const [customJumlah, setCustomJumlah] = useState('');
  
  const [isContributor, setIsContributor] = useState('');
  
  const [namaPenerima, setNamaPenerima] = useState('');
  const [hpPenerima, setHpPenerima] = useState('');
  const [kelurahan, setKelurahan] = useState('');
  const [kecamatan, setKecamatan] = useState('');
  const [kotaKabupaten, setKotaKabupaten] = useState('');
  const [provinsi, setProvinsi] = useState('');
  const [kodePos, setKodePos] = useState('');
  const [alamatDetail, setAlamatDetail] = useState('');

  const [isAgreed, setIsAgreed] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState('');

  const getWhatsAppMessage = () => {
    const qty = jumlahBuku === 'Lainnya' ? `${customJumlah} Eksemplar` : jumlahBuku;
    const contributorText = isContributor === 'Ya' ? 'Ya (Kontributor)' : 'Bukan';
    
    let text = `*FORM PEMESANAN BUKU LENTERA PUISI 2026*\n\n`;
    text += `*Data Diri:*\n`;
    text += `- Nama Lengkap: ${namaLengkap}\n`;
    text += `- WhatsApp: ${whatsapp}\n`;
    text += `- Email: ${email}\n\n`;
    
    text += `*Detail Pesanan:*\n`;
    text += `- Jumlah: ${qty}\n`;
    text += `- Status Kontributor: ${contributorText}\n\n`;
    
    text += `*Alamat Pengiriman:*\n`;
    text += `- Nama Penerima: ${namaPenerima}\n`;
    text += `- No. HP: ${hpPenerima}\n`;
    text += `- Alamat Detail: ${alamatDetail}\n`;
    text += `- Wilayah: Kel. ${kelurahan}, Kec. ${kecamatan}, ${kotaKabupaten}, Prov. ${provinsi}, ${kodePos}\n\n`;
    
    text += `Halo Admin, saya ingin memesan buku *Lentera Puisi 2026* dengan detail di atas. Mohon info nomor rekening dan total pembayaran (termasuk ongkir) yang harus saya bayar. Terima kasih!`;

    return encodeURIComponent(text);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!namaLengkap || !whatsapp || !email) {
      setErrorMsg('Mohon isi Data Diri Anda dengan lengkap.');
      return;
    }
    if (!jumlahBuku || (jumlahBuku === 'Lainnya' && !customJumlah)) {
      setErrorMsg('Mohon pilih jumlah buku yang ingin dipesan.');
      return;
    }
    if (isContributor === '') {
      setErrorMsg('Mohon pilih status kontributor Anda.');
      return;
    }
    if (!namaPenerima || !hpPenerima || !kelurahan || !kecamatan || !kotaKabupaten || !provinsi || !kodePos || !alamatDetail) {
      setErrorMsg('Mohon lengkapi seluruh kolom Alamat Pengiriman.');
      return;
    }
    if (!isAgreed) {
      setErrorMsg('Anda harus menyetujui ketentuan pemesanan.');
      return;
    }

    setIsSaving(true);
    
    try {
      const qty = jumlahBuku === 'Lainnya' ? `${customJumlah} Eksemplar` : jumlahBuku;
      const contributorText = isContributor === 'Ya' ? 'Ya (Kontributor)' : 'Bukan';
      
      await supabaseInsert('orders', {
        buyer_name: namaLengkap,
        buyer_whatsapp: whatsapp,
        buyer_email: email,
        quantity: qty,
        is_contributor: contributorText,
        recipient_name: namaPenerima,
        recipient_phone: hpPenerima,
        address_detail: alamatDetail,
        subdistrict: kelurahan,
        district: kecamatan,
        city: kotaKabupaten,
        province: provinsi,
        postal_code: kodePos,
        status: 'Pending'
      });
      
      setIsSubmitted(true);
      
      // Redirect to WhatsApp
      const waUrl = `https://wa.me/6287845112110?text=${getWhatsAppMessage()}`;
      window.open(waUrl, '_blank');
    } catch (err: any) {
      setErrorMsg(`Gagal menyimpan pesanan: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <>
      <div className="transition-all duration-500 min-h-screen flex flex-col bg-bg text-text">
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
            <Link href="/katalog" className="hover:text-accent transition-colors">Katalog</Link>
            <Link href="/#buku-fisik" className="text-accent transition-colors">Buku Fisik</Link>
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
            <Link href="/katalog" onClick={() => setIsMobileMenuOpen(false)} className="block hover:text-accent transition-colors border-b border-border/5 pb-2">Katalog</Link>
            <Link href="/#buku-fisik" onClick={() => setIsMobileMenuOpen(false)} className="block text-accent transition-colors border-b border-border/5 pb-2">Buku Fisik</Link>
            <Link href="/#sponsor" onClick={() => setIsMobileMenuOpen(false)} className="block hover:text-accent transition-colors">Sponsor</Link>
          </div>
        </div>

        <main className="max-w-4xl mx-auto px-4 md:px-8 py-12 flex-grow w-full">
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-border/10">
            <div>
              <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors text-sm font-medium mb-4">
                <ArrowLeft size={16} /> Kembali ke Beranda
              </Link>
              <h1 className="font-serif text-4xl md:text-5xl text-text mb-2">Formulir Pemesanan Buku</h1>
              <p className="text-gray-600 font-light text-sm md:text-base">
                Antologi Puisi Eksklusif <strong className="text-primary">Lentera Puisi 2026</strong>.
              </p>
            </div>
            <div className="shrink-0">
              <a 
                href="https://wa.me/6287845112110?text=Halo%20Admin%2C%20saya%20ingin%20bertanya%20mengenai%20pemesanan%20buku%20Lentera%20Puisi%202026." 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20BA56] text-white text-sm font-medium py-3 px-5 rounded-xl transition-all shadow-sm hover:shadow hover:-translate-y-0.5 duration-200 transform"
              >
                <Phone size={16} /> Hubungi CP Admin (WA)
              </a>
            </div>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-8 bg-white/70 backdrop-blur-md p-6 md:p-10 border border-border/20 rounded-2xl shadow-md">
              
              {/* SECTION 1: DATA DIRI */}
              <div>
                <h3 className="font-serif text-xl border-b border-border/10 pb-2 mb-4 text-primary font-bold">1. Data Diri</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1 font-medium">Nama Lengkap *</label>
                    <input 
                      type="text" 
                      required
                      value={namaLengkap} 
                      onChange={e => setNamaLengkap(e.target.value)} 
                      className="w-full border border-border/30 bg-bg/20 rounded-xl p-3 text-sm focus:border-accent focus:bg-white outline-none transition" 
                      placeholder="Contoh: Sinta Wan Anggraini" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1 font-medium">Nomor WhatsApp Aktif *</label>
                    <input 
                      type="tel" 
                      required
                      value={whatsapp} 
                      onChange={e => setWhatsapp(e.target.value)} 
                      className="w-full border border-border/30 bg-bg/20 rounded-xl p-3 text-sm focus:border-accent focus:bg-white outline-none transition" 
                      placeholder="Contoh: 08123456789" 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1 font-medium">Email *</label>
                    <input 
                      type="email" 
                      required
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      className="w-full border border-border/30 bg-bg/20 rounded-xl p-3 text-sm focus:border-accent focus:bg-white outline-none transition" 
                      placeholder="Contoh: sinta@email.com" 
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: DETAIL PESANAN */}
              <div>
                <h3 className="font-serif text-xl border-b border-border/10 pb-2 mb-4 text-primary font-bold">2. Detail Pesanan & Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 font-medium">Jumlah Buku *</label>
                    <div className="space-y-2">
                      {['1 Eksemplar', '2 Eksemplar', '3 Eksemplar', 'Lainnya'].map((opt) => (
                        <label key={opt} className="flex items-center gap-3 cursor-pointer text-sm">
                          <input 
                            type="radio" 
                            name="jumlahBuku" 
                            value={opt}
                            checked={jumlahBuku === opt}
                            onChange={() => setJumlahBuku(opt)}
                            className="text-accent focus:ring-accent"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                    {jumlahBuku === 'Lainnya' && (
                      <input 
                        type="number" 
                        min="4"
                        required
                        value={customJumlah} 
                        onChange={e => setCustomJumlah(e.target.value)} 
                        className="mt-3 w-full border border-border/30 bg-bg/20 rounded-xl p-3 text-sm focus:border-accent focus:bg-white outline-none transition" 
                        placeholder="Masukkan jumlah eksemplar..." 
                      />
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 font-medium">Apakah Anda salah satu dari 60 kontributor buku? *</label>
                    <div className="space-y-2 mt-1">
                      {['Ya', 'Tidak'].map((opt) => (
                        <label key={opt} className="flex items-center gap-3 cursor-pointer text-sm">
                          <input 
                            type="radio" 
                            name="isContributor" 
                            value={opt}
                            checked={isContributor === opt}
                            onChange={() => setIsContributor(opt)}
                            className="text-accent focus:ring-accent"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                    <div className="mt-4 p-3 bg-highlight/30 border border-highlight rounded-xl flex items-start gap-2 text-xs text-text/80">
                      <Info size={16} className="text-accent shrink-0 mt-0.5" />
                      <p>Khusus kontributor yang karyanya termuat di buku ini berhak mendapatkan potongan harga khusus penulis.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: ALAMAT PENGIRIMAN */}
              <div>
                <h3 className="font-serif text-xl border-b border-border/10 pb-2 mb-4 text-primary font-bold">3. Alamat Pengiriman</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1 font-medium">Nama Penerima *</label>
                    <input 
                      type="text" 
                      required
                      value={namaPenerima} 
                      onChange={e => setNamaPenerima(e.target.value)} 
                      className="w-full border border-border/30 bg-bg/20 rounded-xl p-3 text-sm focus:border-accent focus:bg-white outline-none transition" 
                      placeholder="Nama lengkap penerima" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1 font-medium">Nomor HP Penerima *</label>
                    <input 
                      type="tel" 
                      required
                      value={hpPenerima} 
                      onChange={e => setHpPenerima(e.target.value)} 
                      className="w-full border border-border/30 bg-bg/20 rounded-xl p-3 text-sm focus:border-accent focus:bg-white outline-none transition" 
                      placeholder="Nomor telepon aktif penerima" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1 font-medium">Kelurahan *</label>
                    <input 
                      type="text" 
                      required
                      value={kelurahan} 
                      onChange={e => setKelurahan(e.target.value)} 
                      className="w-full border border-border/30 bg-bg/20 rounded-xl p-3 text-sm focus:border-accent focus:bg-white outline-none transition" 
                      placeholder="Kelurahan" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1 font-medium">Kecamatan *</label>
                    <input 
                      type="text" 
                      required
                      value={kecamatan} 
                      onChange={e => setKecamatan(e.target.value)} 
                      className="w-full border border-border/30 bg-bg/20 rounded-xl p-3 text-sm focus:border-accent focus:bg-white outline-none transition" 
                      placeholder="Kecamatan" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1 font-medium">Kota / Kabupaten *</label>
                    <input 
                      type="text" 
                      required
                      value={kotaKabupaten} 
                      onChange={e => setKotaKabupaten(e.target.value)} 
                      className="w-full border border-border/30 bg-bg/20 rounded-xl p-3 text-sm focus:border-accent focus:bg-white outline-none transition" 
                      placeholder="Kota atau Kabupaten" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1 font-medium">Provinsi *</label>
                    <input 
                      type="text" 
                      required
                      value={provinsi} 
                      onChange={e => setProvinsi(e.target.value)} 
                      className="w-full border border-border/30 bg-bg/20 rounded-xl p-3 text-sm focus:border-accent focus:bg-white outline-none transition" 
                      placeholder="Provinsi" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1 font-medium">Kode Pos *</label>
                    <input 
                      type="text" 
                      required
                      value={kodePos} 
                      onChange={e => setKodePos(e.target.value)} 
                      className="w-full border border-border/30 bg-bg/20 rounded-xl p-3 text-sm focus:border-accent focus:bg-white outline-none transition" 
                      placeholder="Kode Pos" 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1 font-medium">Alamat Lengkap (Jalan, No. Rumah, RT/RW) *</label>
                    <textarea 
                      required
                      rows={3}
                      value={alamatDetail} 
                      onChange={e => setAlamatDetail(e.target.value)} 
                      className="w-full border border-border/30 bg-bg/20 rounded-xl p-3 text-sm focus:border-accent focus:bg-white outline-none transition" 
                      placeholder="Contoh: Jl. Mawar Indah No. 12, RT 02/RW 05" 
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: PERSETUJUAN */}
              <div className="pt-6 border-t border-border/10 space-y-4">
                <label className="flex items-start gap-3 cursor-pointer text-sm">
                  <input 
                    type="checkbox" 
                    required
                    checked={isAgreed}
                    onChange={e => setIsAgreed(e.target.checked)}
                    className="mt-1 text-accent focus:ring-accent rounded"
                  />
                  <span className="text-gray-700 leading-relaxed font-light">
                    Saya menyatakan data yang diisi sudah benar dan setuju untuk melakukan konfirmasi pemesanan via WhatsApp. *
                  </span>
                </label>

                {errorMsg && (
                  <p className="text-red-500 text-xs font-semibold">{errorMsg}</p>
                )}

                <button 
                  type="submit" 
                  disabled={isSaving}
                  className={`w-full mt-4 text-white font-semibold py-4 px-6 rounded-xl transition-all flex justify-center items-center gap-3 transform ${isSaving ? 'bg-primary/70 cursor-not-allowed' : 'bg-primary hover:bg-primary/95 hover:shadow-lg hover:-translate-y-1'}`}
                >
                  {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <Phone size={18} />}
                  {isSaving ? 'Menyimpan Pesanan...' : 'Konfirmasi Pembelian (Lanjut ke WhatsApp)'}
                </button>
              </div>

            </form>
          ) : (
            // SUCCESS SCREEN
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-8 md:p-12 border border-border/20 rounded-2xl shadow-xl text-center space-y-6 max-w-2xl mx-auto"
            >
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={40} />
              </div>
              <h2 className="font-serif text-3xl text-text font-bold">Mengarahkan ke WhatsApp...</h2>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                Terima kasih telah mengisi formulir pemesanan buku antologi puisi <strong>Lentera Puisi 2026</strong>. 
                Sistem sedang mencoba membuka chat WhatsApp Anda secara otomatis.
              </p>
              
              <div className="p-4 bg-highlight/30 border border-highlight/40 rounded-2xl text-left text-xs md:text-sm space-y-2">
                <p className="font-bold flex items-center gap-2 text-primary">
                  <Info size={16} /> Langkah Terakhir: Konfirmasi via WhatsApp
                </p>
                <p className="font-light text-gray-700">
                  Jika chat WhatsApp tidak terbuka otomatis, silakan klik tombol di bawah untuk mengirim data pesanan Anda dan mendapatkan info nomor rekening serta instruksi pembayaran dari admin.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <a 
                  href={`https://wa.me/6287845112110?text=${getWhatsAppMessage()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-accent hover:bg-accent/90 text-white font-medium py-3 px-6 rounded-xl transition-all flex justify-center items-center gap-2 shadow hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <Phone size={18} />
                  Hubungi Admin via WhatsApp
                </a>
                <Link 
                  href="/"
                  className="border border-border/40 hover:bg-gray-50 text-text font-medium py-3 px-6 rounded-xl transition-all flex justify-center items-center gap-2"
                >
                  Kembali ke Beranda
                </Link>
              </div>
            </motion.div>
          )}

        </main>
      </div>
    </>
  );
}
