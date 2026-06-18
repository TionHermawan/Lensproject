
const fs = require('fs');
const path = require('path');

// Mengambil URL dan Key dari environment variable atau bisa di-hardcode jika .env.local belum ada.
// Pastikan NEXT_PUBLIC_SUPABASE_URL Anda valid.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nawifzvvvzlscgssuabm.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hd2lmenZ2dnpsc2Nnc3N1YWJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3NTU3OTYsImV4cCI6MjA5MzMzMTc5Nn0.40WwSTpidTWXOrngMqzR36HrKszv1tj53EYHqX5PLuI';

const headers = {
  'apikey': supabaseAnonKey,
  'Authorization': `Bearer ${supabaseAnonKey}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

async function insertData(table, body) {
  const cleanUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
  const res = await fetch(`${cleanUrl}/rest/v1/${table}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gagal insert ke ${table}: ${res.status} ${errorText}`);
  }
  
  return await res.json();
}

async function main() {
  console.log("Memulai proses seeding data ke Supabase...");
  console.log(`Target URL: ${supabaseUrl}`);

  const filePath = path.join(__dirname, '../kumpulan_puisi_lentera_2026.md');
  if (!fs.existsSync(filePath)) {
    console.error(`File tidak ditemukan: ${filePath}`);
    return;
  }
  
  const text = fs.readFileSync(filePath, 'utf-8');
  
  // Regex untuk mengekstrak data
  const regex = /## Juara (\d+):\s*(.+?)(?:\s*\[cite[^\]]*\])?\r?\n\*\*Karya\/Author:\*\*\s*(.+?)(?:\s*\[cite[^\]]*\])?\r?\n\r?\n([\s\S]+?)(?=\r?\n\r?\n---|(?:\r?\n##)|$)/g;
  
  let match;
  const poemsToInsert = [];
  
  while ((match = regex.exec(text)) !== null) {
    poemsToInsert.push({
      rank: parseInt(match[1]),
      title: match[2].trim(),
      authorName: match[3].trim(),
      content: match[4].trim(),
      is_winner: parseInt(match[1]) <= 3 // Juara 1, 2, 3 dianggap winner utama jika diperlukan
    });
  }

  console.log(`Ditemukan ${poemsToInsert.length} puisi dari file Markdown.`);

  for (let i = 0; i < poemsToInsert.length; i++) {
    const p = poemsToInsert[i];
    console.log(`Memproses (${i + 1}/${poemsToInsert.length}): ${p.title} oleh ${p.authorName}`);
    
    try {
      // 1. Insert Author
      // Kita insert author dan ambil ID-nya. 
      // Jika author sudah ada di database, ini mungkin butuh disesuaikan (misal: cek dulu lalu insert),
      // tapi untuk skenario awal kita asumsikan tabel author kosong.
      const authorRes = await insertData('authors', { name: p.authorName });
      const authorId = authorRes[0]?.id;

      if (!authorId) {
        throw new Error("Gagal mendapatkan ID author");
      }

      // 2. Insert Poem
      const slug = p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      await insertData('poems', {
        title: p.title,
        slug: slug,
        content: p.content,
        author_id: authorId,
        rank: p.rank,
        is_winner: p.is_winner,
        // theme_id: null // Bisa diatur jika Anda sudah punya tabel themes
      });
      
      console.log(`  -> Sukses: ${p.title}`);
    } catch (err) {
      console.error(`  -> Gagal saat memproses "${p.title}":`, err.message);
      console.log("  -> (Pastikan URL Supabase valid dan koneksi internet Anda lancar)");
      break; // Berhenti jika gagal koneksi agar tidak terus looping error
    }
  }

  console.log("Proses seeding selesai.");
}

main();
