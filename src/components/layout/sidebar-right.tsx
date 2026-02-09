'use client'

import { Gift, Search } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'

const MOCK_ONLINE_FRIENDS = [
  { id: '1', displayName: '박지수', username: 'jisoo_park', avatarUrl: null },
  { id: '2', displayName: '이현우', username: 'dev_hyunwoo', avatarUrl: null },
  { id: '3', displayName: '김소연', username: 'soyeon_kim', avatarUrl: null },
  { id: '4', displayName: '최준호', username: 'junho_choi', avatarUrl: null },
  { id: '5', displayName: '이유나', username: 'yuna_lee', avatarUrl: null },
]

export function SidebarRight() {
  return (
    <aside className="hidden xl:block sticky top-14 h-[calc(100vh-56px)] w-[280px] overflow-y-auto p-4">
      {/* 후원 광고 */}
      <div className="mb-4">
        <h3 className="text-[17px] font-semibold text-[var(--color-text-secondary)] mb-3">
          후원 광고
        </h3>
        <div className="rounded-lg overflow-hidden border border-[var(--color-divider)] cursor-pointer hover:opacity-90 transition-opacity">
          <div className="h-[120px] bg-gradient-to-br from-[var(--color-primary)] to-[#6366f1] flex items-center justify-center">
            <span className="text-white text-sm font-medium">광고 영역</span>
          </div>
          <div className="p-3 bg-[var(--color-bg-card)]">
            <p className="text-[13px] font-semibold text-[var(--color-text-primary)]">
              Connectia 프리미엄
            </p>
            <p className="text-[12px] text-[var(--color-text-secondary)] mt-0.5">
              더 많은 기능을 만나보세요
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--color-divider)] my-3" />

      {/* 생일 */}
      <div className="mb-4">
        <h3 className="text-[17px] font-semibold text-[var(--color-text-secondary)] mb-3">
          생일
        </h3>
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--color-bg-hover)] transition-colors cursor-pointer">
          <Gift size={36} className="text-[var(--color-primary)]" />
          <p className="text-[13px] text-[var(--color-text-primary)]">
            오늘 생일인 친구가 없습니다
          </p>
        </div>
      </div>

      <div className="border-t border-[var(--color-divider)] my-3" />

      {/* 연락처 / 온라인 친구 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[17px] font-semibold text-[var(--color-text-secondary)]">
            연락처
          </h3>
          <button className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[var(--color-bg-hover)] transition-colors">
            <Search size={16} className="text-[var(--color-text-secondary)]" />
          </button>
        </div>
        <div className="space-y-0.5">
          {MOCK_ONLINE_FRIENDS.map((friend) => (
            <button
              key={friend.id}
              className="flex w-full items-center gap-3 rounded-lg px-2 py-2 hover:bg-[var(--color-bg-hover)] transition-colors"
            >
              <div className="relative">
                <Avatar
                  size="sm"
                  name={friend.displayName}
                  src={friend.avatarUrl}
                />
                <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-[var(--color-bg-card)]" />
              </div>
              <span className="text-[14px] font-medium text-[var(--color-text-primary)]">
                {friend.displayName}
              </span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}
