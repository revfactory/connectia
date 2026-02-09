import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-[#E4E6EB] dark:bg-[#3A3B3C]',
        className
      )}
    />
  )
}
