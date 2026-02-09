'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

const tabs = [
  { id: 'posts', label: '게시물' },
  { id: 'about', label: '소개' },
  { id: 'friends', label: '친구' },
  { id: 'photos', label: '사진' },
  { id: 'videos', label: '동영상' },
]

interface ProfileTabsProps {
  username: string
}

export function ProfileTabs({ username }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState('posts')

  return (
    <div className="max-w-[940px] mx-auto px-4">
      <div className="flex gap-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-4 text-[15px] font-semibold whitespace-nowrap rounded-t-lg transition-colors',
              activeTab === tab.id
                ? 'text-[var(--color-primary)] border-b-[3px] border-[var(--color-primary)]'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}
