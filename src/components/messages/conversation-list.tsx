'use client'

import { useState } from 'react'
import { Search, SquarePen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { trpc } from '@/lib/trpc'
import { NewConversationModal } from './new-conversation-modal'

interface ConversationListProps {
  selectedId: string | null
  onSelect: (conversationId: string) => void
}

export function ConversationList({ selectedId, onSelect }: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)

  const { data: conversations, isLoading } =
    trpc.message.getConversations.useQuery(undefined, {
      refetchInterval: 30000,
    })

  const filteredConversations = conversations?.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleConversationCreated = (conversationId: string) => {
    onSelect(conversationId)
  }

  return (
    <div className="flex h-full flex-col">
      {/* 헤더 */}
      <div className="shrink-0 p-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[24px] font-bold text-[var(--color-text-primary)]">
            채팅
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsNewModalOpen(true)}
            title="새 대화"
          >
            <SquarePen size={20} />
          </Button>
        </div>

        {/* 검색 */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]"
          />
          <Input
            placeholder="대화 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 rounded-full"
          />
        </div>
      </div>

      {/* 대화 목록 */}
      <div className="flex-1 overflow-y-auto px-2">
        {isLoading ? (
          <div className="space-y-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-[60%]" />
                  <Skeleton className="h-3 w-[80%]" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <p className="text-[15px] text-[var(--color-text-secondary)] text-center">
              {searchQuery ? '검색 결과가 없습니다.' : '대화가 없습니다.'}
            </p>
            {!searchQuery && (
              <Button
                variant="ghost"
                className="mt-3"
                onClick={() => setIsNewModalOpen(true)}
              >
                새 대화 시작하기
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-0.5">
            {filteredConversations?.map((conv) => (
              <button
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg p-2 transition-colors',
                  selectedId === conv.id
                    ? 'bg-[var(--color-primary-light)] dark:bg-[rgba(45,136,255,0.1)]'
                    : 'hover:bg-[var(--color-bg-hover)]'
                )}
              >
                {/* 아바타 */}
                <div className="relative shrink-0">
                  <Avatar
                    src={conv.avatarUrl}
                    name={conv.name}
                    size="lg"
                    isOnline={conv.isOnline}
                  />
                </div>

                {/* 대화 정보 */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={cn(
                        'truncate text-[15px]',
                        conv.hasUnread
                          ? 'font-bold text-[var(--color-text-primary)]'
                          : 'font-medium text-[var(--color-text-primary)]'
                      )}
                    >
                      {conv.name}
                    </p>
                    <span className="shrink-0 text-[12px] text-[var(--color-text-secondary)]">
                      {formatRelativeTime(new Date(conv.lastMessageAt))}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <p
                      className={cn(
                        'truncate text-[13px]',
                        conv.hasUnread
                          ? 'font-semibold text-[var(--color-text-primary)]'
                          : 'text-[var(--color-text-secondary)]'
                      )}
                    >
                      {conv.lastMessage
                        ? `${conv.lastMessage.sender.displayName}: ${conv.lastMessage.content ?? '미디어'}`
                        : '대화를 시작해보세요'}
                    </p>
                    {conv.hasUnread && (
                      <span className="shrink-0 h-2.5 w-2.5 rounded-full bg-[var(--color-primary)]" />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 새 대화 모달 */}
      <NewConversationModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onConversationCreated={handleConversationCreated}
      />
    </div>
  )
}
