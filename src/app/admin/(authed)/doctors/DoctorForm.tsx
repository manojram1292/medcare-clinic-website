import Link from 'next/link';
import Image from 'next/image';
import type { Doctor } from '@/lib/types';
import { DAY_NAMES } from '@/lib/types';
import { upsertDoctor } from './actions';

export default function DoctorForm({ doctor }: { doctor?: Doctor }) {
  return (
    <form action={upsertDoctor} className="admin-card" encType="multipart/form-data">
      {doctor && <input type="hidden" name="id" value={doctor.id} />}
      <div className="admin-row">
        <Field label="Full name" name="name" defaultValue={doctor?.name} />
        <Field label="Initials" name="initials" defaultValue={doctor?.initials} maxLength={4} />
      </div>
      <Field label="Specialty" name="specialty" defaultValue={doctor?.specialty} />
      <Field label="URL slug (auto from name if blank)" name="slug" defaultValue={doctor?.slug ?? ''} maxLength={160} />
      <div className="form-group">
        <label className="form-label">Bio</label>
        <textarea className="form-input form-textarea" name="bio" defaultValue={doctor?.bio} maxLength={1500} />
      </div>
      <div className="admin-row">
        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-input form-select" name="status" defaultValue={doctor?.status ?? 'available'}>
            <option value="available">Available</option>
            <option value="limited">Limited</option>
            <option value="off">Off</option>
          </select>
        </div>
        <Field label="Sort order (lower first)" name="sort" type="number" defaultValue={String(doctor?.sort ?? 0)} />
      </div>

      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 18, marginTop: 20, marginBottom: 12,
        color: 'var(--navy)' }}>Profile</h3>
      <div className="admin-row">
        <Field label="Years of experience" name="years_experience" type="number"
          defaultValue={doctor?.years_experience != null ? String(doctor.years_experience) : ''} />
        <Field label="Languages spoken (comma-separated)" name="languages"
          defaultValue={(doctor?.languages || []).join(', ')} />
      </div>
      <Field label="Education &amp; training" name="education" defaultValue={doctor?.education ?? ''} as="textarea" />
      <Field label="Conditions &amp; areas of focus (comma-separated)" name="conditions"
        defaultValue={(doctor?.conditions || []).join(', ')} as="textarea" />

      <div className="form-group">
        <label className="form-label">Photo</label>
        {doctor?.photo_url && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Image src={doctor.photo_url} alt="" width={64} height={64}
              style={{ objectFit: 'cover', borderRadius: 12 }} />
            <label style={{ fontSize: 13 }}>
              <input type="checkbox" name="clear_photo" /> Remove photo
            </label>
          </div>
        )}
        <input type="file" name="photo" accept="image/*" />
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>JPG/PNG, max 5 MB.</div>
      </div>

      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 18, marginTop: 16, marginBottom: 12,
        color: 'var(--navy)' }}>Weekly schedule</h3>
      <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 14 }}>
        Leave a day blank to mark the doctor as not in that day. Use the format <code>9:00 AM – 5:00 PM</code>.
      </p>
      {DAY_NAMES.map((day) => (
        <div key={day} className="admin-day-row">
          <label style={{ width: 110 }}>{day}</label>
          <input className="form-input" name={`schedule_${day}`}
            defaultValue={doctor?.schedule?.[day] ?? ''} placeholder="9:00 AM – 5:00 PM"
            style={{ flex: 1 }} />
        </div>
      ))}

      <div style={{ marginTop: 18, display: 'flex', gap: 10 }}>
        <button className="btn btn-navy btn-lg" type="submit">Save doctor</button>
        <Link href="/admin/doctors" className="btn btn-outline btn-lg">Cancel</Link>
      </div>
    </form>
  );
}

function Field({ label, name, defaultValue, type = 'text', maxLength, as }:
  { label: string; name: string; defaultValue?: string; type?: string; maxLength?: number; as?: 'textarea' }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {as === 'textarea'
        ? <textarea className="form-input form-textarea" name={name} defaultValue={defaultValue} maxLength={maxLength} />
        : <input className="form-input" name={name} type={type} defaultValue={defaultValue} maxLength={maxLength} />}
    </div>
  );
}
