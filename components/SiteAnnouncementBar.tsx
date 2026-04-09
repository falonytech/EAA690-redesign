'use client'

import Link from 'next/link'
import type { AnnouncementBarProps } from '@/lib/site-settings-display'

const variantClasses: Record<AnnouncementBarProps['variant'], string> = {
  info: 'bg-sky-50 text-sky-950 border-b border-sky-200',
  warning: 'bg-amber-50 text-amber-950 border-b border-amber-200',
  neutral: 'bg-gray-100 text-gray-900 border-b border-gray-200',
}

export default function SiteAnnouncementBar({
  message,
  linkUrl,
  linkText,
  variant,
}: AnnouncementBarProps) {
  const bar = variantClasses[variant] ?? variantClasses.info
  return (
    <div
      role="region"
      aria-label="Site announcement"
      className={`w-full px-4 py-2.5 text-center text-sm ${bar}`}
    >
      <span className="inline-block max-w-4xl">{message}</span>
      {linkUrl ? (
        <>
          {' '}
          <Link
            href={linkUrl}
            className="font-semibold underline underline-offset-2 hover:opacity-80 whitespace-nowrap"
          >
            {linkText?.trim() || 'Learn more'}
          </Link>
        </>
      ) : null}
    </div>
  )
}
