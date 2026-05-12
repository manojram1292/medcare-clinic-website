import type { MetadataRoute } from 'next';
import { getClinic } from '@/lib/data';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const clinic = await getClinic();
  return {
    name: clinic.name,
    short_name: clinic.name.split(' ')[0] || 'Clinic',
    description: clinic.tagline,
    start_url: '/',
    display: 'standalone',
    background_color: '#FDFBF5',
    theme_color: '#1B3829',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
  };
}
