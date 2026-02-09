'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ConversationList } from '@/components/messages/conversation-list'
import { ChatView } from '@/components/messages/chat-view'

export default function MessagesPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null)

  return (
    <div
      className="flex overflow-hidden rounded-lg bg-[var(--color-bg-card)] shadow-[var(--shadow-card)]"
      style={{ height: 'calc(100vh - 56px - 48px)' }}
    >
      {/* 좌측: 대화 목록 */}
      <div
        className={cn(
          'w-full border-r border-[var(--color-divider)] md:w-[360px] md:block',
          selectedConversationId ? 'hidden md:block' : 'block'
        )}
      >
        <ConversationList
          selectedId={selectedConversationId}
          onSelect={setSelectedConversationId}
        />
      </div>

      {/* 우측: 채팅 뷰 */}
      <div
        className={cn(
          'flex-1',
          selectedConversationId ? 'block' : 'hidden md:block'
        )}
      >
        <ChatView
          conversationId={selectedConversationId}
          onBack={() => setSelectedConversationId(null)}
        />
      </div>
    </div>
  )
}
