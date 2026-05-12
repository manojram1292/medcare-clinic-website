import Link from 'next/link';
import {
  getClinic, getDoctors, getHours, getServices, getAnnouncement,
  getPopup, getPosts, getTestimonials,
} from '@/lib/data';

export default async function AdminDashboard() {
  const [clinic, doctors, hours, services, ann, popup, posts, tests] = await Promise.all([
    getClinic(), getDoctors(), getHours(), getServices(),
    getAnnouncement(), getPopup(), getPosts(), getTestimonials(),
  ]);
  const openDays = hours.filter((h) => !h.closed).length;
  const published = posts.filter((p) => p.published).length;

  const cards = [
    { label: 'Clinic name', val: clinic.name, href: '/admin/clinic' },
    { label: 'Doctors',     val: `${doctors.length}`, href: '/admin/doctors' },
    { label: 'Services',    val: `${services.length}`, href: '/admin/services' },
    { label: 'Open days/wk', val: `${openDays}/7`, href: '/admin/hours' },
    { label: 'Banner', val: ann.active ? (ann.urgent ? 'Urgent — On' : 'On') : 'Off', href: '/admin/announcements' },
    { label: 'Popup alert', val: popup.active ? 'Active' : 'Off', href: '/admin/popups' },
    { label: 'Blog posts',  val: `${published} published / ${posts.length} total`, href: '/admin/blog' },
    { label: 'Testimonials', val: `${tests.length}`, href: '/admin/testimonials' },
  ];

  return (
    <>
      <h1 className="admin-h1">Welcome back</h1>
      <p className="admin-sub">Quick snapshot of what visitors see right now.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="admin-card" style={{
            textDecoration: 'none', display: 'block', cursor: 'pointer',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em',
              textTransform: 'uppercase', color: 'var(--text-3)' }}>{c.label}</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22,
              fontWeight: 700, color: 'var(--navy)', marginTop: 6 }}>{c.val}</div>
            <div style={{ fontSize: 12, color: 'var(--teal)', marginTop: 8 }}>Manage →</div>
          </Link>
        ))}
      </div>
    </>
  );
}
