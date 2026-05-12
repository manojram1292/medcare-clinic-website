import { getAnnouncement, getClinic, getPopup, getServices } from '@/lib/data';
import AnnouncementBanner from '@/components/public/AnnouncementBanner';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import PopupAlert from '@/components/public/PopupAlert';
import ScrollReveal from '@/components/public/ScrollReveal';
import ScrollProgress from '@/components/public/ScrollProgress';
import BackToTop from '@/components/public/BackToTop';

export const revalidate = 60;

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [clinic, ann, popup, services] = await Promise.all([
    getClinic(), getAnnouncement(), getPopup(), getServices(),
  ]);
  return (
    <>
      <a href="#main" className="skip-link">Skip to main content</a>
      <ScrollProgress />
      <AnnouncementBanner ann={ann} />
      <Navbar clinicName={clinic.name} tagline={clinic.tagline} />
      <main id="main" className="page-transition">{children}</main>
      <Footer clinic={clinic} services={services} />
      <PopupAlert popup={popup} />
      <ScrollReveal />
      <BackToTop />
    </>
  );
}
