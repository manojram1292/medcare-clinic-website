'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import slugify from 'slugify';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { uploadImage } from '@/lib/upload';

const Schema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().max(160).optional(),
  category: z.string().min(1).max(80),
  excerpt: z.string().max(500).default(''),
  body: z.string().max(50000).default(''),
  cover_gradient: z.string().max(20).default('bcim-1'),
  author_id: z.string().optional().or(z.literal('')),
  read_minutes: z.coerce.number().int().min(1).max(120).default(5),
  published: z.coerce.boolean().default(false),
  featured: z.coerce.boolean().default(false),
});

export async function upsertPost(formData: FormData) {
  await requireAdmin('blog');
  const id = String(formData.get('id') || '').trim();
  const obj = {
    title: String(formData.get('title') || ''),
    slug: String(formData.get('slug') || '').trim(),
    category: String(formData.get('category') || 'General'),
    excerpt: String(formData.get('excerpt') || ''),
    body: String(formData.get('body') || ''),
    cover_gradient: String(formData.get('cover_gradient') || 'bcim-1'),
    author_id: String(formData.get('author_id') || '').trim(),
    read_minutes: String(formData.get('read_minutes') || '5'),
    published: formData.get('published') === 'on' ? 'true' : 'false',
    featured: formData.get('featured') === 'on' ? 'true' : 'false',
  };
  const parsed = Schema.safeParse(obj);
  if (!parsed.success) {
    redirect(`/admin/blog?err=${encodeURIComponent(parsed.error.message.slice(0, 200))}`);
  }
  const slug = (parsed.data.slug && parsed.data.slug.length > 0)
    ? slugify(parsed.data.slug, { lower: true, strict: true })
    : slugify(parsed.data.title, { lower: true, strict: true });

  const supabase = createClient();

  let cover_url: string | null | undefined = undefined;
  const file = formData.get('cover') as File | null;
  if (file && file instanceof File && file.size > 0) {
    try { cover_url = await uploadImage(file, 'blog'); }
    catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Upload error';
      redirect(`/admin/blog?err=${encodeURIComponent(msg)}`);
    }
  }
  if (formData.get('clear_cover') === 'on') cover_url = null;

  const payload: Record<string, unknown> = {
    ...parsed.data, slug, author_id: parsed.data.author_id || null,
  };
  if (cover_url !== undefined) payload.cover_url = cover_url;
  if (parsed.data.published) payload.published_at = new Date().toISOString();

  if (id) {
    const { error } = await supabase.from('blog_posts').update(payload).eq('id', id);
    if (error) redirect(`/admin/blog?err=${encodeURIComponent(error.message)}`);
  } else {
    const { error } = await supabase.from('blog_posts').insert(payload);
    if (error) redirect(`/admin/blog?err=${encodeURIComponent(error.message)}`);
  }

  // Only one featured at a time.
  if (parsed.data.featured) {
    await supabase.from('blog_posts').update({ featured: false }).neq('slug', slug);
  }

  revalidatePath('/blog', 'page');
  revalidatePath(`/blog/${slug}`, 'page');
  revalidatePath('/', 'layout');
  redirect('/admin/blog?ok=1');
}

export async function deletePost(formData: FormData) {
  await requireAdmin('blog');
  const id = String(formData.get('id') || '').trim();
  if (!id) redirect('/admin/blog?err=Missing+id');
  const supabase = createClient();
  const { error } = await supabase.from('blog_posts').delete().eq('id', id);
  if (error) redirect(`/admin/blog?err=${encodeURIComponent(error.message)}`);
  revalidatePath('/blog', 'page');
  redirect('/admin/blog?ok=1');
}

export async function upsertAuthor(formData: FormData) {
  await requireAdmin('blog');
  const name = String(formData.get('name') || '').trim();
  const initials = String(formData.get('initials') || '').toUpperCase().trim();
  const role = String(formData.get('role') || '').trim();
  if (!name || !initials) redirect('/admin/blog?err=Author+name+required');
  const supabase = createClient();
  const { error } = await supabase.from('authors').insert({ name, initials, role });
  if (error) redirect(`/admin/blog?err=${encodeURIComponent(error.message)}`);
  revalidatePath('/blog', 'page');
  redirect('/admin/blog?ok=1');
}
