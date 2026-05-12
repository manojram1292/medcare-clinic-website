'use server';
import { createAdminClient } from '@/lib/supabase/admin';

const BUCKET = 'media';

export async function uploadImage(file: File, folder: string): Promise<string> {
  if (!(file instanceof File) || file.size === 0) throw new Error('No file');
  if (file.size > 5 * 1024 * 1024) throw new Error('File too large (max 5 MB)');
  if (!file.type.startsWith('image/')) throw new Error('File must be an image');

  const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'png';
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();

  const admin = createAdminClient();
  const { error } = await admin.storage.from(BUCKET).upload(path, new Uint8Array(arrayBuffer), {
    contentType: file.type, upsert: false,
  });
  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = admin.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
