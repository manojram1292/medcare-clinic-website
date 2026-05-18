'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import slugify from 'slugify';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { uploadImage } from '@/lib/upload';

const LinkSchema = z.object({
  label: z.string().min(1).max(120),
  url: z.string().url().max(500),
});

const Schema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().max(200).optional(),
  category: z.string().min(1).max(80).default('General'),
  excerpt: z.string().max(500).default(''),
  body: z.string().max(50000).default(''),
  cover_gradient: z.string().max(20).default('bcim-1'),
  tags: z.string().max(500).default(''),
  read_minutes: z.coerce.number().int().min(1).max(120).default(4),
  related_links_raw: z.string().max(10000).default(''),
});

function makeSlug(s: string): string {
  return slugify(s, { lower: true, strict: true, locale: 'en' }).slice(0, 100) || 'article';
}

function parseLinks(raw: string): Array<{ label: string; url: string }> {
  if (!raw.trim()) return [];
  // Accept two formats:
  // 1. JSON array: [{"label":"...","url":"..."},...]
  // 2. Plain text lines: "Label | https://url"
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed
        .map((x) => LinkSchema.safeParse(x))
        .filter((r) => r.success)
        .map((r) => (r as { success: true; data: { label: string; url: string } }).data);
    }
  } catch {
    // Fall through to plain text parse
  }
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, url] = line.split('|').map((s) => s.trim());
      return { label, url };
    })
    .filter((x) => x.label && x.url)
    .map((x) => LinkSchema.safeParse(x))
    .filter((r) => r.success)
    .map((r) => (r as { success: true; data: { label: string; url: string } }).data);
}

export async function upsertPatientHubArticle(formData: FormData) {
  await requireAdmin('patient_hub');
  const id = String(formData.get('id') || '').trim();

  const obj = {
    title: String(formData.get('title') || ''),
    slug: String(formData.get('slug') || ''),
    category: String(formData.get('category') || 'General'),
    excerpt: String(formData.get('excerpt') || ''),
    body: String(formData.get('body') || ''),
    cover_gradient: String(formData.get('cover_gradient') || 'bcim-1'),
    tags: String(formData.get('tags') || ''),
    read_minutes: String(formData.get('read_minutes') || '4'),
    related_links_raw: String(formData.get('related_links_raw') || ''),
  };
  const parsed = Schema.safeParse(obj);
  if (!parsed.success) {
    redirect(`/admin/patient-hub?err=${encodeURIComponent(parsed.error.message.slice(0, 200))}`);
  }
  const v = parsed.data;

  const slug = v.slug?.trim() ? makeSlug(v.slug) : makeSlug(v.title);
  const tags = v.tags.split(',').map((s) => s.trim()).filter(Boolean);
  const related_links = parseLinks(v.related_links_raw);

  const supabase = createClient();

  let cover_url: string | null | undefined = undefined;
  const file = formData.get('cover') as File | null;
  if (file && file instanceof File && file.size > 0) {
    try { cover_url = await uploadImage(file, 'patient-hub'); }
    catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Upload error';
      redirect(`/admin/patient-hub?err=${encodeURIComponent(msg)}`);
    }
  }
  if (formData.get('clear_cover') === 'on') cover_url = null;

  const payload: Record<string, unknown> = {
    title: v.title,
    slug,
    category: v.category,
    excerpt: v.excerpt,
    body: v.body,
    cover_gradient: v.cover_gradient,
    tags,
    read_minutes: v.read_minutes,
    related_links,
    published: formData.get('published') === 'on',
    featured: formData.get('featured') === 'on',
    sort: Number(formData.get('sort') || '0'),
  };
  if (cover_url !== undefined) payload.cover_url = cover_url;

  if (id) {
    const { error } = await supabase.from('patient_hub').update(payload).eq('id', id);
    if (error) redirect(`/admin/patient-hub?err=${encodeURIComponent(error.message)}`);
  } else {
    const { error } = await supabase.from('patient_hub').insert(payload);
    if (error) redirect(`/admin/patient-hub?err=${encodeURIComponent(error.message)}`);
  }
  revalidatePath('/', 'layout');
  redirect('/admin/patient-hub?ok=1');
}

export async function deletePatientHubArticle(formData: FormData) {
  await requireAdmin('patient_hub');
  const id = String(formData.get('id') || '').trim();
  if (!id) redirect('/admin/patient-hub?err=missing+id');
  const supabase = createClient();
  const { error } = await supabase.from('patient_hub').delete().eq('id', id);
  if (error) redirect(`/admin/patient-hub?err=${encodeURIComponent(error.message)}`);
  revalidatePath('/', 'layout');
  redirect('/admin/patient-hub?ok=1');
}
