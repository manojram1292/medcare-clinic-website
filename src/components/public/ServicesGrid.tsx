import type { Service } from '@/lib/types';
import { ServiceIcon } from './ServiceIcons';

export default function ServicesGrid({ services }: { services: Service[] }) {
  return (
    <div className="services-grid">
      {services.map((s) => (
        <div key={s.id} className="svc-card">
          <div className={`svc-icon ${s.color}`}>
            <ServiceIcon name={s.name} fallbackEmoji={s.icon} />
          </div>
          <div className="svc-name">{s.name}</div>
          <div className="svc-desc">{s.description}</div>
        </div>
      ))}
    </div>
  );
}
