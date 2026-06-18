const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../kumpulan_puisi_lentera_2026.md');
let text = fs.readFileSync(filePath, 'utf-8');

// Menghapus semua kemunculan [cite: 1], [cite: 2], dst.
const cleanedText = text.replace(/\s*\[cite:\s*\d+\]/g, '');

fs.writeFileSync(filePath, cleanedText, 'utf-8');
console.log('File markdown berhasil dibersihkan dari tag [cite: X].');
