'use client'

import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
import { Check, CheckCheck } from 'lucide-react'

interface MessageBubbleProps {
  content: string | null
  isMine: boolean
  senderName: string
  senderAvatar?: string | null
  time: Date
  isRead?: boolean
  showAvatar?: boolean
  replyTo?: {
    id: string
    content: string | null
    sender: {
      id: string
      displayName: string
    }
  } | null
}

function formatTime(date: Date): string {
  const d = new Date(date)
  const hours = d.getHours().toString().padStart(2, '0')
  const minutes = d.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

export function MessageBubble({
  content,
  isMine,
  senderName,
  senderAvatar,
  time,
  isRead = false,
  showAvatar = true,
  replyTo,
}: MessageBubbleProps) {
  return (
    <div
      className={cn(
        'flex gap-2 px-4 py-0.5',
        isMine ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* 아바타 */}
      {!isMine && showAvatar ? (
        <div className="shrink-0 self-end">
          <Avatar
            src={senderAvatar}
            name={senderName}
            size="sm"
          />
        </div>
      ) : !isMine ? (
        <div className="w-8 shrink-0" />
      ) : null}

      {/* 메시지 버블 */}
      <div
        className={cn(
          'flex flex-col gap-0.5',
          isMine ? 'items-end' : 'items-start',
          'max-w-[70%]'
        )}
      >
        {/* 답글 미리보기 */}
        {replyTo && (
          <div
            className={cn(
              'rounded-lg px-3 py-1.5 text-[12px] border-l-2',
              isMine
                ? 'bg-[rgba(255,255,255,0.15)] border-white/40 text-white/80'
                : 'bg-[var(--color-bg-hover)] border-[var(--color-primary)] text-[var(--color-text-secondary)]'
            )}
          >
            <p className="font-semibold text-[11px]">
              {replyTo.sender.displayName}
            </p>
            <p className="line-clamp-1">
              {replyTo.content ?? '메시지'}
            </p>
          </div>
        )}

        {/* 버블 본체 */}
        <div
          className={cn(
            'rounded-2xl px-3 py-2 text-[15px] leading-relaxed break-words',
            isMine
              ? 'bg-[var(--color-primary)] text-white rounded-br-md'
              : 'bg-[var(--color-bg-active)] text-[var(--color-text-primary)] rounded-bl-md'
          )}
        >
          {content}
        </div>

        {/* 시간 + 읽음 상태 */}
        <div
          className={cn(
            'flex items-center gap-1 text-[11px] text-[var(--color-text-secondary)]',
            isMine ? 'flex-row-reverse' : 'flex-row'
          )}
        >
          <span>{formatTime(time)}</span>
          {isMine && (
            <span className="flex items-center">
              {isRead ? (
                <CheckCheck size={14} className="text-[var(--color-primary)]" />
              ) : (
                <Check size={14} />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
