'use client'

import Link from 'next/link'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'

interface FriendCardProps {
  username: string
  name: string
  avatarUrl?: string | null
  isOnline?: boolean
  mutualFriendCount: number
}

export function FriendCard({
  username,
  name,
  avatarUrl,
  isOnline,
  mutualFriendCount,
}: FriendCardProps) {
  return (
    <Link
      href={`/profile/${username}`}
      className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-[var(--color-bg-hover)]"
    >
      <Avatar src={avatarUrl} name={name} size="md" isOnline={isOnline} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold text-[var(--color-text-primary)]">
          {name}
        </p>
        {mutualFriendCount > 0 && (
          <p className="text-[13px] text-[var(--color-text-secondary)]">
            상호친구 {mutualFriendCount}명
          </p>
        )}
      </div>
      <Button
        variant="secondary"
        size="sm"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          // TODO: 메시지 페이지로 이동 또는 채팅 모달 열기
        }}
      >
        <MessageCircle size={16} className="mr-1" />
        메시지
      </Button>
    </Link>
  )
}
