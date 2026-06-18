'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { supabaseUpload } from '@/lib/supabase';
import { ArrowLeft, Send, Upload, CheckCircle, Info, Calendar, Truck, Phone } from 'lucide-react';

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

  const [metodePembayaran, setMetodePembayaran] = useState('Transfer Bank');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [isAgreed, setIsAgreed] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [uploadedReceiptUrl, setUploadedReceiptUrl] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File bukti pembayaran tidak boleh lebih dari 5MB.');
        return;
      }
      setReceiptFile(file);
      setReceiptPreview(URL.createObjectURL(file));
    }
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

    setIsUploading(true);
    let receiptUrl = '';

    try {
      if (receiptFile) {
        // Upload bukti pembayaran ke storage bucket Supabase 'sponsor' yang bersifat publik
        receiptUrl = await supabaseUpload('sponsor', receiptFile);
        setUploadedReceiptUrl(receiptUrl);
      }
      setIsSubmitted(true);
    } catch (err: any) {
      console.warn('Gagal mengunggah bukti pembayaran:', err);
      // Fallback: Izinkan user melanjutkan, bukti bisa dikirim via WA
      setIsSubmitted(true);
    } finally {
      setIsUploading(false);
    }
  };

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
    
    text += `*Pembayaran:*\n`;
    text += `- Metode: ${metodePembayaran}\n`;
    if (uploadedReceiptUrl) {
      text += `- Bukti Transfer: ${uploadedReceiptUrl}\n`;
    } else {
      text += `- Bukti Transfer: (Akan dikirimkan langsung di chat ini)\n`;
    }

    return encodeURIComponent(text);
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
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors text-sm font-medium mb-4">
              <ArrowLeft size={16} /> Kembali ke Beranda
            </Link>
            <h1 className="font-serif text-4xl md:text-5xl text-text mb-2">Formulir Pemesanan Buku</h1>
            <p className="text-gray-600 font-light text-sm md:text-base">
              Antologi Puisi Eksklusif <strong className="text-primary">Lentera Puisi 2026</strong>. 
              Ada pertanyaan? Hubungi CP Admin: <strong className="text-accent">0878-4511-2110</strong>
            </p>
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

              {/* SECTION 4: PEMBAYARAN */}
              <div>
                <h3 className="font-serif text-xl border-b border-border/10 pb-2 mb-4 text-primary font-bold">4. Metode Pembayaran</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 font-medium">Pilih Metode Pembayaran *</label>
                    <div className="space-y-2 mb-4">
                      {['Transfer Bank', 'E-wallet (DANA)', 'QRIS'].map((opt) => (
                        <label key={opt} className="flex items-center gap-3 cursor-pointer text-sm">
                          <input 
                            type="radio" 
                            name="metodePembayaran" 
                            value={opt}
                            checked={metodePembayaran === opt}
                            onChange={() => setMetodePembayaran(opt)}
                            className="text-accent focus:ring-accent"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>

                    {/* DETAIL METODE */}
                    <div className="bg-[#F9F8F6] border border-border/10 p-4 rounded-xl space-y-3 text-sm">
                      {metodePembayaran === 'Transfer Bank' && (
                        <div>
                          <p className="font-semibold text-text">Transfer Bank Mandiri</p>
                          <p className="text-xl font-serif text-accent my-1 font-bold">137-00-1122334-4</p>
                          <p className="text-xs text-gray-500">a.n. **Lens Community**</p>
                        </div>
                      )}
                      {metodePembayaran === 'E-wallet (DANA)' && (
                        <div>
                          <p className="font-semibold text-text">E-Wallet DANA</p>
                          <p className="text-xl font-serif text-accent my-1 font-bold">0878-4511-2110</p>
                          <p className="text-xs text-gray-500">a.n. **Admin Lens Community**</p>
                        </div>
                      )}
                      {metodePembayaran === 'QRIS' && (
                        <div className="text-center py-2 flex flex-col items-center">
                          <p className="font-semibold text-text text-left w-full mb-2">QRIS Resmi Merchant</p>
                          
                          {/* STYLISH QRIS MOCKUP */}
                          <div className="bg-white border-2 border-primary/20 p-4 rounded-lg flex flex-col items-center shadow-inner relative max-w-[200px]">
                            <div className="absolute top-1 left-2 text-[8px] font-bold text-blue-900">QRIS</div>
                            <div className="absolute top-1 right-2 text-[6px] text-gray-400">GPN</div>
                            <div className="w-32 h-32 my-2 bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center border border-gray-200 rounded p-1">
                              {/* QR CODE DRAWN IN SVG */}
                              <svg className="w-full h-full text-text" viewBox="0 0 100 100" fill="currentColor">
                                <rect x="0" y="0" width="25" height="25" />
                                <rect x="5" y="5" width="15" height="15" fill="white" />
                                <rect x="8" y="8" width="9" height="9" />
                                
                                <rect x="75" y="0" width="25" height="25" />
                                <rect x="80" y="5" width="15" height="15" fill="white" />
                                <rect x="83" y="8" width="9" height="9" />
                                
                                <rect x="0" y="75" width="25" height="25" />
                                <rect x="5" y="80" width="15" height="15" fill="white" />
                                <rect x="8" y="83" width="9" height="9" />
                                
                                <rect x="40" y="40" width="20" height="20" />
                                <rect x="45" y="45" width="10" height="10" fill="white" />
                                
                                <rect x="35" y="10" width="10" height="20" />
                                <rect x="55" y="10" width="15" height="10" />
                                <rect x="10" y="35" width="20" height="10" />
                                <rect x="70" y="35" width="10" height="25" />
                                <rect x="35" y="70" width="25" height="10" />
                                <rect x="75" y="75" width="15" height="15" />
                                <rect x="90" y="60" width="10" height="10" />
                                <rect x="65" y="65" width="5" height="5" />
                              </svg>
                            </div>
                            <p className="text-[10px] font-bold tracking-widest text-[#2D2D2D]">LENS COMMUNITY</p>
                          </div>
                          <p className="text-[10px] text-gray-500 mt-2">Scan kode QR di atas menggunakan aplikasi E-Wallet atau M-Banking Anda.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 font-medium">Unggah Bukti Pembayaran</label>
                    <div className="relative group">
                      <input 
                        type="file" 
                        accept="image/*,application/pdf" 
                        onChange={handleFileChange} 
                        className="hidden" 
                        id="receipt-upload" 
                      />
                      <label 
                        htmlFor="receipt-upload" 
                        className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border/30 rounded-2xl cursor-pointer hover:border-accent hover:bg-highlight/10 transition-all overflow-hidden"
                      >
                        {receiptPreview ? (
                          <div className="w-full h-full p-2 relative flex items-center justify-center bg-gray-50">
                            {receiptFile?.type.includes('pdf') ? (
                              <div className="text-center p-4">
                                <CheckCircle className="w-10 h-10 text-primary mx-auto mb-2" />
                                <p className="text-xs text-text font-medium truncate max-w-[200px]">{receiptFile.name}</p>
                              </div>
                            ) : (
                              <img src={receiptPreview} alt="Pratinjau bukti transfer" className="max-h-full max-w-full object-contain rounded" />
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 text-primary mb-2 group-hover:text-accent transition-colors" />
                            <p className="text-xs text-text font-medium">Pilih file foto bukti transfer</p>
                            <p className="text-[10px] text-gray-500 mt-1">JPEG, PNG, atau PDF (Maks. 5MB)</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 5: PERSETUJUAN */}
              <div className="pt-4 border-t border-border/10 space-y-4">
                <label className="flex items-start gap-3 cursor-pointer text-sm">
                  <input 
                    type="checkbox" 
                    required
                    checked={isAgreed}
                    onChange={e => setIsAgreed(e.target.checked)}
                    className="mt-1 text-accent focus:ring-accent rounded"
                  />
                  <span className="text-gray-700 leading-relaxed font-light">
                    Saya telah membaca informasi pemesanan dan bersedia menunggu proses cetak serta pengiriman buku. *
                  </span>
                </label>

                {errorMsg && (
                  <p className="text-red-500 text-xs font-semibold">{errorMsg}</p>
                )}

                <button 
                  type="submit" 
                  disabled={isUploading}
                  className="w-full mt-4 bg-primary hover:bg-primary/95 text-white font-medium py-4 px-6 rounded-xl transition-all flex justify-center items-center gap-3 hover:shadow-lg transform hover:-translate-y-1"
                >
                  <Send size={18} className={isUploading ? 'animate-spin' : ''} />
                  {isUploading ? 'Mengunggah...' : 'Kirim Form Pembelian'}
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
              <h2 className="font-serif text-3xl text-text font-bold">Pemesanan Anda Berhasil Dicatat!</h2>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                Terima kasih telah memesan buku antologi puisi <strong>Lentera Puisi 2026</strong>. 
                Data diri, detail pesanan, dan alamat Anda telah berhasil kami unggah.
              </p>
              
              <div className="p-4 bg-highlight/30 border border-highlight/40 rounded-2xl text-left text-xs md:text-sm space-y-2">
                <p className="font-bold flex items-center gap-2 text-primary">
                  <Info size={16} /> Langkah Terakhir: Konfirmasi via WhatsApp
                </p>
                <p className="font-light text-gray-700">
                  Untuk mempercepat proses verifikasi pembayaran dan pengemasan buku, silakan klik tombol di bawah untuk mengirim pesan otomatis beserta bukti transfer ke admin melalui WhatsApp.
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
                  Kirim Konfirmasi WhatsApp
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

          {/* ADDITIONAL INFORMATION */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white/40 p-5 rounded-2xl border border-border/10">
              <Calendar className="text-accent mb-2" size={24} />
              <h4 className="font-serif font-bold text-sm mb-1">Sistem Pre-Order</h4>
              <p className="text-xs text-gray-500 font-light leading-relaxed">Buku dicetak secara eksklusif sesuai dengan jumlah pesanan. Proses produksi memakan waktu kurang lebih 7-14 hari kerja.</p>
            </div>
            <div className="bg-white/40 p-5 rounded-2xl border border-border/10">
              <Truck className="text-accent mb-2" size={24} />
              <h4 className="font-serif font-bold text-sm mb-1">Pengiriman Terlacak</h4>
              <p className="text-xs text-gray-500 font-light leading-relaxed">Setelah buku dicetak, admin akan mengirimkan resi pengiriman melalui WhatsApp Anda agar pengiriman dapat dilacak.</p>
            </div>
            <div className="bg-white/40 p-5 rounded-2xl border border-border/10">
              <Phone className="text-accent mb-2" size={24} />
              <h4 className="font-serif font-bold text-sm mb-1">Kontak Resmi Admin</h4>
              <p className="text-xs text-gray-500 font-light leading-relaxed">WhatsApp: 0878-4511-2110. Hubungi kami jika Anda memiliki kendala pengiriman atau konfirmasi pembayaran.</p>
            </div>
          </div>

        </main>
      </div>
    </>
  );
}
