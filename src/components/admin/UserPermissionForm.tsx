'use client';
import { useEffect, useMemo, useState } from 'react';
import DeleteButton from '@/components/admin/DeleteButton';
import {
  ALWAYS_ALLOWED, PRESETS, PRESET_KEYS, PRESET_LABEL, RESOURCES, RESOURCE_DESCRIPTION, RESOURCE_LABEL,
  type Preset, type Resource,
} from '@/lib/permissions';
import { saveAdminPermissions } from '@/app/admin/(authed)/users/actions';

type Props = {
  id: string;
  email: string;
  currentPreset: Preset | 'custom';
  currentLabel: string;
  isOwner: boolean;
  permissions: string[];
  isMe: boolean;
  createdAt: string;
  deleteAction: (formData: FormData) => Promise<void>;
};

export default function UserPermissionForm(props: Props) {
  const [isOwner, setIsOwner] = useState(props.isOwner);
  const [perms, setPerms] = useState<Set<Resource>>(
    () => new Set(props.permissions as Resource[]),
  );
  const [dirty, setDirty] = useState(false);

  // Sync internal state when props change (e.g. after server save reload)
  useEffect(() => {
    setIsOwner(props.isOwner);
    setPerms(new Set(props.permissions as Resource[]));
    setDirty(false);
  }, [props.isOwner, props.permissions.join('|')]);  // eslint-disable-line react-hooks/exhaustive-deps

  function toggle(r: Resource) {
    setPerms((prev) => {
      const next = new Set(prev);
      if (next.has(r)) next.delete(r); else next.add(r);
      return next;
    });
    setDirty(true);
  }

  function applyPreset(key: Preset) {
    const p = PRESETS[key];
    setIsOwner(p.is_owner);
    setPerms(new Set(p.permissions as Resource[]));
    setDirty(true);
  }

  const detectedPreset = useMemo(() => {
    if (isOwner) return 'owner' as const;
    for (const key of PRESET_KEYS) {
      if (key === 'owner') continue;
      const want = new Set(PRESETS[key].permissions as Resource[]);
      if (want.size !== perms.size) continue;
      let match = true;
      perms.forEach((p) => { if (!want.has(p)) match = false; });
      if (match) return key;
    }
    return 'custom' as const;
  }, [isOwner, perms]);

  return (
    <form action={saveAdminPermissions} className="user-card admin-card">
      <input type="hidden" name="id" value={props.id} />

      <header className="user-card-head">
        <div className="user-card-id">
          <div className="user-card-avatar">{(props.email[0] || '?').toUpperCase()}</div>
          <div>
            <div className="user-card-email">
              {props.email}
              {props.isMe && <span className="user-card-you">you</span>}
            </div>
            <div className="user-card-meta">
              <span className={`role-badge role-${detectedPreset}`}>{PRESET_LABEL[detectedPreset]}</span>
              <span style={{ marginLeft: 10, fontSize: 12, color: 'var(--text-3)' }}>
                {isOwner ? 'all permissions' : `${perms.size} permission${perms.size === 1 ? '' : 's'}`}
              </span>
            </div>
          </div>
        </div>
        <DeleteButton action={props.deleteAction} id={props.id}
          confirm={`Remove ${props.email} from admins?`} />
      </header>

      <div className="user-presets">
        <span className="user-presets-label">Quick preset:</span>
        {PRESET_KEYS.map((k) => (
          <button key={k} type="button"
            className={`preset-pill ${detectedPreset === k ? 'active' : ''}`}
            onClick={() => applyPreset(k)}>
            {PRESET_LABEL[k]}
          </button>
        ))}
        <span className="user-presets-hint">— or tick checkboxes below to make a custom set</span>
      </div>

      <div className="user-owner-row">
        <label className="owner-toggle">
          <input
            type="checkbox"
            name="is_owner"
            checked={isOwner}
            onChange={(e) => { setIsOwner(e.target.checked); setDirty(true); }}
          />
          <span>
            <strong>Owner</strong> — has every permission, and is the only role that can manage users.
          </span>
        </label>
      </div>

      <fieldset className="perm-grid" disabled={isOwner}>
        <legend className="perm-grid-legend">
          {isOwner ? 'Owner has everything (checkboxes locked)' : 'Tick each thing this user can access'}
        </legend>
        {RESOURCES.map((r) => {
          const always = (ALWAYS_ALLOWED as readonly Resource[]).includes(r);
          const ownerOnly = r === 'users';
          const checked = isOwner || always || (ownerOnly ? false : perms.has(r));
          const lockReason = always ? '(always allowed)' : ownerOnly ? '(owner only)' : null;
          return (
            <label
              key={r}
              className={`perm-item ${checked ? 'checked' : ''} ${lockReason ? 'perm-locked' : ''}`}
            >
              <input
                type="checkbox"
                name={`perm:${r}`}
                checked={checked}
                disabled={always || ownerOnly || isOwner}
                onChange={() => toggle(r)}
              />
              <div className="perm-item-text">
                <div className="perm-item-title">
                  {RESOURCE_LABEL[r]}
                  {lockReason && <span className="perm-lock-tag">{lockReason}</span>}
                </div>
                <div className="perm-item-desc">{RESOURCE_DESCRIPTION[r]}</div>
              </div>
            </label>
          );
        })}
      </fieldset>

      <footer className="user-card-foot">
        {dirty && <span className="user-card-dirty">Unsaved changes</span>}
        <button type="submit" className="btn btn-navy">Save permissions</button>
      </footer>
    </form>
  );
}
