export type DoctorStatus = 'available' | 'limited' | 'off';

export type Doctor = {
  id: string;
  name: string;
  initials: string;
  specialty: string;
  bio: string;
  status: DoctorStatus;
  photo_url: string | null;
  schedule: Record<string, string | null>;
  sort: number;
  slug: string | null;
  languages: string[];
  education: string | null;
  conditions: string[];
  years_experience: number | null;
};

export type Service = {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: 'ic-teal' | 'ic-navy' | 'ic-green' | 'ic-amber';
  tags: string[];
  sort: number;
};

export type Testimonial = {
  id: string;
  text: string;
  name: string;
  tag: string;
  initials: string;
  rating: number;
  sort: number;
};

export type Author = {
  id: string;
  name: string;
  initials: string;
  role: string;
};

export type BlogPost = {
  id: string;
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  body: string;
  cover_url: string | null;
  cover_gradient: string;
  author_id: string | null;
  read_minutes: number;
  published: boolean;
  published_at: string;
  featured: boolean;
};

export type Hours = {
  day_index: number;
  day_name: string;
  open_time: string | null;
  close_time: string | null;
  closed: boolean;
  override_note: string | null;
};

export type ClinicStat = {
  value: string;   // "15" / "5,000" / "4.9"
  suffix: string;  // "+" / "★" / ""
  label: string;
};

export type Clinic = {
  id: number;
  name: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  emergency_text: string;
  hero_eyebrow: string;
  hero_title_1: string;
  hero_title_2: string;
  hero_body: string;
  about_mission: string;
  about_quote: string;
  google_maps_embed: string | null;
  logo_url: string | null;
  parking_info: string | null;
  insurance_info: string | null;
  what_to_bring: string | null;
  walk_in_policy: string | null;
  languages_supported: string[];
  current_wait_minutes: number | null;
  wait_updated_at: string | null;
  stats: ClinicStat[];
};

export type Faq = {
  id: string;
  question: string;
  answer: string;
  category: string;
  sort: number;
  active: boolean;
};

export type Announcement = {
  id: number;
  message: string;
  active: boolean;
  urgent: boolean;
};

export type PopupAlert = {
  id: number;
  active: boolean;
  urgent: boolean;
  title: string;
  body: string;
  cta_label: string | null;
  cta_url: string | null;
  version: number;
};

export type PatientHubLink = {
  label: string;
  url: string;
};

export type PatientHubArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  cover_url: string | null;
  cover_gradient: string;
  related_links: PatientHubLink[];
  tags: string[];
  read_minutes: number;
  published: boolean;
  featured: boolean;
  sort: number;
  created_at: string;
  updated_at: string;
};

export const DAY_NAMES = [
  'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday',
] as const;
export type DayName = typeof DAY_NAMES[number];

export const WEEKDAYS_FOR_TABLE: DayName[] = [
  'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday',
];
