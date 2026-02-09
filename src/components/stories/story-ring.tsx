'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { StoryViewer } from './story-viewer'

interface StoryAuthor {
  id: string
  username: string
  displayName: string
  avatarUrl: string | null
  isOnline?: boolean
}

interface StoryItem {
  id: string
  mediaUrl: string
  mediaType: string
  caption: string | null
  backgroundColor: string | null
  viewCount: number
  expiresAt: Date
  createdAt: Date
  hasViewed: boolean
}

interface StoryGroup {
  author: StoryAuthor
  stories: StoryItem[]
  hasUnviewed: boolean
}

interface StoryRingProps {
  storyGroups: StoryGroup[]
  currentUserId?: string
  isLoading?: boolean
  onCreateStory?: () => void
}

export function StoryRing({
  storyGroups,
  currentUserId,
  isLoading = false,
  onCreateStory,
}: StoryRingProps) {
  const [viewerOpen, setViewerOpen] = useState(false)
  const [activeGroupIndex, setActiveGroupIndex] = useState(0)

  const handleStoryClick = (index: number) => {
    setActiveGroupIndex(index)
    setViewerOpen(true)
  }

  const handleViewerClose = () => {
    setViewerOpen(false)
  }

  const handleNavigateGroup = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && activeGroupIndex > 0) {
      setActiveGroupIndex((prev) => prev - 1)
    } else if (direction === 'next' && activeGroupIndex < storyGroups.length - 1) {
      setActiveGroupIndex((prev) => prev + 1)
    } else {
      setViewerOpen(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton className="h-14 w-14 rounded-full" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
      </Card>
    )
  }

  // 본인의 스토리 그룹이 있는지 확인
  const myStoryGroup = storyGroups.find((g) => g.author.id === currentUserId)
  // 본인 스토리를 제외한 나머지 그룹 (본인 스토리는 별도 처리)
  const otherGroups = storyGroups.filter((g) => g.author.id !== currentUserId)

  return (
    <>
      <Card className="p-4">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide">
          {/* 내 스토리 추가 버튼 */}
          <button
            onClick={() => {
              if (myStoryGroup && myStoryGroup.stories.length > 0) {
                // 본인 스토리가 있으면 스토리 뷰어 열기
                const idx = storyGroups.findIndex(
                  (g) => g.author.id === currentUserId
                )
                if (idx >= 0) handleStoryClick(idx)
              } else {
                onCreateStory?.()
              }
            }}
            className="flex flex-col items-center gap-1.5 min-w-[72px] group"
          >
            <div className="relative">
              <Avatar
                size="lg"
                name="나"
                src={myStoryGroup?.author.avatarUrl}
                className="opacity-90 group-hover:opacity-100 transition-opacity"
              />
              <div className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-primary)] border-2 border-[var(--color-bg-card)]">
                <Plus size={14} className="text-white" />
              </div>
            </div>
            <span className="text-[12px] text-[var(--color-text-secondary)] truncate w-full text-center">
              내 스토리
            </span>
          </button>

          {/* 친구 스토리 목록 */}
          {otherGroups.map((group) => {
            const globalIndex = storyGroups.findIndex(
              (g) => g.author.id === group.author.id
            )
            return (
              <button
                key={group.author.id}
                onClick={() => handleStoryClick(globalIndex)}
                className="flex flex-col items-center gap-1.5 min-w-[72px] group"
              >
                <div
                  className={cn(
                    'rounded-full p-[3px]',
                    group.hasUnviewed
                      ? 'bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]'
                      : 'bg-[var(--color-divider)]'
                  )}
                >
                  <div className="rounded-full border-[2px] border-[var(--color-bg-card)]">
                    <Avatar
                      size="lg"
                      name={group.author.displayName}
                      src={group.author.avatarUrl}
                      className="group-hover:opacity-90 transition-opacity"
                    />
                  </div>
                </div>
                <span className="text-[12px] text-[var(--color-text-primary)] truncate w-full text-center">
                  {group.author.displayName}
                </span>
              </button>
            )
          })}
        </div>
      </Card>

      {/* 스토리 뷰어 */}
      {viewerOpen && storyGroups.length > 0 && (
        <StoryViewer
          storyGroup={storyGroups[activeGroupIndex]}
          onClose={handleViewerClose}
          onPrevGroup={() => handleNavigateGroup('prev')}
          onNextGroup={() => handleNavigateGroup('next')}
          hasPrevGroup={activeGroupIndex > 0}
          hasNextGroup={activeGroupIndex < storyGroups.length - 1}
        />
      )}
    </>
  )
}
