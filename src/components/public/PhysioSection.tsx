import Link from 'next/link';
import type { Doctor } from '@/lib/types';

export default function PhysioSection({ doctors }: { doctors: Doctor[] }) {
  const physio = doctors.find((d) => /physio|rehab/i.test(d.specialty));
  return (
    <section className="physio-sec">
      <div className="physio-layout">
        <div>
          <div className="physio-label">Specialised Care</div>
          <h2 className="physio-title">Physiotherapy &amp; Rehabilitation</h2>
          <p className="physio-sub">
            Our dedicated physiotherapy centre offers personalised rehabilitation,
            sports injury recovery, chronic pain management, and post-surgical
            restoration{physio ? <> — guided by {physio.name}</> : null}.
          </p>
          <div className="physio-list">
            {[
              'Manual therapy & joint mobilisation',
              'Sports injury rehabilitation',
              'Chronic pain management',
              'Post-surgical recovery programmes',
              'Personalised movement & exercise plans',
            ].map((f) => (
              <div key={f} className="physio-li">
                <div className="physio-li-dot" />
                <span>{f}</span>
              </div>
            ))}
          </div>
          <Link className="btn btn-teal btn-lg" href="/services">
            Learn More About Physiotherapy
          </Link>
        </div>
        <div className="physio-panel">
          {[
            ['500+', 'Patients Rehabilitated'],
            ['98%', 'Recovery Success Rate'],
            [physio?.name ?? 'Lead Physiotherapist', physio ? 'Lead Physiotherapist' : 'Joining soon'],
          ].map(([num, label], i) => (
            <div key={`${label}-${i}`}>
              {i > 0 && <div className="p-divider" />}
              <div className="p-stat">
                <div className="p-stat-num">{num}</div>
                <div className="p-stat-label">{label}</div>
              </div>
            </div>
          ))}
          <div className="p-divider" />
          <Link href="/contact" className="btn-physio">Enquire About Physiotherapy →</Link>
        </div>
      </div>
    </section>
  );
}
