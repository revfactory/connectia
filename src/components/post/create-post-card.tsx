'use client'

import { useState } from 'react'
import { Video, Image as ImageIcon, Smile } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { CreatePostModal } from './create-post-modal'

interface CreatePostCardProps {
  user?: {
    displayName: string
    avatarUrl?: string | null
  }
}

export function CreatePostCard({ user }: CreatePostCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const displayName = user?.displayName ?? '사용자'
  const avatarUrl = user?.avatarUrl ?? undefined

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <Avatar size="md" name={displayName} src={avatarUrl} />
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 h-10 rounded-full bg-[var(--color-bg-input)] px-4 text-left text-[17px] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors"
          >
            무슨 생각을 하고 계신가요?
          </button>
        </div>
        <div className="mt-3 border-t border-[var(--color-divider)] pt-3">
          <div className="flex">
            <button className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-[15px] font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors">
              <Video size={24} className="text-red-500" />
              라이브 방송
            </button>
            <button className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-[15px] font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors">
              <ImageIcon size={24} className="text-green-500" />
              사진/동영상
            </button>
            <button className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-[15px] font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors">
              <Smile size={24} className="text-yellow-500" />
              기분/활동
            </button>
          </div>
        </div>
      </Card>

      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={{ displayName, avatarUrl: avatarUrl ?? null }}
      />
    </>
  )
}
