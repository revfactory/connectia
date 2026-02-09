'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export type ReactionType = 'LIKE' | 'LOVE' | 'HAHA' | 'WOW' | 'SAD' | 'ANGRY'

interface Reaction {
  type: ReactionType
  emoji: string
  label: string
  color: string
}

const reactions: Reaction[] = [
  { type: 'LIKE', emoji: '\uD83D\uDC4D', label: '\uC88B\uC544\uC694', color: 'text-[var(--color-primary)]' },
  { type: 'LOVE', emoji: '\u2764\uFE0F', label: '\uC88B\uC544\uC694', color: 'text-[var(--color-reaction-love)]' },
  { type: 'HAHA', emoji: '\uD83D\uDE04', label: '\uD558\uD558', color: 'text-[var(--color-reaction-haha)]' },
  { type: 'WOW', emoji: '\uD83D\uDE2E', label: '\uC640', color: 'text-[var(--color-reaction-haha)]' },
  { type: 'SAD', emoji: '\uD83D\uDE22', label: '\uC2AC\uD37C\uC694', color: 'text-[var(--color-reaction-haha)]' },
  { type: 'ANGRY', emoji: '\uD83D\uDE20', label: '\uD654\uB098\uC694', color: 'text-[var(--color-reaction-angry)]' },
]

interface ReactionPickerProps {
  isVisible: boolean
  selectedReaction?: ReactionType | null
  onSelect: (type: ReactionType) => void
}

export function ReactionPicker({ isVisible, selectedReaction, onSelect }: ReactionPickerProps) {
  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.9 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="absolute bottom-full left-0 mb-2 flex items-center gap-1 rounded-full bg-[var(--color-bg-card)] px-2 py-1 shadow-[var(--shadow-dropdown)] border border-[var(--color-divider)] z-30"
    >
      {reactions.map((reaction) => (
        <motion.button
          key={reaction.type}
          whileHover={{ scale: 1.3, y: -4 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(reaction.type)}
          className={cn(
            'flex flex-col items-center rounded-full p-1.5 transition-colors hover:bg-[var(--color-bg-hover)]',
            selectedReaction === reaction.type && 'bg-[var(--color-bg-active)]'
          )}
          title={reaction.label}
        >
          <span className="text-[28px] leading-none">{reaction.emoji}</span>
        </motion.button>
      ))}
    </motion.div>
  )
}

export function getReactionDisplay(type: ReactionType) {
  return reactions.find((r) => r.type === type) ?? reactions[0]
}
