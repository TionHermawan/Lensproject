'use client';

import { useState, useEffect } from 'react';
import { supabaseFetch, supabaseInsert, supabaseDelete, supabaseUpload } from '@/lib/supabase';
import { Trash2, Plus, RefreshCw, LogIn, LayoutDashboard, FileText, Users, Hash, LogOut, Heart, Image as ImageIcon, Upload } from 'lucide-react';

export default function AdminDashboard() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  // Navigation State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'puisi' | 'tema' | 'penulis' | 'sponsor'>('dashboard');

  // Data State
  const [poems, setPoems] = useState<any[]>([]);
  const [authors, setAuthors] = useState<any[]>([]);
  const [themes, setThemes] = useState<any[]>([]);
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form States
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [authorId, setAuthorId] = useState('');
  const [themeId, setThemeId] = useState('');
  const [isWinner, setIsWinner] = useState(false);
  const [rank, setRank] = useState('');
  
  const [authorName, setAuthorName] = useState('');
  const [authorBio, setAuthorBio] = useState('');
  
  const [themeName, setThemeName] = useState('');
  const [themeDesc, setThemeDesc] = useState('');

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
    const [pData, aData, tData, sData] = await Promise.all([
      supabaseFetch('poems', 'select=*,author:authors(name)&order=created_at.desc'),
      supabaseFetch('authors', 'select=*&order=created_at.desc'),
      supabaseFetch('themes', 'select=*&order=created_at.desc'),
      supabaseFetch('sponsors', 'select=*&order=created_at.desc')
    ]);
    setPoems(pData || []);
    setAuthors(aData || []);
    setThemes(tData || []);
    setSponsors(sData || []);
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

  const handleAddTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!themeName) return alert('Tema wajib diisi!');
    setIsSubmitting(true);
    try {
      await supabaseInsert('themes', { 
        name: themeName, 
        slug: `${themeName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`, 
        description: themeDesc 
      });
      alert('Tema tersimpan!');
      setThemeName(''); setThemeDesc('');
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
      <div className="w-full md:w-64 bg-white border-r border-[#E5E0D8] p-6 flex flex-col">
        <div className="font-serif text-3xl italic mb-10 text-[#2D2D2D]">Lens.</div>
        <nav className="flex-grow space-y-2">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 p-3 text-left rounded ${activeTab === 'dashboard' ? 'bg-[#F9F8F6] text-[#C5A880] font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button onClick={() => setActiveTab('puisi')} className={`w-full flex items-center gap-3 p-3 text-left rounded ${activeTab === 'puisi' ? 'bg-[#F9F8F6] text-[#C5A880] font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
            <FileText size={18} /> Kelola Puisi
          </button>
          <button onClick={() => setActiveTab('tema')} className={`w-full flex items-center gap-3 p-3 text-left rounded ${activeTab === 'tema' ? 'bg-[#F9F8F6] text-[#C5A880] font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
            <Hash size={18} /> Kelola Tema
          </button>
          <button onClick={() => setActiveTab('penulis')} className={`w-full flex items-center gap-3 p-3 text-left rounded ${activeTab === 'penulis' ? 'bg-[#F9F8F6] text-[#C5A880] font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
            <Users size={18} /> Kelola Penulis
          </button>
          <button onClick={() => setActiveTab('sponsor')} className={`w-full flex items-center gap-3 p-3 text-left rounded ${activeTab === 'sponsor' ? 'bg-[#F9F8F6] text-[#C5A880] font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
            <Heart size={18} /> Kelola Sponsor
          </button>
        </nav>
        <button onClick={handleLogout} className="mt-auto flex items-center gap-3 p-3 text-red-500 hover:bg-red-50 rounded transition">
          <LogOut size={18} /> Keluar
        </button>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 p-8 md:p-12 h-screen overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
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
              <Hash size={40} className="mx-auto mb-4 text-[#C5A880]" />
              <div className="text-4xl font-serif mb-2">{themes.length}</div>
              <div className="text-gray-500 uppercase tracking-widest text-sm text-xs">Total Tema</div>
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

        {/* KELOLA TEMA TAB */}
        {activeTab === 'tema' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white p-6 border border-[#E5E0D8]">
              <h3 className="font-serif text-xl mb-4 border-b pb-2">Tambah Tema</h3>
              <form onSubmit={handleAddTheme} className="space-y-4">
                <input type="text" value={themeName} onChange={e=>setThemeName(e.target.value)} className="w-full border p-2" placeholder="Nama Tema (ex: Alam)" />
                <textarea value={themeDesc} onChange={e=>setThemeDesc(e.target.value)} rows={4} className="w-full border p-2" placeholder="Deskripsi tema"></textarea>
                <button type="submit" disabled={isSubmitting} className="w-full bg-[#2D2D2D] text-white p-2">Simpan</button>
              </form>
            </div>
            <div className="lg:col-span-2 bg-white border border-[#E5E0D8] overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr><th className="p-4">Tema</th><th className="p-4 text-right">Aksi</th></tr>
                </thead>
                <tbody>
                  {themes.map(t => (
                    <tr key={t.id} className="border-b last:border-0"><td className="p-4">{t.name}</td>
                    <td className="p-4 text-right"><button onClick={()=>handleDelete('themes', t.id)} className="text-red-500"><Trash2 size={18}/></button></td></tr>
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

      </div>
    </div>
  );
}
