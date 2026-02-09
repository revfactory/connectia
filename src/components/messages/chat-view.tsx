'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Phone,
  Video,
  Info,
  Plus,
  Smile,
  Send,
  ArrowLeft,
  MessageCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { MessageBubble } from './message-bubble'
import { trpc } from '@/lib/trpc'
import { useSocket, useSocketStore } from '@/hooks/use-socket'

interface ChatViewProps {
  conversationId: string | null
  onBack?: () => void
}

export function ChatView({ conversationId, onBack }: ChatViewProps) {
  const [messageText, setMessageText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { joinConversation, leaveConversation, sendMessage: socketSendMessage, startTyping, stopTyping, onNewMessage } = useSocket()
  const typingUsers = useSocketStore((s) => s.typingUsers)
  const utils = trpc.useUtils()

  const { data: me } = trpc.user.getMe.useQuery()

  const { data: conversationInfo } = trpc.message.getConversationInfo.useQuery(
    { conversationId: conversationId! },
    { enabled: !!conversationId }
  )

  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = trpc.message.getMessages.useInfiniteQuery(
    { conversationId: conversationId!, limit: 30 },
    {
      enabled: !!conversationId,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  )

  const sendMessageMutation = trpc.message.sendMessage.useMutation({
    onSuccess: (newMessage) => {
      // 낙관적 업데이트를 위해 캐시에 메시지 추가
      utils.message.getMessages.setInfiniteData(
        { conversationId: conversationId!, limit: 30 },
        (oldData) => {
          if (!oldData) return oldData
          const newPages = [...oldData.pages]
          newPages[0] = {
            ...newPages[0],
            messages: [newMessage, ...newPages[0].messages],
          }
          return { ...oldData, pages: newPages }
        }
      )

      // 대화 목록 갱신
      utils.message.getConversations.invalidate()

      // Socket.IO로 실시간 전송
      socketSendMessage({
        conversationId: conversationId!,
        message: {
          id: newMessage.id,
          content: newMessage.content,
          type: newMessage.type,
          senderId: newMessage.senderId,
          sender: newMessage.sender,
          createdAt: newMessage.createdAt,
          replyTo: newMessage.replyTo,
        },
      })
    },
  })

  const markAsReadMutation = trpc.message.markAsRead.useMutation({
    onSuccess: () => {
      utils.message.getConversations.invalidate()
    },
  })

  // 대화방 참여/퇴장
  useEffect(() => {
    if (conversationId) {
      joinConversation(conversationId)
      return () => {
        leaveConversation(conversationId)
      }
    }
  }, [conversationId, joinConversation, leaveConversation])

  // 실시간 메시지 수신
  useEffect(() => {
    const cleanup = onNewMessage((data) => {
      if (data.conversationId === conversationId) {
        utils.message.getMessages.invalidate({
          conversationId: conversationId!,
        })
        utils.message.getConversations.invalidate()
      }
    })
    return cleanup
  }, [conversationId, onNewMessage, utils])

  // 새 메시지 시 스크롤
  const allMessages = messagesData?.pages.flatMap((p) => p.messages) ?? []

  useEffect(() => {
    if (allMessages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [allMessages.length])

  // 읽음 처리
  useEffect(() => {
    if (conversationId && allMessages.length > 0) {
      const latestMessage = allMessages[0]
      markAsReadMutation.mutate({
        conversationId,
        messageId: latestMessage.id,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, allMessages[0]?.id])

  // 무한 스크롤
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current
    if (!container) return

    // flex-col-reverse이므로 scrollTop이 음수 방향으로 스크롤됨
    // 가장 위에 도달 시 이전 메시지 로드
    if (container.scrollTop === 0 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const handleSendMessage = () => {
    const trimmed = messageText.trim()
    if (!trimmed || !conversationId) return

    sendMessageMutation.mutate({
      conversationId,
      content: trimmed,
      type: 'TEXT',
    })

    setMessageText('')
    stopTyping(conversationId)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value)
    if (conversationId && e.target.value.trim()) {
      startTyping(conversationId, conversationInfo?.displayName ?? '')
    }
  }

  const currentTypingUsers = conversationId
    ? typingUsers.get(conversationId) ?? []
    : []

  // 빈 상태
  if (!conversationId) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-[var(--color-bg-page)]">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-bg-active)]">
          <MessageCircle
            size={40}
            className="text-[var(--color-text-secondary)]"
          />
        </div>
        <h3 className="mt-4 text-[20px] font-bold text-[var(--color-text-primary)]">
          내 메시지
        </h3>
        <p className="mt-1 text-[15px] text-[var(--color-text-secondary)]">
          대화를 선택해주세요
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-[var(--color-bg-card)]">
      {/* 헤더 */}
      <div className="flex shrink-0 items-center gap-3 border-b border-[var(--color-divider)] px-4 h-[60px]">
        {onBack && (
          <button
            onClick={onBack}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[var(--color-bg-hover)] transition-colors md:hidden"
          >
            <ArrowLeft size={20} />
          </button>
        )}

        <Avatar
          src={conversationInfo?.displayAvatar}
          name={conversationInfo?.displayName ?? ''}
          size="sm"
          isOnline={conversationInfo?.isOnline}
        />

        <div className="flex-1 min-w-0">
          <p className="truncate text-[15px] font-semibold text-[var(--color-text-primary)]">
            {conversationInfo?.displayName ?? '로딩 중...'}
          </p>
          <p className="text-[12px] text-[var(--color-text-secondary)]">
            {currentTypingUsers.length > 0
              ? `${currentTypingUsers.map((u) => u.displayName).join(', ')}님이 입력 중...`
              : conversationInfo?.isOnline
                ? '온라인'
                : '오프라인'}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" title="음성 통화">
            <Phone size={20} />
          </Button>
          <Button variant="ghost" size="icon" title="영상 통화">
            <Video size={20} />
          </Button>
          <Button variant="ghost" size="icon" title="대화 정보">
            <Info size={20} />
          </Button>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex flex-1 flex-col-reverse overflow-y-auto py-4"
      >
        <div ref={messagesEndRef} />

        {/* 타이핑 인디케이터 */}
        {currentTypingUsers.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-1">
            <div className="flex gap-1 rounded-2xl bg-[var(--color-bg-active)] px-4 py-3">
              <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--color-text-secondary)] [animation-delay:-0.3s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--color-text-secondary)] [animation-delay:-0.15s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--color-text-secondary)]" />
            </div>
          </div>
        )}

        {/* 메시지 목록 (역순 표시) */}
        {isLoadingMessages ? (
          <div className="space-y-4 px-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'flex gap-2',
                  i % 2 === 0 ? 'justify-start' : 'justify-end'
                )}
              >
                {i % 2 === 0 && (
                  <Skeleton className="h-8 w-8 rounded-full" />
                )}
                <Skeleton
                  className={cn(
                    'h-10 rounded-2xl',
                    i % 2 === 0 ? 'w-[45%]' : 'w-[35%]'
                  )}
                />
              </div>
            ))}
          </div>
        ) : (
          <>
            {allMessages.map((message, index) => {
              const isMine = message.senderId === me?.id
              // 이전 메시지와 같은 발신자인지 확인 (연속 메시지 시 아바타 숨김)
              const nextMessage = allMessages[index + 1]
              const showAvatar =
                !nextMessage || nextMessage.senderId !== message.senderId

              // readBy 기반 읽음 상태 (simplification)
              const readByArray = message.readBy as string[]
              const isRead = Array.isArray(readByArray) && readByArray.length > 0

              return (
                <MessageBubble
                  key={message.id}
                  content={message.content}
                  isMine={isMine}
                  senderName={message.sender.displayName}
                  senderAvatar={message.sender.avatarUrl}
                  time={message.createdAt}
                  isRead={isRead}
                  showAvatar={showAvatar}
                  replyTo={message.replyTo}
                />
              )
            })}

            {/* 이전 메시지 로딩 */}
            {isFetchingNextPage && (
              <div className="flex justify-center py-4">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
              </div>
            )}

            {hasNextPage && !isFetchingNextPage && (
              <button
                onClick={() => fetchNextPage()}
                className="mx-auto block py-3 text-[13px] text-[var(--color-primary)] hover:underline"
              >
                이전 메시지 불러오기
              </button>
            )}
          </>
        )}
      </div>

      {/* 메시지 입력 */}
      <div className="shrink-0 border-t border-[var(--color-divider)] p-3">
        <div className="flex items-center gap-2">
          <button
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--color-primary)] hover:bg-[var(--color-bg-hover)] transition-colors"
            title="파일 첨부"
          >
            <Plus size={20} />
          </button>

          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={messageText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="메시지를 입력하세요..."
              className="h-9 w-full rounded-full bg-[var(--color-bg-input)] px-4 pr-10 text-[15px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-colors"
            />
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full text-[var(--color-primary)] hover:bg-[var(--color-bg-hover)] transition-colors"
              title="이모지"
            >
              <Smile size={18} />
            </button>
          </div>

          <button
            onClick={handleSendMessage}
            disabled={!messageText.trim() || sendMessageMutation.isPending}
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors',
              messageText.trim()
                ? 'bg-[var(--color-primary)] text-white hover:bg-[#166FE5]'
                : 'text-[var(--color-text-secondary)]'
            )}
            title="전송"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
