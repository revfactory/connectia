'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { FriendCard } from '@/components/friends/friend-card'

// TODO: tRPC useQuery로 실제 데이터 연동
// const { data: friends } = trpc.friendship.getFriends.useQuery()
const mockFriends = [
  { username: 'kim_mj', name: '김민준', avatarUrl: null, isOnline: true, mutualFriendCount: 5 },
  { username: 'lee_sh', name: '이서현', avatarUrl: null, isOnline: false, mutualFriendCount: 3 },
  { username: 'park_jh', name: '박지훈', avatarUrl: null, isOnline: true, mutualFriendCount: 8 },
  { username: 'choi_ey', name: '최은영', avatarUrl: null, isOnline: false, mutualFriendCount: 2 },
  { username: 'jung_dw', name: '정도윤', avatarUrl: null, isOnline: true, mutualFriendCount: 0 },
  { username: 'han_sy', name: '한수연', avatarUrl: null, isOnline: false, mutualFriendCount: 12 },
]

export function FriendsList() {
  const [search, setSearch] = useState('')

  const filtered = mockFriends.filter((friend) =>
    friend.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]"
        />
        <Input
          placeholder="친구 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-[15px] text-[var(--color-text-secondary)]">
            {search
              ? `"${search}"에 대한 검색 결과가 없습니다.`
              : '아직 친구가 없습니다. 친구를 추가해보세요!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((friend) => (
            <FriendCard
              key={friend.username}
              username={friend.username}
              name={friend.name}
              avatarUrl={friend.avatarUrl}
              isOnline={friend.isOnline}
              mutualFriendCount={friend.mutualFriendCount}
            />
          ))}
        </div>
      )}
    </div>
  )
}
