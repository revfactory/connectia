import * as React from 'react'
import { cn } from '@/lib/utils'

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-lg bg-[var(--color-bg-card)] shadow-[var(--shadow-card)]',
        className
      )}
      {...props}
    />
  )
)
Card.displayName = 'Card'

export { Card }
