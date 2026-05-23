// src/lib/supabase.ts
const supabaseUrl = 'https://nawifzvvvzlscgssuabm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hd2lmenZ2dnpsc2Nnc3N1YWJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3NTU3OTYsImV4cCI6MjA5MzMzMTc5Nn0.40WwSTpidTWXOrngMqzR36HrKszv1tj53EYHqX5PLuI';

const getHeaders = () => ({
  'apikey': supabaseAnonKey,
  'Authorization': `Bearer ${supabaseAnonKey}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
});

export async function supabaseFetch(table: string, query: string = 'select=*') {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${query}`, {
      headers: getHeaders()
    });
    if (!response.ok) return [];
    return response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    return [];
  }
}

export async function supabaseInsert(table: string, body: any) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Gagal menambah data');
  }
  return response.json();
}

export async function supabaseUpdate(table: string, id: number, body: any) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?id=eq.${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Gagal mengubah data');
  }
  return response.json();
}

export async function supabaseDelete(table: string, id: number) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?id=eq.${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Gagal menghapus data');
  }
  return true;
}

export async function supabaseUpload(bucket: string, file: File) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${fileName}`;

  const response = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${filePath}`, {
    method: 'POST',
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': file.type
    },
    body: file
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Gagal upload file');
  }

  // Return the public URL
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${filePath}`;
}
