'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Users,
  MessageCircle,
  Layers3,
  CalendarDays,
  Search,
  Bell,
  Settings,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'

// TODO: 실제 세션에서 사용자 정보를 가져오도록 변경
const MOCK_USER = {
  username: 'robin',
  displayName: '김로빈',
  avatarUrl: null,
  role: 'ADMIN' as const,
}

const menuItems = [
  { href: '/feed', icon: Home, label: '뉴스피드' },
  { href: '/friends', icon: Users, label: '친구' },
  { href: '/messages', icon: MessageCircle, label: '메시지' },
  { href: '/groups', icon: Layers3, label: '그룹' },
  { href: '/events', icon: CalendarDays, label: '이벤트' },
  { href: '/search', icon: Search, label: '검색' },
  { href: '/notifications', icon: Bell, label: '알림' },
  { href: '/settings', icon: Settings, label: '설정' },
]

export function SidebarLeft() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:block sticky top-14 h-[calc(100vh-56px)] w-[280px] overflow-y-auto p-2">
      {/* 프로필 바로가기 */}
      <Link
        href={`/profile/${MOCK_USER.username}`}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors',
          pathname.startsWith('/profile')
            ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] dark:bg-[#263c5a]'
            : 'hover:bg-[var(--color-bg-hover)]'
        )}
      >
        <Avatar size="sm" name={MOCK_USER.displayName} src={MOCK_USER.avatarUrl} />
        <span className="text-[15px] font-semibold">{MOCK_USER.displayName}</span>
      </Link>

      {/* 메뉴 항목 */}
      <nav className="mt-1 space-y-0.5">
        {menuItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex h-11 items-center gap-3 rounded-lg px-3 text-[15px] font-medium transition-colors',
                isActive
                  ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] dark:bg-[#263c5a]'
                  : 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]'
              )}
            >
              <item.icon
                size={28}
                className={cn(
                  isActive
                    ? 'text-[var(--color-primary)]'
                    : 'text-[var(--color-text-secondary)]'
                )}
              />
              {item.label}
            </Link>
          )
        })}

        {/* 관리자 메뉴 - role이 ADMIN인 경우에만 표시 */}
        {MOCK_USER.role === 'ADMIN' && (
          <Link
            href="/admin"
            className={cn(
              'flex h-11 items-center gap-3 rounded-lg px-3 text-[15px] font-medium transition-colors',
              pathname.startsWith('/admin')
                ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] dark:bg-[#263c5a]'
                : 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]'
            )}
          >
            <ShieldCheck
              size={28}
              className={cn(
                pathname.startsWith('/admin')
                  ? 'text-[var(--color-primary)]'
                  : 'text-[var(--color-text-secondary)]'
              )}
            />
            관리자
          </Link>
        )}
      </nav>
    </aside>
  )
}
