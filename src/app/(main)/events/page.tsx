'use client'

import { useState } from 'react'
import { Calendar, User, Plus, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EventCard } from '@/components/events/event-card'
import { CreateEventModal } from '@/components/events/create-event-modal'
import { trpc } from '@/lib/trpc'

type Tab = 'upcoming' | 'my'

const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'upcoming', label: '예정된 이벤트', icon: Calendar },
  { key: 'my', label: '내 이벤트', icon: User },
]

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('upcoming')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const upcomingQuery = trpc.event.getEvents.useQuery(
    { limit: 20, upcoming: true },
    { enabled: activeTab === 'upcoming' }
  )

  const myEventsQuery = trpc.event.getMyEvents.useQuery(
    { limit: 20 },
    { enabled: activeTab === 'my' }
  )

  const isLoading =
    (activeTab === 'upcoming' && upcomingQuery.isLoading) ||
    (activeTab === 'my' && myEventsQuery.isLoading)

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">
            이벤트
          </h1>
          <Button size="sm" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} className="mr-1" />
            이벤트 만들기
          </Button>
        </div>

        {/* 탭 */}
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
              </button>
            )
          })}
        </div>
      </Card>

      {/* 로딩 */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex gap-4 rounded-lg bg-[var(--color-bg-card)] p-4 shadow-[var(--shadow-card)]"
            >
              <div className="w-14 shrink-0 space-y-1">
                <Skeleton className="h-3 w-10 mx-auto" />
                <Skeleton className="h-7 w-8 mx-auto" />
              </div>
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-3 w-1/2" />
                <div className="flex gap-2 pt-1">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 예정된 이벤트 */}
      {activeTab === 'upcoming' && !isLoading && (
        <>
          {upcomingQuery.data?.events.length === 0 ? (
            <Card className="p-8 text-center">
              <Calendar size={48} className="mx-auto text-[var(--color-text-tertiary)]" />
              <p className="mt-3 text-[15px] text-[var(--color-text-secondary)]">
                예정된 이벤트가 없습니다.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {upcomingQuery.data?.events.map((event) => (
                <EventCard
                  key={event.id}
                  id={event.id}
                  name={event.name}
                  coverImageUrl={event.coverImageUrl}
                  startDate={event.startDate}
                  endDate={event.endDate}
                  location={event.location}
                  isOnline={event.isOnline}
                  attendeeCount={event.attendeeCount}
                  interestedCount={event.interestedCount}
                  hostName={event.host.displayName}
                  groupName={event.group?.name}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* 내 이벤트 */}
      {activeTab === 'my' && !isLoading && (
        <>
          {myEventsQuery.data?.events.length === 0 ? (
            <Card className="p-8 text-center">
              <Calendar size={48} className="mx-auto text-[var(--color-text-tertiary)]" />
              <p className="mt-3 text-[15px] text-[var(--color-text-secondary)]">
                참여 중인 이벤트가 없습니다.
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-3"
                onClick={() => setActiveTab('upcoming')}
              >
                이벤트 찾기
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {myEventsQuery.data?.events.map((event) => (
                <EventCard
                  key={event.id}
                  id={event.id}
                  name={event.name}
                  coverImageUrl={event.coverImageUrl}
                  startDate={event.startDate}
                  endDate={event.endDate}
                  location={event.location}
                  isOnline={event.isOnline}
                  attendeeCount={event.attendeeCount}
                  interestedCount={event.interestedCount}
                  myStatus={event.myStatus as 'GOING' | 'INTERESTED' | null}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* 이벤트 생성 모달 */}
      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  )
}
