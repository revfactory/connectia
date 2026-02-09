'use client'

import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface FriendRequestCardProps {
  id: string
  name: string
  avatarUrl?: string | null
  mutualFriendCount: number
}

export function FriendRequestCard({
  id,
  name,
  avatarUrl,
  mutualFriendCount,
}: FriendRequestCardProps) {
  const handleAccept = () => {
    // TODO: trpc.friendship.acceptRequest.useMutation({ friendshipId: id })
  }

  const handleDecline = () => {
    // TODO: trpc.friendship.declineRequest.useMutation({ friendshipId: id })
  }

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <Avatar src={avatarUrl} name={name} size="md" />
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
      </div>
      <div className="mt-3 flex gap-2">
        <Button
          variant="default"
          size="sm"
          className="flex-1"
          onClick={handleAccept}
        >
          수락
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={handleDecline}
        >
          삭제
        </Button>
      </div>
    </Card>
  )
}
