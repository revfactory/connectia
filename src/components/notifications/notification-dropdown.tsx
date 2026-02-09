'use client'

import * as React from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { NotificationItem } from './notification-item'
import { useNotificationStore } from '@/hooks/use-notifications'
import { trpc } from '@/lib/trpc'

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const { unreadCount, setUnreadCount, decrementUnreadCount, resetUnreadCount } =
    useNotificationStore()

  // 읽지 않은 알림 수 조회
  const { data: unreadData } = trpc.notification.getUnreadCount.useQuery(undefined, {
    refetchInterval: 30000,
  })

  // 최근 알림 목록 (최대 5개)
  const { data, isLoading } = trpc.notification.getNotifications.useQuery(
    { limit: 5 },
    { enabled: isOpen }
  )

  const utils = trpc.useUtils()

  // 개별 읽음 처리
  const markAsReadMutation = trpc.notification.markAsRead.useMutation({
    onSuccess: () => {
      decrementUnreadCount()
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

  // unreadCount 동기화
  React.useEffect(() => {
    if (unreadData) {
      setUnreadCount(unreadData.count)
    }
  }, [unreadData, setUnreadCount])

  // 외부 클릭 시 닫기
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate({ notificationId })
  }

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate()
  }

  const notifications = data?.notifications ?? []

  return (
    <div ref={dropdownRef} className="relative">
      {/* Bell 아이콘 버튼 */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-bg-active)] hover:bg-[#D8DADF] dark:hover:bg-[#4E4F50] transition-colors"
      >
        <Bell size={20} />
        <Badge count={unreadCount} />
      </button>

      {/* 드롭다운 패널 */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[360px] max-h-[480px] overflow-hidden rounded-xl border border-[var(--color-divider)] bg-[var(--color-bg-card)] shadow-[0_12px_28px_0_rgba(0,0,0,0.15),0_2px_4px_0_rgba(0,0,0,0.1)]">
          {/* 헤더 */}
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <h3 className="text-[20px] font-bold text-[var(--color-text-primary)]">
              알림
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={markAllAsReadMutation.isPending}
                className="text-[14px] font-medium text-[var(--color-primary)] hover:underline disabled:opacity-50"
              >
                모두 읽음
              </button>
            )}
          </div>

          {/* 알림 목록 */}
          <div className="max-h-[380px] overflow-y-auto px-1">
            {isLoading ? (
              <div className="space-y-2 p-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3 px-3 py-2.5">
                    <Skeleton className="h-2 w-2 shrink-0 rounded-full" />
                    <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-bg-active)]">
                  <Bell size={24} className="text-[var(--color-text-secondary)]" />
                </div>
                <p className="mt-3 text-[15px] text-[var(--color-text-secondary)]">
                  알림이 없습니다
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  id={notification.id}
                  type={notification.type}
                  message={notification.message}
                  isRead={notification.isRead}
                  createdAt={notification.createdAt}
                  actor={notification.actor}
                  compact
                  onMarkAsRead={handleMarkAsRead}
                />
              ))
            )}
          </div>

          {/* 하단 링크 */}
          <div className="border-t border-[var(--color-divider)] p-2">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center rounded-lg py-2 text-[15px] font-medium text-[var(--color-primary)] hover:bg-[var(--color-bg-hover)] transition-colors"
            >
              모든 알림 보기
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
