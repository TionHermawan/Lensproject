'use client';

import { useState, useEffect } from 'react';
import { supabaseFetch, supabaseInsert, supabaseDelete, supabaseUpload, supabaseUpdate } from '@/lib/supabase';
import { Trash2, Plus, RefreshCw, LogIn, LayoutDashboard, FileText, Users, Hash, LogOut, Heart, Image as ImageIcon, Upload, ShoppingCart, Printer, Filter } from 'lucide-react';

export default function AdminDashboard() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  // Navigation State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'puisi' | 'penulis' | 'sponsor' | 'pesanan'>('dashboard');

  // Data State
  const [poems, setPoems] = useState<any[]>([]);
  const [authors, setAuthors] = useState<any[]>([]);
  const [themes, setThemes] = useState<any[]>([]);
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters for Orders
  const [filterName, setFilterName] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');

  // Form States
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [authorId, setAuthorId] = useState('');
  const [themeId, setThemeId] = useState('');
  const [isWinner, setIsWinner] = useState(false);
  const [rank, setRank] = useState('');
  
  const [authorName, setAuthorName] = useState('');
  const [authorBio, setAuthorBio] = useState('');

  const [sponsorName, setSponsorName] = useState('');
  const [sponsorLink, setSponsorLink] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check login on mount
  useEffect(() => {
    const session = sessionStorage.getItem('lens_admin_auth');
    if (session === 'true') setIsAuthenticated(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Gunakan password sederhana: lensadmin2026
    if (passwordInput === 'lensadmin2026') {
      setIsAuthenticated(true);
      sessionStorage.setItem('lens_admin_auth', 'true');
      loadData();
    } else {
      alert('Password salah!');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('lens_admin_auth');
  };

  const loadData = async () => {
    setLoading(true);
    const [pData, aData, tData, sData, oData] = await Promise.all([
      supabaseFetch('poems', 'select=*,author:authors(name)&order=created_at.desc'),
      supabaseFetch('authors', 'select=*&order=created_at.desc'),
      supabaseFetch('themes', 'select=*&order=created_at.desc'),
      supabaseFetch('sponsors', 'select=*&order=created_at.desc'),
      supabaseFetch('orders', 'select=*&order=created_at.desc')
    ]);
    setPoems(pData || []);
    setAuthors(aData || []);
    setThemes(tData || []);
    setSponsors(sData || []);
    setOrders(oData || []);
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) loadData();
  }, [isAuthenticated]);

  // DELETE HANDLERS
  const handleDelete = async (table: string, id: number) => {
    if (!confirm('Yakin ingin menghapus data ini?')) return;
    try {
      await supabaseDelete(table, id);
      alert('Berhasil dihapus!');
      loadData();
    } catch (err: any) {
      alert(`Gagal menghapus: ${err.message} (mungkin data ini masih terhubung dengan data lain atau karena RLS)`);
    }
  };

  // ADD HANDLERS
  const handleAddPoem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !authorId || !themeId) return alert('Data wajib diisi!');
    setIsSubmitting(true);
    try {
      await supabaseInsert('poems', {
        title, slug: `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`, content,
        author_id: parseInt(authorId), theme_id: parseInt(themeId),
        is_winner: isWinner, rank: isWinner && rank ? parseInt(rank) : null
      });
      alert('Puisi tersimpan!');
      setTitle(''); setContent(''); setAuthorId(''); setThemeId(''); setIsWinner(false); setRank('');
      loadData();
    } catch (err: any) { alert(`Gagal: ${err.message}`); } finally { setIsSubmitting(false); }
  };

  const handleAddAuthor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName) return alert('Nama wajib diisi!');
    setIsSubmitting(true);
    try {
      await supabaseInsert('authors', { name: authorName, bio: authorBio });
      alert('Penulis tersimpan!');
      setAuthorName(''); setAuthorBio('');
      loadData();
    } catch (err: any) { alert(`Gagal: ${err.message}`); } finally { setIsSubmitting(false); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAddSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponsorName || !selectedFile) return alert('Nama dan File Logo wajib diisi!');
    setIsSubmitting(true);
    try {
      // 1. Upload Logo to Supabase Storage (Bucket: 'sponsor')
      const uploadedUrl = await supabaseUpload('sponsor', selectedFile);

      // 2. Insert into DB
      await supabaseInsert('sponsors', { 
        name: sponsorName, 
        logo_url: uploadedUrl, 
        website_url: sponsorLink 
      });

      alert('Sponsor tersimpan!');
      setSponsorName(''); setSponsorLink(''); setSelectedFile(null); setPreviewUrl(null);
      loadData();
    } catch (err: any) { 
      alert('Gagal: ' + err.message); 
      console.error(err);
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      await supabaseUpdate('orders', id, { status: newStatus });
      loadData();
    } catch (err: any) {
      alert(`Gagal mengubah status: ${err.message}`);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchName = o.buyer_name?.toLowerCase().includes(filterName.toLowerCase());
    const dateObj = new Date(o.created_at);
    
    const d = String(dateObj.getDate()).padStart(2, '0');
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const y = String(dateObj.getFullYear());

    const matchDate = filterDate ? d === filterDate.padStart(2, '0') : true;
    const matchMonth = filterMonth ? m === filterMonth.padStart(2, '0') : true;
    const matchYear = filterYear ? y === filterYear : true;

    return matchName && matchDate && matchMonth && matchYear;
  });


  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center font-sans">
        <form onSubmit={handleLogin} className="bg-white p-8 border border-[#E5E0D8] shadow-lg max-w-sm w-full text-center">
          <h1 className="font-serif text-3xl mb-2 text-[#2D2D2D]">Lens Admin</h1>
          <p className="text-sm text-gray-500 mb-8">Masukkan kata sandi untuk masuk.</p>
          <input 
            type="password" 
            value={passwordInput}
            onChange={e => setPasswordInput(e.target.value)}
            className="w-full border border-gray-300 p-3 mb-4 text-center focus:outline-none focus:border-[#C5A880]"
            placeholder="Kata Sandi"
          />
          <button type="submit" className="w-full bg-[#2D2D2D] text-white py-3 hover:bg-black transition flex items-center justify-center gap-2">
            <LogIn size={18} /> Masuk
          </button>
        </form>
      </div>
    );
  }

  // MAIN ADMIN PANEL
  return (
    <div className="min-h-screen bg-[#F9F8F6] font-sans flex flex-col md:flex-row">
      {/* SIDEBAR */}
      <div className="w-full md:w-64 bg-white border-r border-[#E5E0D8] p-6 flex flex-col print:hidden">
        <div className="font-serif text-3xl italic mb-10 text-[#2D2D2D]">Lens.</div>
        <nav className="flex-grow space-y-2">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 p-3 text-left rounded ${activeTab === 'dashboard' ? 'bg-[#F9F8F6] text-[#C5A880] font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button onClick={() => setActiveTab('puisi')} className={`w-full flex items-center gap-3 p-3 text-left rounded ${activeTab === 'puisi' ? 'bg-[#F9F8F6] text-[#C5A880] font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
            <FileText size={18} /> Kelola Puisi
          </button>
          <button onClick={() => setActiveTab('penulis')} className={`w-full flex items-center gap-3 p-3 text-left rounded ${activeTab === 'penulis' ? 'bg-[#F9F8F6] text-[#C5A880] font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
            <Users size={18} /> Kelola Penulis
          </button>
          <button onClick={() => setActiveTab('sponsor')} className={`w-full flex items-center gap-3 p-3 text-left rounded ${activeTab === 'sponsor' ? 'bg-[#F9F8F6] text-[#C5A880] font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
            <Heart size={18} /> Kelola Sponsor
          </button>
          <button onClick={() => setActiveTab('pesanan')} className={`w-full flex items-center gap-3 p-3 text-left rounded ${activeTab === 'pesanan' ? 'bg-[#F9F8F6] text-[#C5A880] font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
            <ShoppingCart size={18} /> Kelola Pesanan
          </button>
        </nav>
        <button onClick={handleLogout} className="mt-auto flex items-center gap-3 p-3 text-red-500 hover:bg-red-50 rounded transition">
          <LogOut size={18} /> Keluar
        </button>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 p-8 md:p-12 h-screen overflow-y-auto print:p-0 print:overflow-visible print:h-auto">
        <header className="flex justify-between items-center mb-10 print:hidden">
          <h2 className="font-serif text-3xl capitalize">{activeTab}</h2>
          <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E0D8] rounded hover:bg-gray-50">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Segarkan Data
          </button>
        </header>

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-8 border border-[#E5E0D8] shadow-sm text-center">
              <FileText size={40} className="mx-auto mb-4 text-[#C5A880]" />
              <div className="text-4xl font-serif mb-2">{poems.length}</div>
              <div className="text-gray-500 uppercase tracking-widest text-sm text-xs">Total Puisi</div>
            </div>
            <div className="bg-white p-8 border border-[#E5E0D8] shadow-sm text-center">
              <Users size={40} className="mx-auto mb-4 text-[#C5A880]" />
              <div className="text-4xl font-serif mb-2">{authors.length}</div>
              <div className="text-gray-500 uppercase tracking-widest text-sm text-xs">Total Penulis</div>
            </div>
            <div className="bg-white p-8 border border-[#E5E0D8] shadow-sm text-center">
              <Heart size={40} className="mx-auto mb-4 text-accent" />
              <div className="text-4xl font-serif mb-2">{sponsors.length}</div>
              <div className="text-gray-500 uppercase tracking-widest text-sm text-xs">Total Sponsor</div>
            </div>
          </div>
        )}

        {/* KELOLA PUISI TAB */}
        {activeTab === 'puisi' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white p-6 border border-[#E5E0D8]">
              <h3 className="font-serif text-xl mb-4 border-b pb-2">Tambah Puisi</h3>
              <form onSubmit={handleAddPoem} className="space-y-4">
                <input type="text" value={title} onChange={e=>setTitle(e.target.value)} className="w-full border p-2" placeholder="Judul Puisi" />
                <select value={authorId} onChange={e=>setAuthorId(e.target.value)} className="w-full border p-2">
                  <option value="">-- Penulis --</option>
                  {authors.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
                <select value={themeId} onChange={e=>setThemeId(e.target.value)} className="w-full border p-2">
                  <option value="">-- Tema --</option>
                  {themes.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <textarea value={content} onChange={e=>setContent(e.target.value)} rows={5} className="w-full border p-2" placeholder="Isi Puisi"></textarea>
                <div className="flex gap-2">
                  <input type="checkbox" checked={isWinner} onChange={e=>setIsWinner(e.target.checked)} id="w" />
                  <label htmlFor="w">Juara (Hall of Fame)</label>
                </div>
                {isWinner && <input type="number" value={rank} onChange={e=>setRank(e.target.value)} className="w-full border p-2" placeholder="Peringkat (1, 2...)" />}
                <button type="submit" disabled={isSubmitting} className="w-full bg-[#2D2D2D] text-white p-2">Simpan</button>
              </form>
            </div>
            <div className="lg:col-span-2 bg-white border border-[#E5E0D8] overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr><th className="p-4">Judul</th><th className="p-4">Penulis</th><th className="p-4 text-right">Aksi</th></tr>
                </thead>
                <tbody>
                  {poems.map(p => (
                    <tr key={p.id} className="border-b last:border-0"><td className="p-4">{p.title}</td><td className="p-4">{p.author?.name}</td>
                    <td className="p-4 text-right"><button onClick={()=>handleDelete('poems', p.id)} className="text-red-500"><Trash2 size={18}/></button></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* KELOLA PENULIS TAB */}
        {activeTab === 'penulis' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white p-6 border border-[#E5E0D8]">
              <h3 className="font-serif text-xl mb-4 border-b pb-2">Tambah Penulis</h3>
              <form onSubmit={handleAddAuthor} className="space-y-4">
                <input type="text" value={authorName} onChange={e=>setAuthorName(e.target.value)} className="w-full border p-2" placeholder="Nama Penulis" />
                <textarea value={authorBio} onChange={e=>setAuthorBio(e.target.value)} rows={4} className="w-full border p-2" placeholder="Biografi singkat"></textarea>
                <button type="submit" disabled={isSubmitting} className="w-full bg-[#2D2D2D] text-white p-2">Simpan</button>
              </form>
            </div>
            <div className="lg:col-span-2 bg-white border border-[#E5E0D8] overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr><th className="p-4">Nama</th><th className="p-4">Biografi</th><th className="p-4 text-right">Aksi</th></tr>
                </thead>
                <tbody>
                  {authors.map(a => (
                    <tr key={a.id} className="border-b last:border-0"><td className="p-4">{a.name}</td><td className="p-4 text-sm text-gray-500">{a.bio}</td>
                    <td className="p-4 text-right"><button onClick={()=>handleDelete('authors', a.id)} className="text-red-500"><Trash2 size={18}/></button></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* KELOLA SPONSOR TAB */}
        {activeTab === 'sponsor' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white p-6 border border-[#E5E0D8]">
              <h3 className="font-serif text-xl mb-4 border-b pb-2 text-text">Tambah Sponsor</h3>
              <form onSubmit={handleAddSponsor} className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Nama Sponsor</label>
                  <input type="text" value={sponsorName} onChange={e=>setSponsorName(e.target.value)} className="w-full border p-3 text-sm focus:border-accent outline-none transition" placeholder="Contoh: Lens Community" />
                </div>
                
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Logo (JPG/PNG)</label>
                  <div className="relative group">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      className="hidden" 
                      id="file-upload" 
                    />
                    <label 
                      htmlFor="file-upload" 
                      className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-accent hover:bg-gray-50 transition-all overflow-hidden"
                    >
                      {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-contain p-2" />
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 text-gray-400 mb-2 group-hover:text-accent" />
                          <p className="text-xs text-gray-500">Pilih file logo</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Link Website/Sosmed</label>
                  <input type="text" value={sponsorLink} onChange={e=>setSponsorLink(e.target.value)} className="w-full border p-3 text-sm focus:border-accent outline-none transition" placeholder="https://..." />
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className={`w-full py-3 text-white transition flex items-center justify-center gap-2 ${isSubmitting ? 'bg-gray-400' : 'bg-text hover:bg-black'}`}
                >
                  {isSubmitting ? <RefreshCw className="animate-spin" size={18} /> : <Plus size={18} />}
                  {isSubmitting ? 'Mengunggah...' : 'Simpan Sponsor'}
                </button>
              </form>
            </div>
            <div className="lg:col-span-2 bg-white border border-[#E5E0D8] overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr><th className="p-4 text-xs uppercase tracking-widest text-gray-500">Logo</th><th className="p-4 text-xs uppercase tracking-widest text-gray-500">Sponsor</th><th className="p-4 text-xs uppercase tracking-widest text-gray-500">Link</th><th className="p-4 text-right">Aksi</th></tr>
                </thead>
                <tbody>
                  {sponsors.map(s => (
                    <tr key={s.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                      <td className="p-4">
                        <div className="w-16 h-10 bg-gray-50 rounded flex items-center justify-center border border-gray-100 p-1">
                          <img src={s.logo_url} alt={s.name} className="max-h-full max-w-full object-contain" />
                        </div>
                      </td>
                      <td className="p-4 font-medium text-text">{s.name}</td>
                      <td className="p-4 text-sm text-gray-500 truncate max-w-[150px]">
                        <a href={s.website_url} target="_blank" className="hover:text-accent underline underline-offset-4">{s.website_url}</a>
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={()=>handleDelete('sponsors', s.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition">
                          <Trash2 size={18}/>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {sponsors.length === 0 && (
                    <tr><td colSpan={4} className="p-20 text-center text-gray-400 italic">Belum ada data sponsor.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* KELOLA PESANAN TAB */}
        {activeTab === 'pesanan' && (
          <div className="bg-white border border-[#E5E0D8] p-6 print:border-none print:p-0 print:m-0 w-full">
            
            {/* Print Header (Only visible on print) */}
            <div className="hidden print:block text-center mb-8 border-b-2 border-black pb-6">
              <h1 className="font-serif text-3xl font-bold mb-2 uppercase tracking-wider">Laporan Pemesanan Buku</h1>
              <h2 className="text-xl text-gray-800 font-serif italic">Antologi Puisi: Lentera Puisi 2026</h2>
              <div className="mt-4 flex justify-between text-sm text-gray-600 border-t border-gray-300 pt-2">
                <span>Dicetak pada: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' })}</span>
                <span>Total Filtered: {filteredOrders.length} Pesanan</span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6 print:hidden">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center border border-gray-200 rounded px-3 py-2 bg-gray-50">
                  <Filter size={16} className="text-gray-400 mr-2" />
                  <input type="text" placeholder="Cari Nama..." value={filterName} onChange={e => setFilterName(e.target.value)} className="bg-transparent border-none outline-none text-sm w-32" />
                </div>
                <input type="text" placeholder="Tgl (DD)" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="border border-gray-200 rounded px-3 py-2 text-sm w-20 bg-gray-50" />
                <input type="text" placeholder="Bln (MM)" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="border border-gray-200 rounded px-3 py-2 text-sm w-20 bg-gray-50" />
                <input type="text" placeholder="Thn (YYYY)" value={filterYear} onChange={e => setFilterYear(e.target.value)} className="border border-gray-200 rounded px-3 py-2 text-sm w-24 bg-gray-50" />
              </div>
              <button onClick={() => window.print()} className="flex items-center gap-2 bg-text text-white px-4 py-2 rounded hover:bg-black transition shadow-sm">
                <Printer size={16} /> Cetak Laporan PDF
              </button>
            </div>
            
            <div className="overflow-x-auto print:overflow-visible print:w-full">
              <table className="w-full text-left text-sm whitespace-nowrap print:whitespace-normal print:text-[11px] print:border-collapse">
                <thead className="bg-gray-50 border-b print:bg-gray-100 print:text-black">
                  <tr>
                    <th className="p-4 print:p-2 print:border print:border-gray-400">Tanggal</th>
                    <th className="p-4 print:p-2 print:border print:border-gray-400">Pemesan</th>
                    <th className="p-4 print:p-2 print:border print:border-gray-400">Kontak</th>
                    <th className="p-4 print:p-2 print:border print:border-gray-400">Detail Pengiriman</th>
                    <th className="p-4 print:p-2 print:border print:border-gray-400">Jml</th>
                    <th className="p-4 text-center print:p-2 print:border print:border-gray-400 print:text-left">Status</th>
                    <th className="p-4 text-right print:hidden">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(o => (
                    <tr key={o.id} className="border-b last:border-0 hover:bg-gray-50 transition print:border print:border-gray-300 print:break-inside-avoid">
                      <td className="p-4 print:p-2 align-top">{new Date(o.created_at).toLocaleDateString('id-ID')}</td>
                      <td className="p-4 print:p-2 align-top">
                        <p className="font-semibold print:font-bold">{o.buyer_name}</p>
                        <p className="text-xs text-gray-500 print:text-black">{o.is_contributor}</p>
                      </td>
                      <td className="p-4 print:p-2 align-top">
                        <p>{o.buyer_whatsapp}</p>
                        <p className="text-xs text-gray-500 print:text-black">{o.buyer_email}</p>
                      </td>
                      <td className="p-4 print:p-2 whitespace-normal min-w-[250px] align-top">
                        <p className="font-medium print:font-bold">{o.recipient_name} ({o.recipient_phone})</p>
                        <p className="text-xs text-gray-600 print:text-black mt-1 leading-relaxed">
                          {o.address_detail}, Kel. {o.subdistrict}, Kec. {o.district}, {o.city}, {o.province} {o.postal_code}
                        </p>
                      </td>
                      <td className="p-4 print:p-2 align-top text-center">{o.quantity.replace(' Eksemplar', '')}</td>
                      <td className="p-4 print:p-2 text-center align-top print:text-left">
                        <select 
                          value={o.status} 
                          onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                          className={`text-xs font-semibold rounded-full px-3 py-1 border outline-none print:appearance-none print:border-none print:bg-transparent print:p-0 print:text-black print:font-normal ${o.status === 'Selesai' ? 'bg-green-100 text-green-700 border-green-200' : o.status === 'Batal' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Selesai">Selesai</option>
                          <option value="Batal">Batal</option>
                        </select>
                      </td>
                      <td className="p-4 text-right print:hidden align-top">
                        <button onClick={() => handleDelete('orders', o.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition">
                          <Trash2 size={16}/>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr><td colSpan={7} className="p-10 text-center text-gray-400 italic print:border print:border-gray-400">Tidak ada pesanan.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
