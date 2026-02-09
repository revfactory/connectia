'use client'

import { Camera } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'

interface ProfileCoverProps {
  coverImageUrl: string | null
  avatarUrl: string | null
  displayName: string
  isOwner: boolean
}

export function ProfileCover({ coverImageUrl, avatarUrl, displayName, isOwner }: ProfileCoverProps) {
  return (
    <div className="relative">
      {/* Cover Image */}
      <div className="h-[350px] max-w-[940px] mx-auto rounded-b-lg overflow-hidden bg-gradient-to-b from-[#E4E6EB] to-[#C0C2C5] dark:from-[#3A3B3C] dark:to-[#242526] relative group">
        {coverImageUrl && (
          <img src={coverImageUrl} alt="커버 이미지" className="w-full h-full object-cover" />
        )}
        {isOwner && (
          <button className="absolute bottom-4 right-4 flex items-center gap-2 bg-white/90 dark:bg-[#242526]/90 px-4 py-2 rounded-lg text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera size={16} />
            커버 사진 수정
          </button>
        )}
      </div>

      {/* Avatar */}
      <div className="max-w-[940px] mx-auto px-4 -mt-[40px] relative z-10">
        <div className="relative inline-block group">
          <div className="border-4 border-white dark:border-[#242526] rounded-full">
            <Avatar src={avatarUrl} name={displayName} size="xxl" />
          </div>
          {isOwner && (
            <button className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-bg-active)] border-2 border-white dark:border-[#242526] opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
