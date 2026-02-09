'use client'

import { useState, useMemo } from 'react'
import { Users, Search, Plus, Compass } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { GroupCard } from '@/components/groups/group-card'
import { CreateGroupModal } from '@/components/groups/create-group-modal'
import { trpc } from '@/lib/trpc'

type Tab = 'my' | 'discover'

const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'my', label: '내 그룹', icon: Users },
  { key: 'discover', label: '그룹 찾기', icon: Compass },
]

export default function GroupsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('my')
  const [search, setSearch] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const myGroupsQuery = trpc.group.getMyGroups.useQuery(
    { limit: 20 },
    { enabled: activeTab === 'my' }
  )

  const discoverQuery = trpc.group.getGroups.useQuery(
    { limit: 20, search: search || undefined },
    { enabled: activeTab === 'discover' }
  )

  const myGroupIds = useMemo(() => {
    if (!myGroupsQuery.data) return new Set<string>()
    return new Set(myGroupsQuery.data.groups.map((g) => g.id))
  }, [myGroupsQuery.data])

  const isLoading =
    (activeTab === 'my' && myGroupsQuery.isLoading) ||
    (activeTab === 'discover' && discoverQuery.isLoading)

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">
            그룹
          </h1>
          <Button size="sm" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} className="mr-1" />
            그룹 만들기
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

      {/* 검색 (그룹 찾기 탭에서만) */}
      {activeTab === 'discover' && (
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="그룹 검색..."
            className="pl-10"
          />
        </div>
      )}

      {/* 로딩 */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-lg bg-[var(--color-bg-card)] shadow-[var(--shadow-card)]">
              <Skeleton className="aspect-video w-full" />
              <div className="p-4 pt-8">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="mt-2 h-3 w-1/2" />
                <Skeleton className="mt-3 h-8 w-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 내 그룹 */}
      {activeTab === 'my' && !isLoading && (
        <>
          {myGroupsQuery.data?.groups.length === 0 ? (
            <Card className="p-8 text-center">
              <Users size={48} className="mx-auto text-[var(--color-text-tertiary)]" />
              <p className="mt-3 text-[15px] text-[var(--color-text-secondary)]">
                아직 가입한 그룹이 없습니다.
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-3"
                onClick={() => setActiveTab('discover')}
              >
                그룹 찾기
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {myGroupsQuery.data?.groups.map((group) => (
                <GroupCard
                  key={group.id}
                  id={group.id}
                  name={group.name}
                  coverImageUrl={group.coverImageUrl}
                  avatarUrl={group.avatarUrl}
                  memberCount={group.memberCount}
                  privacy={group.privacy}
                  isMember
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* 그룹 찾기 */}
      {activeTab === 'discover' && !isLoading && (
        <>
          {discoverQuery.data?.groups.length === 0 ? (
            <Card className="p-8 text-center">
              <Search size={48} className="mx-auto text-[var(--color-text-tertiary)]" />
              <p className="mt-3 text-[15px] text-[var(--color-text-secondary)]">
                {search ? '검색 결과가 없습니다.' : '아직 그룹이 없습니다.'}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {discoverQuery.data?.groups.map((group) => (
                <GroupCard
                  key={group.id}
                  id={group.id}
                  name={group.name}
                  coverImageUrl={group.coverImageUrl}
                  avatarUrl={group.avatarUrl}
                  memberCount={group.memberCount}
                  privacy={group.privacy}
                  isMember={myGroupIds.has(group.id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* 그룹 생성 모달 */}
      <CreateGroupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  )
}
