'use client'

import * as React from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { NotificationItem } from '@/components/notifications/notification-item'
import { useNotificationStore } from '@/hooks/use-notifications'
import { trpc } from '@/lib/trpc'

type FilterTab = 'all' | 'unread'

const tabs: { key: FilterTab; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'unread', label: '읽지 않음' },
]

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = React.useState<FilterTab>('all')
  const { resetUnreadCount } = useNotificationStore()

  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = trpc.notification.getNotifications.useInfiniteQuery(
    { limit: 20, unreadOnly: activeTab === 'unread' },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  )

  const utils = trpc.useUtils()

  // 개별 읽음 처리
  const markAsReadMutation = trpc.notification.markAsRead.useMutation({
    onSuccess: () => {
      utils.notification.getNotifications.invalidate()
      utils.notification.getUnreadCount.invalidate()
    },
  })

  // 전체 읽음 처리
  const markAllAsReadMutation = trpc.notification.markAllAsRead.useMutation({
    onSuccess: () => {
      resetUnreadCount()
      utils.notification.getNotifications.invalidate()
      utils.notification.getUnreadCount.invalidate()
    },
  })

  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate({ notificationId })
  }

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate()
  }

  const notifications = data?.pages.flatMap((page) => page.notifications) ?? []

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">
            알림
          </h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={markAllAsReadMutation.isPending}
            className="gap-1.5"
          >
            <CheckCheck size={16} />
            모두 읽음 표시
          </Button>
        </div>

        {/* 필터 탭 */}
        <div className="mt-3 flex gap-1 border-t border-[var(--color-divider)] pt-3">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex flex-1 items-center justify-center rounded-lg py-2.5 text-[15px] font-medium transition-colors',
                  isActive
                    ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] dark:bg-[rgba(45,136,255,0.1)]'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
                )}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </Card>

      {/* 알림 목록 */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="space-y-1 p-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3">
                <Skeleton className="h-2 w-2 shrink-0 rounded-full" />
                <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-bg-active)]">
              <Bell size={32} className="text-[var(--color-text-secondary)]" />
            </div>
            <p className="mt-4 text-[17px] font-medium text-[var(--color-text-primary)]">
              {activeTab === 'unread'
                ? '읽지 않은 알림이 없습니다'
                : '알림이 없습니다'}
            </p>
            <p className="mt-1 text-[14px] text-[var(--color-text-secondary)]">
              {activeTab === 'unread'
                ? '모든 알림을 확인하셨습니다.'
                : '새로운 활동이 있으면 여기에 표시됩니다.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-divider)]">
            <div className="space-y-0.5 p-1">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  id={notification.id}
                  type={notification.type}
                  message={notification.message}
                  isRead={notification.isRead}
                  createdAt={notification.createdAt}
                  actor={notification.actor}
                  onMarkAsRead={handleMarkAsRead}
                />
              ))}
            </div>

            {/* 더 보기 버튼 */}
            {hasNextPage && (
              <div className="p-3">
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? '불러오는 중...' : '이전 알림 더 보기'}
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
