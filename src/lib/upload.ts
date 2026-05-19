'use server';
import { createAdminClient } from '@/lib/supabase/admin';

const BUCKET = 'media';

// Folder whitelist — prevents path traversal AND scope creep. New folders
// require a code change.
const ALLOWED_FOLDERS = new Set(['blog', 'doctors', 'patient-hub']);

// MIME allowlist with magic-byte sniffers. We DO NOT trust the
// Content-Type the browser sends — files are validated by their first
// bytes before being written to the public bucket. This blocks SVG (which
// can carry script), HTML/PDF tricks, and MIME spoofing.
type MagicSniffer = (b: Uint8Array) => boolean;
const ALLOWED_IMAGE_TYPES: Record<string, { ext: 'jpg' | 'png' | 'webp'; magic: MagicSniffer }> = {
  'image/jpeg': {
    ext: 'jpg',
    magic: (b) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  'image/png': {
    ext: 'png',
    magic: (b) =>
      b.length > 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
      b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a,
  },
  'image/webp': {
    ext: 'webp',
    magic: (b) =>
      b.length > 12 && b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
  },
};

const MAX_BYTES = 5 * 1024 * 1024;

export async function uploadImage(file: File, folder: string): Promise<string> {
  if (!(file instanceof File) || file.size === 0) throw new Error('No file');
  if (file.size > MAX_BYTES) throw new Error('File too large (max 5 MB)');
  if (!ALLOWED_FOLDERS.has(folder)) throw new Error('Invalid upload folder');

  const type = ALLOWED_IMAGE_TYPES[file.type as keyof typeof ALLOWED_IMAGE_TYPES];
  if (!type) throw new Error('File must be a JPEG, PNG, or WebP image');

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!type.magic(bytes)) {
    throw new Error('File contents do not match the declared image type');
  }

  const path = `${folder}/${crypto.randomUUID()}.${type.ext}`;

  const admin = createAdminClient();
  const { error } = await admin.storage.from(BUCKET).upload(path, bytes, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = admin.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
