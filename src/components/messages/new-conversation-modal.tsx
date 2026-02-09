'use client'

import { useState, useMemo } from 'react'
import { Search, X, Users, MessageSquarePlus } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc'

interface NewConversationModalProps {
  isOpen: boolean
  onClose: () => void
  onConversationCreated: (conversationId: string) => void
}

interface FriendUser {
  id: string
  username: string
  displayName: string
  avatarUrl: string | null
  isOnline: boolean
}

export function NewConversationModal({
  isOpen,
  onClose,
  onConversationCreated,
}: NewConversationModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<FriendUser[]>([])
  const [groupName, setGroupName] = useState('')

  const { data: friends, isLoading } = trpc.friendship.getFriends.useQuery(
    undefined,
    { enabled: isOpen }
  )

  const createConversation = trpc.message.createConversation.useMutation({
    onSuccess: (data) => {
      onConversationCreated(data.id)
      handleClose()
    },
  })

  const filteredFriends = useMemo(() => {
    if (!friends) return []
    return friends
      .map((f) => f.friend)
      .filter(
        (friend) =>
          friend.displayName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          friend.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
  }, [friends, searchQuery])

  const handleToggleUser = (user: FriendUser) => {
    setSelectedUsers((prev) => {
      const isSelected = prev.find((u) => u.id === user.id)
      if (isSelected) {
        return prev.filter((u) => u.id !== user.id)
      }
      return [...prev, user]
    })
  }

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId))
  }

  const handleSubmit = () => {
    if (selectedUsers.length === 0) return

    const isGroup = selectedUsers.length > 1

    createConversation.mutate({
      type: isGroup ? 'GROUP' : 'DIRECT',
      memberIds: selectedUsers.map((u) => u.id),
      name: isGroup ? groupName || undefined : undefined,
    })
  }

  const handleClose = () => {
    setSearchQuery('')
    setSelectedUsers([])
    setGroupName('')
    onClose()
  }

  const isGroup = selectedUsers.length > 1

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="새 대화">
      <div className="space-y-4">
        {/* 선택된 사용자 칩 */}
        {selectedUsers.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-1.5 rounded-full bg-[var(--color-primary-light)] dark:bg-[rgba(45,136,255,0.15)] px-3 py-1"
              >
                <Avatar src={user.avatarUrl} name={user.displayName} size="xs" />
                <span className="text-[13px] font-medium text-[var(--color-primary)]">
                  {user.displayName}
                </span>
                <button
                  onClick={() => handleRemoveUser(user.id)}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-[var(--color-primary)]/20 transition-colors"
                >
                  <X size={12} className="text-[var(--color-primary)]" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 그룹 이름 입력 (2명 이상 선택 시) */}
        {isGroup && (
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-text-secondary)]">
              <Users size={14} />
              그룹 이름
            </label>
            <Input
              placeholder="그룹 이름을 입력하세요 (선택)"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>
        )}

        {/* 친구 검색 */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]"
          />
          <Input
            placeholder="친구 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* 친구 목록 */}
        <div className="max-h-[300px] overflow-y-auto -mx-1 px-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-[14px] text-[var(--color-text-secondary)]">
                로딩 중...
              </p>
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-[14px] text-[var(--color-text-secondary)]">
                {searchQuery ? '검색 결과가 없습니다.' : '친구가 없습니다.'}
              </p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {filteredFriends.map((friend) => {
                const isSelected = selectedUsers.some(
                  (u) => u.id === friend.id
                )
                return (
                  <button
                    key={friend.id}
                    onClick={() => handleToggleUser(friend as FriendUser)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-colors',
                      isSelected
                        ? 'bg-[var(--color-primary-light)] dark:bg-[rgba(45,136,255,0.1)]'
                        : 'hover:bg-[var(--color-bg-hover)]'
                    )}
                  >
                    <Avatar
                      src={friend.avatarUrl}
                      name={friend.displayName}
                      size="md"
                      isOnline={friend.isOnline}
                    />
                    <div className="flex-1 text-left">
                      <p className="text-[15px] font-medium text-[var(--color-text-primary)]">
                        {friend.displayName}
                      </p>
                      <p className="text-[13px] text-[var(--color-text-secondary)]">
                        @{friend.username}
                      </p>
                    </div>
                    <div
                      className={cn(
                        'flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors',
                        isSelected
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]'
                          : 'border-[var(--color-divider)]'
                      )}
                    >
                      {isSelected && (
                        <svg
                          width="10"
                          height="8"
                          viewBox="0 0 10 8"
                          fill="none"
                        >
                          <path
                            d="M1 4L3.5 6.5L9 1"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* 대화 시작 버튼 */}
        <Button
          onClick={handleSubmit}
          disabled={selectedUsers.length === 0 || createConversation.isPending}
          className="w-full gap-2"
        >
          <MessageSquarePlus size={18} />
          {createConversation.isPending
            ? '생성 중...'
            : isGroup
              ? '그룹 대화 시작'
              : '대화 시작'}
        </Button>
      </div>
    </Modal>
  )
}
