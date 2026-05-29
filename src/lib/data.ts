import { createClient } from '@/lib/supabase/server';
import type {
  Announcement, BlogPost, Clinic, Doctor, Faq, Hours, PopupAlert,
  Service, Testimonial, Author, PatientHubArticle,
} from './types';

const FALLBACK_CLINIC: Clinic = {
  id: 1,
  name: 'MedCare Family Clinic',
  tagline: 'Family Medicine & Physiotherapy',
  phone: '+1 (902) 555-0192',
  email: 'care@medcareclinic.ca',
  address: '42 Wellness Avenue, Suite 101, Mineville, NS B2Z 1K9',
  emergency_text:
    'For life-threatening emergencies, please call 911 or visit your nearest hospital emergency department immediately.',
  hero_eyebrow: 'Family Medicine · Mineville, Nova Scotia',
  hero_title_1: "Your Family's Health,",
  hero_title_2: 'In Caring Hands',
  hero_body:
    'We are a team of dedicated family physicians and physiotherapists committed to building lasting relationships with our patients. Because the best care begins with truly knowing the people we serve.',
  about_mission:
    'Great medicine begins with a relationship. At MedCare, our physicians invest in knowing each patient — their history, their lifestyle, their goals. We build the kind of trust that makes medicine truly personal.',
  about_quote:
    'Our goal is not just to treat illness, but to partner with our patients in building lifelong health.',
  google_maps_embed: null,
  logo_url: null,
  parking_info: null,
  insurance_info: null,
  what_to_bring: null,
  walk_in_policy: null,
  languages_supported: [],
  current_wait_minutes: null,
  wait_updated_at: null,
  stats: [],
};

const FALLBACK_HOURS: Hours[] = [
  { day_index: 0, day_name: 'Monday',    open_time: '8:00 AM', close_time: '6:00 PM', closed: false, override_note: null },
  { day_index: 1, day_name: 'Tuesday',   open_time: '8:00 AM', close_time: '7:00 PM', closed: false, override_note: null },
  { day_index: 2, day_name: 'Wednesday', open_time: '8:00 AM', close_time: '6:00 PM', closed: false, override_note: null },
  { day_index: 3, day_name: 'Thursday',  open_time: '8:00 AM', close_time: '7:00 PM', closed: false, override_note: null },
  { day_index: 4, day_name: 'Friday',    open_time: '8:00 AM', close_time: '5:00 PM', closed: false, override_note: null },
  { day_index: 5, day_name: 'Saturday',  open_time: '9:00 AM', close_time: '2:00 PM', closed: false, override_note: null },
  { day_index: 6, day_name: 'Sunday',    open_time: null,      close_time: null,      closed: true,  override_note: null },
];

export function isConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return false;
  if (url.includes('YOUR-PROJECT') || key.includes('YOUR-')) return false;
  return true;
}

export async function getClinic(): Promise<Clinic> {
  if (!isConfigured()) return FALLBACK_CLINIC;
  const supabase = createClient();
  const { data, error } = await supabase.from('clinic').select('*').eq('id', 1).maybeSingle();
  if (error || !data) return FALLBACK_CLINIC;
  return data as Clinic;
}

export async function getHours(): Promise<Hours[]> {
  if (!isConfigured()) return FALLBACK_HOURS;
  const supabase = createClient();
  const { data } = await supabase.from('hours').select('*').order('day_index');
  return (data && data.length ? (data as Hours[]) : FALLBACK_HOURS);
}

export async function getDoctors(): Promise<Doctor[]> {
  if (!isConfigured()) return [];
  const supabase = createClient();
  const { data } = await supabase.from('doctors').select('*').order('sort');
  return (data ?? []) as Doctor[];
}

export async function getServices(): Promise<Service[]> {
  if (!isConfigured()) return [];
  const supabase = createClient();
  const { data } = await supabase.from('services').select('*').order('sort');
  return (data ?? []) as Service[];
}

export async function getTestimonials(): Promise<Testimonial[]> {
  if (!isConfigured()) return [];
  const supabase = createClient();
  const { data } = await supabase.from('testimonials').select('*').order('sort');
  return (data ?? []) as Testimonial[];
}

