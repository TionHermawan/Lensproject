import { NextResponse } from 'next/server';
import { supabaseFetch } from '@/lib/supabase';

export async function GET() {
  try {
    const data = await supabaseFetch('poems', 'select=*&order=created_at.desc');
    
    if (!data || data.length === 0) {
      // Jika data kosong, kita kembalikan array kosong (bukan error)
      return NextResponse.json([]);
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
