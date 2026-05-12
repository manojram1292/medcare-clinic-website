import Image from 'next/image';
import type { Doctor } from '@/lib/types';

type Props = { doctor: Doctor; size?: number; className?: string };

export function DoctorAvatar({ doctor, className }: Props) {
  if (doctor.photo_url) {
    return (
      <div className={className}>
        <Image
          src={doctor.photo_url}
          alt={doctor.name}
          width={120}
          height={120}
          sizes="120px"
          style={{ objectFit: 'cover' }}
        />
      </div>
    );
  }
  return <div className={className}>{doctor.initials}</div>;
}