export async function getAuthors(): Promise<Author[]> {
  if (!isConfigured()) return [];
  const supabase = createClient();
  const { data } = await supabase.from('authors').select('*').order('name');
  return (data ?? []) as Author[];
}

export async function getPosts(opts: { onlyPublished?: boolean } = {}): Promise<BlogPost[]> {
  if (!isConfigured()) return [];
  const supabase = createClient();
  let q = supabase.from('blog_posts').select('*').order('published_at', { ascending: false });
  if (opts.onlyPublished) q = q.eq('published', true);
  const { data } = await q;
  return (data ?? []) as BlogPost[];
}

// Public path — only returns published posts. Unpublished posts are edited
// via the admin path which reads the table directly.
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!isConfigured()) return null;
  const supabase = createClient();
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();
  return (data as BlogPost | null) ?? null;
}

export async function getAnnouncement(): Promise<Announcement> {
  if (!isConfigured()) {
    return { id: 1, message: 'Walk-ins welcome — we\'ll do our best to see you the same day.', active: true, urgent: false };
  }
  const supabase = createClient();
  const { data } = await supabase.from('announcement').select('*').eq('id', 1).maybeSingle();
  return (data as Announcement | null) ?? {
    id: 1,
    message: 'Walk-ins welcome — we\'ll do our best to see you the same day.',
    active: true,
    urgent: false,
  };
}

export async function getFaqs(opts: { onlyActive?: boolean } = {}): Promise<Faq[]> {
  if (!isConfigured()) return [];
  const supabase = createClient();
  let q = supabase.from('faqs').select('*').order('sort');
  if (opts.onlyActive) q = q.eq('active', true);
  const { data } = await q;
  return (data ?? []) as Faq[];
}

export async function getDoctorBySlug(slug: string): Promise<Doctor | null> {
  if (!isConfigured()) return null;
  const supabase = createClient();
  const { data } = await supabase.from('doctors').select('*').eq('slug', slug).maybeSingle();
  return (data as Doctor | null) ?? null;
}

export async function getPopup(): Promise<PopupAlert> {
  const fallback: PopupAlert = {
    id: 1, active: false, urgent: false,
    title: 'Important notice', body: '', cta_label: null, cta_url: null, version: 1,
  };
  if (!isConfigured()) return fallback;
  const supabase = createClient();
  const { data } = await supabase.from('popup_alert').select('*').eq('id', 1).maybeSingle();
  return (data as PopupAlert | null) ?? fallback;
}

export async function getPatientHubArticles(opts: { onlyPublished?: boolean } = {}): Promise<PatientHubArticle[]> {
  if (!isConfigured()) return [];
  const supabase = createClient();
  let q = supabase.from('patient_hub').select('*').order('sort', { ascending: true }).order('created_at', { ascending: false });
  if (opts.onlyPublished) q = q.eq('published', true);
  const { data } = await q;
  return (data ?? []) as PatientHubArticle[];
}

export async function getPatientHubBySlug(slug: string): Promise<PatientHubArticle | null> {
  if (!isConfigured()) return null;
  const supabase = createClient();
  // Filter `published = true` explicitly: RLS would block unpublished rows
  // for anon, but admins reading via this fetcher should also get nothing
  // for public consumption paths. The admin-only edit page uses a separate
  // fetch path against the table directly.
  const { data } = await supabase
    .from('patient_hub')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();
  return (data as PatientHubArticle | null) ?? null;
}

export async function searchPatientHub(query: string): Promise<PatientHubArticle[]> {
  if (!isConfigured()) return [];
  const trimmed = query.trim();
  if (!trimmed) return [];
  const supabase = createClient();
  const { data, error } = await supabase.rpc('search_patient_hub', { q: trimmed });
  if (error) return [];
  return (data ?? []) as PatientHubArticle[];
}

export async function isAdmin(): Promise<boolean> {
  if (!isConfigured()) return false;
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase.from('admins').select('id').eq('id', user.id).maybeSingle();
  return Boolean(data);
}
