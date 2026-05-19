// Granular permission model.
//
// Every admin has TWO things:
//   is_owner    — special flag. Owners have every permission and can manage
//                 other users. Used for the "you can do anything" toggle.
//   permissions — explicit list of resource keys the admin can access.
//
// In the admin UI the owner ticks checkboxes per resource per user. We also
// provide one-click presets (Owner / Manager / Receptionist / Editor) that
// fill those checkboxes for common shapes — but the user is free to mix
// and match (e.g. a "Receptionist who can also edit FAQs").

export const RESOURCES = [
  'dashboard',     // /admin (always granted in presets)
  'account',       // /admin/account (always granted — change own password)
  'clinic',        // /admin/clinic
  'hours',         // /admin/hours
  'doctors',       // /admin/doctors
  'services',      // /admin/services
  'faqs',          // /admin/faqs
  'blog',          // /admin/blog
  'patient_hub',   // /admin/patient-hub
  'announcements', // /admin/announcements
  'popups',        // /admin/popups
  'testimonials',  // /admin/testimonials
  'wait_time',     // wait-time strip on /admin/clinic
  'users',         // /admin/users — visible to owners regardless of this flag
] as const;
export type Resource = (typeof RESOURCES)[number];

export const RESOURCE_LABEL: Record<Resource, string> = {
  dashboard:     'Dashboard',
  account:       'My account',
  clinic:        'Clinic info',
  hours:         'Clinic hours',
  doctors:       'Doctors',
  services:      'Services',
  faqs:          'FAQs',
  blog:          'Blog posts',
  patient_hub:   'Patient Hub',
  announcements: 'Announcement banner',
  popups:        'Popup alerts',
  testimonials:  'Testimonials',
  wait_time:     'Live wait time',
  users:         'Users & permissions',
};

export const RESOURCE_DESCRIPTION: Record<Resource, string> = {
  dashboard:     'View the admin dashboard.',
  account:       'Change own password.',
  clinic:        'Edit clinic name, hero, about, contact info, stats strip.',
  hours:         'Set weekly hours and override notes (storm closures etc).',
  doctors:       'Add/edit/remove doctors and their schedules + photos.',
  services:      'Add/edit/remove the services list on the home page.',
  faqs:          'Manage frequently asked questions.',
  blog:          'Write, publish, edit blog posts and authors.',
  patient_hub:   'Write, publish, edit patient-information articles.',
  announcements: 'Toggle and edit the announcement banner.',
  popups:        'Toggle and edit the modal popup alert.',
  testimonials:  'Add/edit/remove patient quotes.',
  wait_time:     'Update the live wait-time pill.',
  users:         'Invite staff, change permissions, remove users.',
};

// Resources that are ALWAYS granted to any admin (sign-in is enough).
export const ALWAYS_ALLOWED: readonly Resource[] = ['dashboard', 'account'];

// One-click presets — pick a preset → all the relevant checkboxes flip on.
// The user can then tweak individual checkboxes before saving.
export const PRESETS = {
  owner: {
    label: 'Owner',
    description: 'Everything, plus managing other users.',
    is_owner: true,
    permissions: [...RESOURCES] as Resource[], // included for display; owner is implicit
  },
  manager: {
    label: 'Manager',
    description: 'Everything except managing other users.',
    is_owner: false,
    permissions: RESOURCES.filter((r) => r !== 'users') as Resource[],
  },
  receptionist: {
    label: 'Receptionist',
    description: 'Front-desk: hours, announcement banner, popup alerts, wait time.',
    is_owner: false,
    permissions: ['dashboard', 'account', 'hours', 'announcements', 'popups', 'wait_time'] as Resource[],
  },
  editor: {
    label: 'Editor',
    description: 'Content only: blog, patient hub, FAQs, testimonials.',
    is_owner: false,
    permissions: ['dashboard', 'account', 'blog', 'patient_hub', 'faqs', 'testimonials'] as Resource[],
  },
} as const;
export type Preset = keyof typeof PRESETS;
export const PRESET_KEYS = ['owner', 'manager', 'receptionist', 'editor'] as const;

// The slim shape of an admin the rest of the app talks to.
export type AdminProfile = {
  id: string;
  is_owner: boolean;
  permissions: Set<Resource>;
};

export function makeAdminProfile(row: {
  id: string;
  is_owner?: boolean | null;
  permissions?: string[] | null;
}): AdminProfile {
  return {
    id: row.id,
    is_owner: Boolean(row.is_owner),
    permissions: new Set((row.permissions ?? []) as Resource[]),
  };
}

export function canAccess(admin: AdminProfile, resource: Resource): boolean {
  if (admin.is_owner) return true;
  if ((ALWAYS_ALLOWED as readonly Resource[]).includes(resource)) return true;
  // Only owners can manage other users — receptionists can never tick this on.
  if (resource === 'users') return admin.is_owner;
  return admin.permissions.has(resource);
}

export function visibleResourcesFor(admin: AdminProfile): Resource[] {
  return RESOURCES.filter((r) => canAccess(admin, r));
}

/** Best-guess preset matching the permission set (for display in the UI). */
export function detectPreset(admin: AdminProfile): Preset | 'custom' {
  if (admin.is_owner) return 'owner';
  for (const key of ['manager', 'receptionist', 'editor'] as const) {
    const want = new Set(PRESETS[key].permissions);
    if (want.size !== admin.permissions.size) continue;
    let match = true;
    admin.permissions.forEach((p) => { if (!want.has(p)) match = false; });
    if (match) return key;
  }
  return 'custom';
}

export const PRESET_LABEL: Record<Preset | 'custom', string> = {
  owner: 'Owner',
  manager: 'Manager',
  receptionist: 'Receptionist',
  editor: 'Editor',
  custom: 'Custom',
};
