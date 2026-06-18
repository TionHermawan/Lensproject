const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../kumpulan_puisi_lentera_2026.md');
const text = fs.readFileSync(filePath, 'utf-8');

const regex = /## Juara (\d+):\s*(.+?)(?:\s*\[cite[^\]]*\])?\r?\n\*\*Karya\/Author:\*\*\s*(.+?)(?:\s*\[cite[^\]]*\])?\r?\n\r?\n([\s\S]+?)(?=\r?\n\r?\n---|(?:\r?\n##)|$)/g;

let match;
let count = 0;
while ((match = regex.exec(text)) !== null) {
  count++;
  console.log(`Rank: ${match[1]}, Title: ${match[2]}, Author: ${match[3]}, Content length: ${match[4].length}`);
}

console.log(`Total matched: ${count}`);
