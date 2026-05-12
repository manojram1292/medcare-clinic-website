import type { Metadata } from 'next';
import { getDoctors } from '@/lib/data';
import DoctorsGrid from '@/components/public/DoctorsGrid';

export const revalidate = 60;
export const metadata: Metadata = { title: 'Our Physicians', description: 'Meet our doctors and physiotherapists.' };

export default async function DoctorsPage() {
  const doctors = await getDoctors();
  return (
    <div style={{ animation: 'fadeUp .35s ease' }}>
      <div className="about-hero-sec">
        <div className="sec-label" style={{ color: 'var(--teal-light)' }}>Our Physicians</div>
        <h1>The Faces Behind Your Care</h1>
        <p>Dedicated clinicians committed to serving you and your family with expertise, warmth, and continuity.</p>
      </div>
      <section className="sec" style={{ background: 'var(--cream)' }}>
        <div className="sec-inner">
          <DoctorsGrid doctors={doctors} showFullSchedule />
          {doctors.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: 40 }}>
              No doctors yet. Add some from the admin panel.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
