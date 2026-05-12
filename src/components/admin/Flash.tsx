export function Flash({ ok, err }: { ok?: string | null; err?: string | null }) {
  if (!ok && !err) return null;
  return ok ? (
    <div className="admin-flash ok">{ok}</div>
  ) : (
    <div className="admin-flash err">{err}</div>
  );
}
