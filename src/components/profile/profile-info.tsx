'use client'

import { Button } from '@/components/ui/button'
import { Pencil, UserPlus, MessageCircle, MoreHorizontal } from 'lucide-react'

interface ProfileInfoProps {
  displayName: string
  friendCount: number
  bio: string | null
  isOwner: boolean
}

export function ProfileInfo({ displayName, friendCount, bio, isOwner }: ProfileInfoProps) {
  return (
    <div className="max-w-[940px] mx-auto pt-4">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-[32px] font-extrabold leading-tight">{displayName}</h1>
          <p className="text-[15px] text-[var(--color-text-secondary)] mt-1">
            친구 {friendCount}명
          </p>
          {bio && (
            <p className="text-[15px] mt-2 max-w-[680px]">{bio}</p>
          )}
        </div>
        <div className="flex gap-2 mt-4 lg:mt-0">
          {isOwner ? (
            <Button variant="secondary">
              <Pencil size={16} className="mr-2" />
              프로필 수정
            </Button>
          ) : (
            <>
              <Button>
                <UserPlus size={16} className="mr-2" />
                친구 추가
              </Button>
              <Button variant="secondary">
                <MessageCircle size={16} className="mr-2" />
                메시지
              </Button>
              <Button variant="secondary" size="icon">
                <MoreHorizontal size={16} />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
