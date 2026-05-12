import Hero from '@/components/public/Hero';
import HeroParallax from '@/components/public/HeroParallax';
import TrustBar from '@/components/public/TrustBar';
import StatusSection from '@/components/public/StatusSection';
import DoctorsGrid from '@/components/public/DoctorsGrid';
import ServicesGrid from '@/components/public/ServicesGrid';
import PhysioSection from '@/components/public/PhysioSection';
import Testimonials from '@/components/public/Testimonials';
import LocationSection from '@/components/public/LocationSection';
import FaqSection from '@/components/public/FaqSection';
import StatsStrip from '@/components/public/StatsStrip';
import { ClinicJsonLd } from '@/components/public/JsonLd';
import {
  getClinic, getDoctors, getFaqs, getHours, getServices, getTestimonials,
} from '@/lib/data';

export const revalidate = 60;

export default async function HomePage() {
  const [clinic, doctors, hours, services, tests, faqs] = await Promise.all([
    getClinic(), getDoctors(), getHours(), getServices(), getTestimonials(),
    getFaqs({ onlyActive: true }),
  ]);

  return (
    <>
      <ClinicJsonLd clinic={clinic} hours={hours} />
      <HeroParallax />
      <Hero clinic={clinic} doctors={doctors} />
      <TrustBar />
      <StatsStrip stats={clinic.stats} />
      <StatusSection clinic={clinic} hours={hours} />
      <section className="sec" style={{ background: 'var(--cream)' }}>
        <div className="sec-inner">
          <div className="sec-header center">
            <div className="sec-label">Our Team</div>
            <div className="sec-title">Meet Your Physicians</div>
            <p className="sec-sub">
              Experienced, board-certified doctors and physiotherapists committed to your family&apos;s long-term health.
            </p>
          </div>
          <DoctorsGrid doctors={doctors} />
        </div>
      </section>
      <section className="sec" style={{ background: 'var(--white)' }}>
        <div className="sec-inner">
          <div className="sec-header">
            <div className="sec-label">What We Offer</div>
            <div className="sec-title">Our Clinical Services</div>
            <p className="sec-sub">
              Comprehensive, compassionate healthcare for your whole family — all under one roof.
            </p>
          </div>
          <ServicesGrid services={services} />
        </div>
      </section>
      <PhysioSection doctors={doctors} />
      <Testimonials items={tests} />
      <FaqSection faqs={faqs.slice(0, 6)} title="Quick Answers" subtitle="The most common questions, answered." />
      <LocationSection clinic={clinic} hours={hours} />
    </>
  );
}
