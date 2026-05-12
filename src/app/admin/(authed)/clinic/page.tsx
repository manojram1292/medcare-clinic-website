import { Flash } from '@/components/admin/Flash';
import { getClinic } from '@/lib/data';
import { saveClinic, setWaitTime, saveStats } from './actions';

export default async function ClinicAdminPage({ searchParams }: { searchParams: { ok?: string; err?: string } }) {
  const c = await getClinic();
  const waitFresh = c.wait_updated_at && Date.now() - new Date(c.wait_updated_at).getTime() < 90 * 60 * 1000;
  return (
    <>
      <h1 className="admin-h1">Clinic information</h1>
      <p className="admin-sub">These fields appear across the public site — header, footer, hero, contact, FAQ.</p>
      <Flash ok={searchParams.ok ? 'Saved.' : null} err={searchParams.err ?? null} />

      <div className="admin-card" style={{ borderLeft: '3px solid var(--teal)' }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 18, marginBottom: 6, color: 'var(--navy)' }}>
          Live wait time
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 12 }}>
          Set the current wait, in minutes, when you have a moment. It auto-hides after 90 minutes
          so patients never see stale info. Leave empty (or click clear) to hide entirely.
          {c.current_wait_minutes != null && c.wait_updated_at && (
            <span style={{ display: 'block', marginTop: 6 }}>
              Currently showing: <strong>{c.current_wait_minutes} min</strong> ·
              {' '}set {Math.round((Date.now() - new Date(c.wait_updated_at).getTime()) / 60000)} min ago
              {!waitFresh && <span style={{ color: '#DC2626' }}> · (now hidden — stale)</span>}
            </span>
          )}
        </p>
        <form action={setWaitTime} style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ width: 180 }}>
            <label className="form-label">Minutes</label>
            <input className="form-input" name="current_wait_minutes" type="number" min={0} max={240}
              defaultValue={c.current_wait_minutes ?? ''} placeholder="e.g. 15" />
          </div>
          <button className="btn btn-teal" type="submit">Update wait</button>
          <button className="btn btn-outline" type="submit" name="current_wait_minutes" value="clear">Clear / hide</button>
        </form>
      </div>

      <div className="admin-card">
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 18, marginBottom: 6, color: 'var(--navy)' }}>
          &ldquo;Why choose us&rdquo; stats strip
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 14 }}>
          Up to 6 quick stats shown just below the hero. Numeric values animate up
          from zero on scroll. Leave a row blank to skip it.
        </p>
        <form action={saveStats}>
          <div className="stats-admin-row stats-admin-head">
            <span>Value (e.g. 15 / 5,000 / 4.9)</span>
            <span>Suffix</span>
            <span>Label</span>
          </div>
          {Array.from({ length: 6 }).map((_, i) => {
            const s = c.stats?.[i];
            return (
              <div key={i} className="stats-admin-row">
                <input className="form-input" name={`stat_value_${i}`} defaultValue={s?.value ?? ''} maxLength={20} placeholder="15" />
                <input className="form-input" name={`stat_suffix_${i}`} defaultValue={s?.suffix ?? ''} maxLength={4} placeholder="+" />
                <input className="form-input" name={`stat_label_${i}`} defaultValue={s?.label ?? ''} maxLength={80} placeholder="Years serving the community" />
              </div>
            );
          })}
          <button className="btn btn-navy" style={{ marginTop: 6 }}>Save stats</button>
        </form>
      </div>

      <form action={saveClinic} className="admin-card">
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 18, marginBottom: 12, color: 'var(--navy)' }}>
          Identity &amp; contact
        </h3>
        <div className="admin-row">
          <Field label="Clinic name" name="name" defaultValue={c.name} />
          <Field label="Tagline" name="tagline" defaultValue={c.tagline} />
        </div>
        <div className="admin-row">
          <Field label="Phone" name="phone" defaultValue={c.phone} />
          <Field label="Email" name="email" type="email" defaultValue={c.email} />
        </div>
        <Field label="Address" name="address" defaultValue={c.address} />
        <Field label="Emergency text" name="emergency_text" defaultValue={c.emergency_text} as="textarea" />
        <Field label="Languages spoken (comma-separated)" name="languages_supported"
          defaultValue={(c.languages_supported || []).join(', ')} />

        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 18, marginTop: 28, marginBottom: 12, color: 'var(--navy)' }}>
          Hero (homepage top)
        </h3>
        <Field label="Eyebrow" name="hero_eyebrow" defaultValue={c.hero_eyebrow} />
        <div className="admin-row">
          <Field label="Title — line 1" name="hero_title_1" defaultValue={c.hero_title_1} />
          <Field label="Title — line 2 (italic)" name="hero_title_2" defaultValue={c.hero_title_2} />
        </div>
        <Field label="Body paragraph" name="hero_body" defaultValue={c.hero_body} as="textarea" />

        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 18, marginTop: 28, marginBottom: 12, color: 'var(--navy)' }}>
          About page
        </h3>
        <Field label="Mission paragraph" name="about_mission" defaultValue={c.about_mission} as="textarea" />
        <Field label="Highlight quote" name="about_quote" defaultValue={c.about_quote} as="textarea" />

        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 18, marginTop: 28, marginBottom: 12, color: 'var(--navy)' }}>
          First-visit info (shown on Contact page)
        </h3>
        <Field label="What to bring" name="what_to_bring" defaultValue={c.what_to_bring ?? ''} as="textarea" />
        <Field label="Walk-in policy" name="walk_in_policy" defaultValue={c.walk_in_policy ?? ''} as="textarea" />
        <Field label="Parking info" name="parking_info" defaultValue={c.parking_info ?? ''} as="textarea" />
        <Field label="Insurance &amp; billing" name="insurance_info" defaultValue={c.insurance_info ?? ''} as="textarea" />

        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 18, marginTop: 28, marginBottom: 12, color: 'var(--navy)' }}>
          Google Maps
        </h3>
        <Field label="Maps embed URL (Google Maps → Share → Embed → copy src=)"
          name="google_maps_embed" defaultValue={c.google_maps_embed ?? ''} />
        <div style={{ marginTop: 16 }}>
          <button className="btn btn-navy btn-lg" type="submit">Save changes</button>
        </div>
      </form>
    </>
  );
}

function Field({ label, name, defaultValue, type = 'text', as }:
  { label: string; name: string; defaultValue?: string; type?: string; as?: 'textarea' }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {as === 'textarea'
        ? <textarea className="form-input form-textarea" name={name} defaultValue={defaultValue} />
        : <input className="form-input" name={name} type={type} defaultValue={defaultValue} />}
    </div>
  );
}
