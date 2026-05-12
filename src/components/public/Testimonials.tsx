import type { Testimonial } from '@/lib/types';

export default function Testimonials({ items }: { items: Testimonial[] }) {
  if (items.length === 0) return null;
  return (
    <section className="sec" style={{ background: 'var(--cream)' }}>
      <div className="sec-inner">
        <div className="sec-header center">
          <div className="sec-label">Patient Stories</div>
          <div className="sec-title">What Our Patients Say</div>
        </div>
        <div className="testi-grid">
          {items.map((t) => (
            <figure key={t.id} className="testi-card">
              <div className="testi-quote" aria-hidden>&ldquo;</div>
              <div className="testi-stars" aria-label={`${t.rating} out of 5`}>
                {'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}
              </div>
              <blockquote className="testi-text">{t.text}</blockquote>
              <figcaption className="testi-author">
                <div className="testi-av">{t.initials}</div>
                <div>
                  <div className="testi-name">{t.name}</div>
                  <div className="testi-tag">{t.tag}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
