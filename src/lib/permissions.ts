// Role-based access control for the admin panel.
//
// Roles (lowest → highest permission):
//   editor       — content only (blog, patient hub, FAQs, testimonials)
//   receptionist — front-desk operations (hours, banner, popup, wait time)
//   manager      — everything except managing users / billing
//   owner        — everything (you)
//
// Each admin row in the `admins` table has a `role` column. Server actions and
// page guards call `requireAdmin(resource)` which checks the role against the
// matrix below.

export const ROLES = ['owner', 'manager', 'receptionist', 'editor'] as const;
export type Role = (typeof ROLES)[number];

export const RESOURCES = [
  'dashboard',     // /admin (always visible to any admin)
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
  'users',         // /admin/users (owner only)
  'account',       // /admin/account (everyone — change own password)
] as const;
export type Resource = (typeof RESOURCES)[number];

const matrix: Record<Resource, readonly Role[]> = {
  dashboard:     ['owner', 'manager', 'receptionist', 'editor'],
  account:       ['owner', 'manager', 'receptionist', 'editor'],
  clinic:        ['owner', 'manager'],
  hours:         ['owner', 'manager', 'receptionist'],
  doctors:       ['owner', 'manager'],
  services:      ['owner', 'manager'],
  faqs:          ['owner', 'manager', 'editor'],
  blog:          ['owner', 'manager', 'editor'],
  patient_hub:   ['owner', 'manager', 'editor'],
  announcements: ['owner', 'manager', 'receptionist'],
  popups:        ['owner', 'manager', 'receptionist'],
  testimonials:  ['owner', 'manager', 'editor'],
  wait_time:     ['owner', 'manager', 'receptionist'],
  users:         ['owner'],
};

export function canAccess(role: Role, resource: Resource): boolean {
  return matrix[resource].includes(role);
}

export function visibleResourcesFor(role: Role): Resource[] {
  return (Object.entries(matrix) as Array<[Resource, readonly Role[]]>)
    .filter(([, roles]) => roles.includes(role))
    .map(([resource]) => resource);
}

export const ROLE_LABEL: Record<Role, string> = {
  owner: 'Owner',
  manager: 'Manager',
  receptionist: 'Receptionist',
  editor: 'Editor',
};

export const ROLE_DESCRIPTION: Record<Role, string> = {
  owner:
    'Full access — including managing users and clinic information.',
  manager:
    'Full editorial and operational access, except managing user accounts.',
  receptionist:
    'Front-desk: hours, announcement banner, popup alerts, live wait time.',
  editor:
    'Content only: blog posts, patient hub articles, FAQs, testimonials.',
};
