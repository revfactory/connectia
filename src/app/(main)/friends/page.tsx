'use client'

import { useState } from 'react'
import { Users, UserPlus, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { FriendsList } from '@/components/friends/friends-list'
import { FriendRequestCard } from '@/components/friends/friend-request-card'
import { FriendSuggestionCard } from '@/components/friends/friend-suggestion-card'

type Tab = 'all' | 'requests' | 'suggestions'

// TODO: tRPC useQuery로 실제 데이터 연동
// const { data: pendingRequests } = trpc.friendship.getPendingRequests.useQuery()
const mockRequests = [
  { id: '1', name: '강하늘', avatarUrl: null, mutualFriendCount: 3 },
  { id: '2', name: '오수진', avatarUrl: null, mutualFriendCount: 7 },
]

const mockSuggestions = [
  { id: '3', name: '윤서준', avatarUrl: null, mutualFriendCount: 4 },
  { id: '4', name: '임채원', avatarUrl: null, mutualFriendCount: 2 },
  { id: '5', name: '송지호', avatarUrl: null, mutualFriendCount: 1 },
]

const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'all', label: '모든 친구', icon: Users },
  { key: 'requests', label: '친구 요청', icon: UserPlus },
  { key: 'suggestions', label: '추천 친구', icon: Sparkles },
]

export default function FriendsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('all')
  const pendingCount = mockRequests.length

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-4">
        <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">
          친구
        </h1>

        {/* Tabs */}
        <div className="mt-3 flex gap-1 border-t border-[var(--color-divider)] pt-3">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'relative flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-[15px] font-medium transition-colors',
                  isActive
                    ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] dark:bg-[rgba(45,136,255,0.1)]'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
                )}
              >
                <Icon size={20} />
                {tab.label}
                {tab.key === 'requests' && pendingCount > 0 && (
                  <span className="inline-flex min-w-[20px] items-center justify-center rounded-full bg-[var(--color-error)] px-1.5 text-[12px] font-bold text-white">
                    {pendingCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </Card>

      {/* Tab content */}
      {activeTab === 'all' && <FriendsList />}

      {activeTab === 'requests' && (
        <div className="space-y-4">
          {mockRequests.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-[15px] text-[var(--color-text-secondary)]">
                대기 중인 친구 요청이 없습니다.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {mockRequests.map((request) => (
                <FriendRequestCard
                  key={request.id}
                  id={request.id}
                  name={request.name}
                  avatarUrl={request.avatarUrl}
                  mutualFriendCount={request.mutualFriendCount}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'suggestions' && (
        <div className="space-y-4">
          {mockSuggestions.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-[15px] text-[var(--color-text-secondary)]">
                추천 친구가 없습니다.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {mockSuggestions.map((suggestion) => (
                <FriendSuggestionCard
                  key={suggestion.id}
                  id={suggestion.id}
                  name={suggestion.name}
                  avatarUrl={suggestion.avatarUrl}
                  mutualFriendCount={suggestion.mutualFriendCount}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
