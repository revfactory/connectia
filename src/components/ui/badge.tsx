import { cn } from '@/lib/utils'

interface BadgeProps {
  count: number
  className?: string
}

export function Badge({ count, className }: BadgeProps) {
  if (count <= 0) return null
  const display = count > 99 ? '99+' : count.toString()
  return (
    <span
      className={cn(
        'absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--color-error)] text-white text-[11px] font-bold',
        className
      )}
    >
      {display}
    </span>
  )
}
