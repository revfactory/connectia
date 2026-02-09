'use client'

import * as React from 'react'
import {
  UserPlus,
  UserCheck,
  ThumbsUp,
  MessageCircle,
  CornerDownRight,
  Share2,
  Gift,
  Bell,
  Heart,
  Tag,
  Users,
  CalendarDays,
} from 'lucide-react'
import { cn, formatRelativeTime } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
import type { NotificationType } from '@prisma/client'

const notificationIconMap: Record<
  NotificationType,
  { icon: React.ElementType; colorClass: string }
> = {
  FRIEND_REQUEST: { icon: UserPlus, colorClass: 'text-[var(--color-primary)] bg-[var(--color-primary-light)]' },
  FRIEND_ACCEPTED: { icon: UserCheck, colorClass: 'text-[var(--color-success)] bg-[rgba(42,183,80,0.1)]' },
  POST_LIKE: { icon: ThumbsUp, colorClass: 'text-[var(--color-primary)] bg-[var(--color-primary-light)]' },
  POST_COMMENT: { icon: MessageCircle, colorClass: 'text-[var(--color-success)] bg-[rgba(42,183,80,0.1)]' },
  COMMENT_REPLY: { icon: CornerDownRight, colorClass: 'text-[var(--color-success)] bg-[rgba(42,183,80,0.1)]' },
  COMMENT_LIKE: { icon: Heart, colorClass: 'text-[var(--color-error)] bg-[rgba(220,53,69,0.1)]' },
  POST_SHARE: { icon: Share2, colorClass: 'text-purple-500 bg-purple-50 dark:bg-[rgba(139,92,246,0.1)]' },
  POST_TAG: { icon: Tag, colorClass: 'text-[var(--color-primary)] bg-[var(--color-primary-light)]' },
  GROUP_INVITE: { icon: Users, colorClass: 'text-[var(--color-primary)] bg-[var(--color-primary-light)]' },
  EVENT_INVITE: { icon: CalendarDays, colorClass: 'text-orange-500 bg-orange-50 dark:bg-[rgba(249,115,22,0.1)]' },
  BIRTHDAY: { icon: Gift, colorClass: 'text-pink-500 bg-pink-50 dark:bg-[rgba(236,72,153,0.1)]' },
  SYSTEM: { icon: Bell, colorClass: 'text-[var(--color-text-secondary)] bg-[var(--color-bg-active)]' },
}

interface NotificationItemProps {
  id: string
  type: NotificationType
  message: string
  isRead: boolean
  createdAt: Date
  actor: {
    id: string
    username: string
    displayName: string
    avatarUrl: string | null
  }
  compact?: boolean
  onMarkAsRead?: (id: string) => void
}

export function NotificationItem({
  id,
  type,
  message,
  isRead,
  createdAt,
  actor,
  compact = false,
  onMarkAsRead,
}: NotificationItemProps) {
  const iconConfig = notificationIconMap[type] ?? notificationIconMap.SYSTEM
  const Icon = iconConfig.icon

  const handleClick = () => {
    if (!isRead && onMarkAsRead) {
      onMarkAsRead(id)
    }
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        'flex w-full items-start gap-3 rounded-lg text-left transition-colors',
        compact ? 'px-3 py-2.5' : 'px-4 py-3',
        !isRead
          ? 'bg-[var(--color-primary-light)] dark:bg-[rgba(45,136,255,0.08)]'
          : 'bg-transparent',
        'hover:bg-[var(--color-bg-hover)]'
      )}
    >
      {/* 읽지 않은 알림 표시 점 */}
      <div className="flex shrink-0 items-center pt-1">
        <span
          className={cn(
            'inline-block h-2 w-2 rounded-full',
            !isRead ? 'bg-[var(--color-primary)]' : 'bg-transparent'
          )}
        />
      </div>

      {/* 아바타 */}
      <div className="relative shrink-0">
        <Avatar
          src={actor.avatarUrl}
          name={actor.displayName}
          size="md"
        />
        <span
          className={cn(
            'absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full',
            iconConfig.colorClass
          )}
        >
          <Icon size={12} />
        </span>
      </div>

      {/* 알림 내용 */}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'text-[14px] leading-snug',
            compact ? 'line-clamp-2' : 'line-clamp-3',
            !isRead
              ? 'font-medium text-[var(--color-text-primary)]'
              : 'text-[var(--color-text-secondary)]'
          )}
        >
          <span className="font-semibold text-[var(--color-text-primary)]">
            {actor.displayName}
          </span>
          {'님이 '}
          {message}
        </p>
        <span
          className={cn(
            'mt-0.5 block text-[12px]',
            !isRead
              ? 'font-semibold text-[var(--color-primary)]'
              : 'text-[var(--color-text-secondary)]'
          )}
        >
          {formatRelativeTime(createdAt)}
        </span>
      </div>
    </button>
  )
}
