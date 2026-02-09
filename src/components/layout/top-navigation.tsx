'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Users,
  Layers3,
  ShoppingBag,
  CalendarDays,
  MessageCircle,
  Bell,
  Search,
  Menu,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { NotificationDropdown } from '@/components/notifications/notification-dropdown'

const navItems = [
  { href: '/feed', icon: Home, label: '홈' },
  { href: '/friends', icon: Users, label: '친구' },
  { href: '/groups', icon: Layers3, label: '그룹' },
  { href: '/marketplace', icon: ShoppingBag, label: '마켓플레이스' },
  { href: '/events', icon: CalendarDays, label: '이벤트' },
]

export function TopNavigation() {
  const pathname = usePathname()
  const [searchFocused, setSearchFocused] = React.useState(false)

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center border-b border-[var(--color-divider)] bg-[var(--color-bg-card)] px-4 shadow-none transition-shadow hover:shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
      {/* Left */}
      <div className="flex items-center gap-2 min-w-[280px]">
        <Link href="/feed" className="text-[28px] font-bold text-[var(--color-primary)] tracking-tight">
          Connectia
        </Link>
        <div className={cn('relative transition-all duration-200', searchFocused ? 'w-[400px]' : 'w-[240px]')}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" size={16} />
          <input
            type="text"
            placeholder="Connectia 검색"
            className="h-10 w-full rounded-full bg-[var(--color-bg-input)] pl-10 pr-4 text-[15px] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>
      </div>

      {/* Center */}
      <nav className="hidden md:flex flex-1 justify-center gap-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex h-12 min-w-[110px] items-center justify-center rounded-lg transition-colors',
                isActive
                  ? 'text-[var(--color-primary)] border-b-[3px] border-[var(--color-primary)] rounded-b-none'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
              )}
              title={item.label}
            >
              <item.icon size={24} />
            </Link>
          )
        })}
      </nav>

      {/* Right */}
      <div className="flex items-center gap-2 min-w-[280px] justify-end">
        <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-bg-active)] hover:bg-[#D8DADF] dark:hover:bg-[#4E4F50] transition-colors">
          <Menu size={20} className="md:hidden" />
          <MessageCircle size={20} className="hidden md:block" />
          <Badge count={0} />
        </button>
        <NotificationDropdown />
        <button className="flex h-9 w-9 items-center justify-center">
          <Avatar size="sm" name="사용자" />
        </button>
      </div>
    </header>
  )
}
