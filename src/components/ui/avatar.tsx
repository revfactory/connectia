'use client'

import * as React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

const sizeMap = {
  xs: 'h-7 w-7',
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-20 w-20',
  xxl: 'h-[168px] w-[168px]',
} as const

const textSizeMap = {
  xs: 'text-xs',
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-2xl',
  xxl: 'text-5xl',
} as const

const onlineDotSizeMap = {
  xs: 'h-2 w-2',
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3 w-3',
  xl: 'h-5 w-5',
  xxl: 'h-8 w-8',
} as const

interface AvatarProps {
  src?: string | null
  alt?: string
  name?: string
  size?: keyof typeof sizeMap
  isOnline?: boolean
  className?: string
}

export function Avatar({ src, alt, name, size = 'md', isOnline, className }: AvatarProps) {
  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      <div
        className={cn(
          'relative overflow-hidden rounded-full',
          sizeMap[size]
        )}
      >
        {src ? (
          <Image
            src={src}
            alt={alt || name || 'Avatar'}
            fill
            className="object-cover"
          />
        ) : (
          <div
            className={cn(
              'flex h-full w-full items-center justify-center bg-[var(--color-primary)] text-white font-semibold',
              textSizeMap[size]
            )}
          >
            {initials}
          </div>
        )}
      </div>
      {isOnline && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full bg-[var(--color-online)] border-2 border-white dark:border-[#242526]',
            onlineDotSizeMap[size]
          )}
        />
      )}
    </div>
  )
}
