'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Search,
  Users,
  FileText,
  Globe,
  X,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { cn, formatRelativeTime } from '@/lib/utils'
import { trpc } from '@/lib/trpc'

type SearchTab = 'all' | 'users' | 'posts'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('q') ?? ''

  const [query, setQuery] = useState(initialQuery)
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery)
  const [activeTab, setActiveTab] = useState<SearchTab>('all')

  // 디바운스 처리
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  // URL 업데이트
  useEffect(() => {
    if (debouncedQuery) {
      router.replace(`/search?q=${encodeURIComponent(debouncedQuery)}`, {
        scroll: false,
      })
    }
  }, [debouncedQuery, router])

  // tRPC 쿼리
  const searchAllQuery = trpc.search.searchAll.useQuery(
    { query: debouncedQuery, limit: 5 },
    { enabled: debouncedQuery.length > 0 && activeTab === 'all' }
  )

  const searchUsersQuery = trpc.search.searchUsers.useQuery(
    { query: debouncedQuery, limit: 20 },
    { enabled: debouncedQuery.length > 0 && activeTab === 'users' }
  )

  const searchPostsQuery = trpc.search.searchPosts.useQuery(
    { query: debouncedQuery, limit: 20 },
    { enabled: debouncedQuery.length > 0 && activeTab === 'posts' }
  )

  const isLoading =
    (activeTab === 'all' && searchAllQuery.isLoading) ||
    (activeTab === 'users' && searchUsersQuery.isLoading) ||
    (activeTab === 'posts' && searchPostsQuery.isLoading)

  const hasResults =
    (activeTab === 'all' &&
      searchAllQuery.data &&
      (searchAllQuery.data.users.length > 0 || searchAllQuery.data.posts.length > 0)) ||
    (activeTab === 'users' &&
      searchUsersQuery.data &&
      searchUsersQuery.data.users.length > 0) ||
    (activeTab === 'posts' &&
      searchPostsQuery.data &&
      searchPostsQuery.data.posts.length > 0)

  const tabs: { id: SearchTab; label: string; icon: typeof Search }[] = [
    { id: 'all', label: '전체', icon: Search },
    { id: 'users', label: '사용자', icon: Users },
    { id: 'posts', label: '게시물', icon: FileText },
  ]

  return (
    <div className="space-y-4">
      {/* 검색 입력 */}
      <Card className="p-4">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]"
            size={18}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="사용자, 게시물 검색..."
            className="h-11 w-full rounded-lg bg-[var(--color-bg-input)] pl-10 pr-10 text-[15px] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
            autoFocus
          />
          {query && (
            <button
              onClick={() => {
                setQuery('')
                setDebouncedQuery('')
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-bg-active)] hover:bg-[#D8DADF] dark:hover:bg-[#4E4F50] transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </Card>

      {/* 탭 */}
      <Card className="px-2 py-1">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 rounded-md px-4 py-2 text-[15px] font-medium transition-colors flex-1 justify-center',
                activeTab === tab.id
                  ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] dark:bg-[#263C5A]'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
              )}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>
      </Card>

      {/* 검색어가 없을 때 */}
      {!debouncedQuery && (
        <Card className="p-8 text-center">
          <Search size={48} className="mx-auto mb-3 text-[var(--color-text-tertiary)]" />
          <p className="text-[var(--color-text-secondary)] text-[15px]">
            검색어를 입력하여 사용자나 게시물을 찾아보세요
          </p>
        </Card>
      )}

      {/* 로딩 상태 */}
      {debouncedQuery && isLoading && <SearchSkeleton />}

      {/* 검색 결과 없음 */}
      {debouncedQuery && !isLoading && !hasResults && (
        <Card className="p-8 text-center">
          <Search size={48} className="mx-auto mb-3 text-[var(--color-text-tertiary)]" />
          <p className="text-[var(--color-text-primary)] text-[15px] font-semibold mb-1">
            &quot;{debouncedQuery}&quot;에 대한 검색 결과가 없습니다
          </p>
          <p className="text-[var(--color-text-secondary)] text-[13px]">
            다른 검색어를 입력하거나 철자를 확인해보세요
          </p>
        </Card>
      )}

      {/* 전체 탭 결과 */}
      {activeTab === 'all' && searchAllQuery.data && (
        <div className="space-y-4">
          {/* 사용자 결과 */}
          {searchAllQuery.data.users.length > 0 && (
            <Card>
              <div className="flex items-center justify-between px-4 pt-3 pb-2">
                <h3 className="text-[17px] font-bold">사용자</h3>
                <button
                  onClick={() => setActiveTab('users')}
                  className="text-[15px] text-[var(--color-primary)] hover:underline font-medium"
                >
                  더보기
                </button>
              </div>
              <div>
                {searchAllQuery.data.users.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
            </Card>
          )}

          {/* 게시물 결과 */}
          {searchAllQuery.data.posts.length > 0 && (
            <Card>
              <div className="flex items-center justify-between px-4 pt-3 pb-2">
                <h3 className="text-[17px] font-bold">게시물</h3>
                <button
                  onClick={() => setActiveTab('posts')}
                  className="text-[15px] text-[var(--color-primary)] hover:underline font-medium"
                >
                  더보기
                </button>
              </div>
              <div>
                {searchAllQuery.data.posts.map((post) => (
                  <PostSearchCard key={post.id} post={post} query={debouncedQuery} />
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* 사용자 탭 결과 */}
      {activeTab === 'users' && searchUsersQuery.data && (
        <Card>
          <div className="px-4 pt-3 pb-2">
            <h3 className="text-[17px] font-bold">사용자</h3>
          </div>
          <div>
            {searchUsersQuery.data.users.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        </Card>
      )}

      {/* 게시물 탭 결과 */}
      {activeTab === 'posts' && searchPostsQuery.data && (
        <Card>
          <div className="px-4 pt-3 pb-2">
            <h3 className="text-[17px] font-bold">게시물</h3>
          </div>
          <div>
            {searchPostsQuery.data.posts.map((post) => (
              <PostSearchCard key={post.id} post={post} query={debouncedQuery} />
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

/* --- 하위 컴포넌트 --- */

interface UserCardProps {
  user: {
    id: string
    username: string
    displayName: string
    avatarUrl: string | null
    bio?: string | null
    isVerified: boolean
    isOnline: boolean
  }
}

function UserCard({ user }: UserCardProps) {
  return (
    <Link
      href={`/profile/${user.username}`}
      className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-bg-hover)] transition-colors"
    >
      <Avatar
        size="md"
        name={user.displayName}
        src={user.avatarUrl}
        isOnline={user.isOnline}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-[15px] font-semibold truncate">
            {user.displayName}
          </span>
          {user.isVerified && (
            <svg className="h-4 w-4 text-[var(--color-primary)] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          )}
        </div>
        <span className="text-[13px] text-[var(--color-text-secondary)]">
          @{user.username}
        </span>
        {user.bio && (
          <p className="text-[13px] text-[var(--color-text-secondary)] truncate mt-0.5">
            {user.bio}
          </p>
        )}
      </div>
      <Button variant="secondary" size="sm">
        프로필 보기
      </Button>
    </Link>
  )
}

interface PostSearchCardProps {
  post: {
    id: string
    content?: string | null
    createdAt: Date
    author: {
      id: string
      username: string
      displayName: string
      avatarUrl: string | null
      isVerified: boolean
    }
    _count: {
      comments: number
      reactions: number
    }
  }
  query: string
}

function PostSearchCard({ post, query }: PostSearchCardProps) {
  // 검색어 하이라이팅
  const highlightText = (text: string, search: string) => {
    if (!search) return text
    const regex = new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-800/60 text-inherit rounded-sm px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  return (
    <div className="px-4 py-3 hover:bg-[var(--color-bg-hover)] transition-colors">
      {/* 작성자 정보 */}
      <div className="flex items-center gap-2 mb-2">
        <Avatar
          size="sm"
          name={post.author.displayName}
          src={post.author.avatarUrl}
        />
        <div className="flex items-center gap-1">
          <Link
            href={`/profile/${post.author.username}`}
            className="text-[13px] font-semibold hover:underline"
          >
            {post.author.displayName}
          </Link>
          {post.author.isVerified && (
            <svg className="h-3.5 w-3.5 text-[var(--color-primary)]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          )}
          <span className="text-[12px] text-[var(--color-text-secondary)]">
            &middot; {formatRelativeTime(new Date(post.createdAt))}
          </span>
        </div>
      </div>

      {/* 게시물 내용 */}
      {post.content && (
        <p className="text-[15px] leading-relaxed line-clamp-3 break-words">
          {highlightText(post.content, query)}
        </p>
      )}

      {/* 반응/댓글 수 */}
      <div className="flex items-center gap-3 mt-2 text-[13px] text-[var(--color-text-secondary)]">
        {post._count.reactions > 0 && (
          <span>반응 {post._count.reactions}개</span>
        )}
        {post._count.comments > 0 && (
          <span>댓글 {post._count.comments}개</span>
        )}
      </div>
    </div>
  )
}

function SearchSkeleton() {
  return (
    <Card>
      <div className="p-4 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
