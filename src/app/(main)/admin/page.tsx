'use client'

import * as React from 'react'
import {
  Users,
  UserPlus,
  FileText,
  AlertTriangle,
  Search,
  Shield,
  ShieldAlert,
  Loader2,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar } from '@/components/ui/avatar'
import { trpc } from '@/lib/trpc'

// ---------- 타입 ----------
type AdminTab = 'users' | 'reports'

const roleLabels: Record<string, string> = {
  USER: '사용자',
  MODERATOR: '운영자',
  ADMIN: '관리자',
}

const roleColors: Record<string, string> = {
  USER: 'text-[var(--color-text-secondary)]',
  MODERATOR: 'text-[var(--color-primary)]',
  ADMIN: 'text-[var(--color-error)]',
}

const reportStatusLabels: Record<string, string> = {
  PENDING: '대기',
  REVIEWED: '검토됨',
  RESOLVED: '해결됨',
  DISMISSED: '기각됨',
}

const reportStatusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  REVIEWED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  RESOLVED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  DISMISSED: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
}

const reportReasonLabels: Record<string, string> = {
  SPAM: '스팸',
  HARASSMENT: '괴롭힘',
  HATE_SPEECH: '혐오 발언',
  VIOLENCE: '폭력',
  NUDITY: '음란물',
  MISINFORMATION: '허위 정보',
  OTHER: '기타',
}

const reportTargetTypeLabels: Record<string, string> = {
  USER: '사용자',
  POST: '게시물',
  COMMENT: '댓글',
  MESSAGE: '메시지',
  GROUP: '그룹',
}

// ---------- 드롭다운 ----------
function Dropdown({
  value,
  onChange,
  options,
  disabled,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  disabled?: boolean
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          'h-8 appearance-none rounded-md bg-[var(--color-bg-input)] pl-3 pr-8 text-[13px] font-medium text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
      />
    </div>
  )
}

// ---------- 통계 카드 ----------
function StatCard({
  icon: Icon,
  label,
  value,
  color,
  isLoading,
}: {
  icon: React.ElementType
  label: string
  value: number
  color: string
  isLoading: boolean
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
            color
          )}
        >
          <Icon size={22} className="text-white" />
        </div>
        <div>
          {isLoading ? (
            <>
              <Skeleton className="h-6 w-16 mb-1" />
              <Skeleton className="h-3 w-20" />
            </>
          ) : (
            <>
              <p className="text-[22px] font-bold text-[var(--color-text-primary)] leading-tight">
                {value.toLocaleString()}
              </p>
              <p className="text-[13px] text-[var(--color-text-secondary)]">
                {label}
              </p>
            </>
          )}
        </div>
      </div>
    </Card>
  )
}

// ---------- 메인 ----------
export default function AdminPage() {
  const [activeTab, setActiveTab] = React.useState<AdminTab>('users')

  // 현재 유저 정보 조회 (ADMIN 권한 확인용)
  const { data: currentUser, isLoading: isUserLoading } = trpc.user.getMe.useQuery()

  // 권한 확인
  if (isUserLoading) {
    return (
      <div className="space-y-4">
        <Card className="p-4">
          <Skeleton className="h-8 w-48" />
        </Card>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-11 w-11 rounded-full" />
                <div>
                  <Skeleton className="h-6 w-16 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return (
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-error)]/10">
            <ShieldAlert size={32} className="text-[var(--color-error)]" />
          </div>
          <h2 className="mt-4 text-[18px] font-bold text-[var(--color-text-primary)]">
            접근 권한 없음
          </h2>
          <p className="mt-2 text-[14px] text-[var(--color-text-secondary)]">
            관리자 대시보드에 접근하려면 관리자 권한이 필요합니다.
          </p>
        </div>
      </Card>
    )
  }

  return <AdminDashboard activeTab={activeTab} setActiveTab={setActiveTab} />
}

function AdminDashboard({
  activeTab,
  setActiveTab,
}: {
  activeTab: AdminTab
  setActiveTab: (tab: AdminTab) => void
}) {
  const { data: stats, isLoading: statsLoading } =
    trpc.admin.getDashboardStats.useQuery()

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Shield size={24} className="text-[var(--color-primary)]" />
          <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">
            관리자 대시보드
          </h1>
        </div>
      </Card>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="총 사용자"
          value={stats?.totalUsers ?? 0}
          color="bg-[var(--color-primary)]"
          isLoading={statsLoading}
        />
        <StatCard
          icon={UserPlus}
          label="신규 가입 (7일)"
          value={stats?.newUsers ?? 0}
          color="bg-[var(--color-online)]"
          isLoading={statsLoading}
        />
        <StatCard
          icon={FileText}
          label="총 게시물"
          value={stats?.totalPosts ?? 0}
          color="bg-[#8B5CF6]"
          isLoading={statsLoading}
        />
        <StatCard
          icon={AlertTriangle}
          label="대기 중 신고"
          value={stats?.pendingReports ?? 0}
          color="bg-[var(--color-error)]"
          isLoading={statsLoading}
        />
      </div>

      {/* 탭 */}
      <Card className="p-0 overflow-hidden">
        <div className="flex border-b border-[var(--color-divider)]">
          <button
            onClick={() => setActiveTab('users')}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 py-3.5 text-[15px] font-medium transition-colors border-b-2',
              activeTab === 'users'
                ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'border-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
            )}
          >
            <Users size={18} />
            사용자 관리
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 py-3.5 text-[15px] font-medium transition-colors border-b-2',
              activeTab === 'reports'
                ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'border-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
            )}
          >
            <AlertTriangle size={18} />
            신고 관리
            {(stats?.pendingReports ?? 0) > 0 && (
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[var(--color-error)] text-white text-[11px] font-bold">
                {stats!.pendingReports}
              </span>
            )}
          </button>
        </div>

        <div className="p-4">
          {activeTab === 'users' && <UsersManagement />}
          {activeTab === 'reports' && <ReportsManagement />}
        </div>
      </Card>
    </div>
  )
}

// ---------- 사용자 관리 ----------
function UsersManagement() {
  const [search, setSearch] = React.useState('')
  const [roleFilter, setRoleFilter] = React.useState<string>('')
  const [debouncedSearch, setDebouncedSearch] = React.useState('')

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = trpc.admin.getUsers.useInfiniteQuery(
    {
      limit: 20,
      search: debouncedSearch || undefined,
      role: (roleFilter as 'USER' | 'MODERATOR' | 'ADMIN') || undefined,
    },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  )

  const utils = trpc.useUtils()

  const updateRoleMutation = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => {
      utils.admin.getUsers.invalidate()
      utils.admin.getDashboardStats.invalidate()
    },
  })

  const users = data?.pages.flatMap((page) => page.users) ?? []

  return (
    <div className="space-y-4">
      {/* 검색 & 필터 */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="사용자 검색 (이름, 아이디)..."
            className="pl-10"
          />
        </div>
        <Dropdown
          value={roleFilter}
          onChange={setRoleFilter}
          options={[
            { value: '', label: '모든 역할' },
            { value: 'USER', label: '사용자' },
            { value: 'MODERATOR', label: '운영자' },
            { value: 'ADMIN', label: '관리자' },
          ]}
        />
      </div>

      {/* 사용자 테이블 */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="py-12 text-center">
          <Users size={40} className="mx-auto text-[var(--color-text-tertiary)]" />
          <p className="mt-3 text-[15px] text-[var(--color-text-secondary)]">
            {search ? '검색 결과가 없습니다.' : '사용자가 없습니다.'}
          </p>
        </div>
      ) : (
        <>
          {/* 데스크톱 테이블 */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-divider)]">
                  <th className="py-3 px-3 text-left text-[13px] font-semibold text-[var(--color-text-secondary)]">
                    사용자
                  </th>
                  <th className="py-3 px-3 text-left text-[13px] font-semibold text-[var(--color-text-secondary)]">
                    이메일
                  </th>
                  <th className="py-3 px-3 text-left text-[13px] font-semibold text-[var(--color-text-secondary)]">
                    역할
                  </th>
                  <th className="py-3 px-3 text-left text-[13px] font-semibold text-[var(--color-text-secondary)]">
                    가입일
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-[var(--color-divider)] last:border-b-0 hover:bg-[var(--color-bg-hover)] transition-colors"
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={user.avatarUrl}
                          name={user.displayName}
                          size="sm"
                          isOnline={user.isOnline}
                        />
                        <div>
                          <p className="text-[14px] font-medium text-[var(--color-text-primary)]">
                            {user.displayName}
                          </p>
                          <p className="text-[12px] text-[var(--color-text-tertiary)]">
                            @{user.username}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <p className="text-[13px] text-[var(--color-text-secondary)]">
                        {user.email}
                      </p>
                    </td>
                    <td className="py-3 px-3">
                      <Dropdown
                        value={user.role}
                        onChange={(newRole) =>
                          updateRoleMutation.mutate({
                            userId: user.id,
                            role: newRole as 'USER' | 'MODERATOR' | 'ADMIN',
                          })
                        }
                        options={[
                          { value: 'USER', label: '사용자' },
                          { value: 'MODERATOR', label: '운영자' },
                          { value: 'ADMIN', label: '관리자' },
                        ]}
                        disabled={updateRoleMutation.isPending}
                      />
                    </td>
                    <td className="py-3 px-3">
                      <p className="text-[13px] text-[var(--color-text-secondary)]">
                        {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 모바일 리스트 */}
          <div className="sm:hidden space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="rounded-lg border border-[var(--color-divider)] p-3 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    src={user.avatarUrl}
                    name={user.displayName}
                    size="sm"
                    isOnline={user.isOnline}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-[var(--color-text-primary)] truncate">
                      {user.displayName}
                    </p>
                    <p className="text-[12px] text-[var(--color-text-tertiary)] truncate">
                      @{user.username} · {user.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[12px] text-[var(--color-text-tertiary)]">
                    {new Date(user.createdAt).toLocaleDateString('ko-KR')} 가입
                  </p>
                  <Dropdown
                    value={user.role}
                    onChange={(newRole) =>
                      updateRoleMutation.mutate({
                        userId: user.id,
                        role: newRole as 'USER' | 'MODERATOR' | 'ADMIN',
                      })
                    }
                    options={[
                      { value: 'USER', label: '사용자' },
                      { value: 'MODERATOR', label: '운영자' },
                      { value: 'ADMIN', label: '관리자' },
                    ]}
                    disabled={updateRoleMutation.isPending}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* 더 보기 */}
          {hasNextPage && (
            <div className="pt-2">
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    불러오는 중...
                  </>
                ) : (
                  '더 보기'
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ---------- 신고 관리 ----------
function ReportsManagement() {
  const [statusFilter, setStatusFilter] = React.useState<string>('')

  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = trpc.admin.getReports.useInfiniteQuery(
    {
      limit: 20,
      status: (statusFilter as 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED') || undefined,
    },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  )

  const utils = trpc.useUtils()

  const updateStatusMutation = trpc.admin.updateReportStatus.useMutation({
    onSuccess: () => {
      utils.admin.getReports.invalidate()
      utils.admin.getDashboardStats.invalidate()
    },
  })

  const reports = data?.pages.flatMap((page) => page.reports) ?? []

  return (
    <div className="space-y-4">
      {/* 필터 */}
      <div className="flex justify-end">
        <Dropdown
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: '', label: '모든 상태' },
            { value: 'PENDING', label: '대기' },
            { value: 'REVIEWED', label: '검토됨' },
            { value: 'RESOLVED', label: '해결됨' },
            { value: 'DISMISSED', label: '기각됨' },
          ]}
        />
      </div>

      {/* 신고 목록 */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-[var(--color-divider)] p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-3 w-full" />
              <div className="flex justify-between">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="py-12 text-center">
          <AlertTriangle size={40} className="mx-auto text-[var(--color-text-tertiary)]" />
          <p className="mt-3 text-[15px] text-[var(--color-text-secondary)]">
            {statusFilter ? '해당 상태의 신고가 없습니다.' : '신고가 없습니다.'}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className="rounded-lg border border-[var(--color-divider)] p-4 space-y-3 hover:bg-[var(--color-bg-hover)]/50 transition-colors"
              >
                {/* 신고자 & 대상 */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Avatar
                      src={report.reporter.avatarUrl}
                      name={report.reporter.displayName}
                      size="xs"
                    />
                    <div>
                      <p className="text-[13px] text-[var(--color-text-primary)]">
                        <span className="font-medium">
                          {report.reporter.displayName}
                        </span>
                        <span className="text-[var(--color-text-tertiary)]">
                          {' '}님이 신고
                        </span>
                      </p>
                      <p className="text-[12px] text-[var(--color-text-tertiary)]">
                        {new Date(report.createdAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-medium',
                      reportStatusColors[report.status]
                    )}
                  >
                    {reportStatusLabels[report.status]}
                  </span>
                </div>

                {/* 신고 상세 */}
                <div className="space-y-1.5 pl-9">
                  <div className="flex flex-wrap items-center gap-2 text-[13px]">
                    <span className="inline-flex items-center rounded bg-[var(--color-bg-active)] px-2 py-0.5 text-[12px] font-medium text-[var(--color-text-secondary)]">
                      {reportTargetTypeLabels[report.targetType] || report.targetType}
                    </span>
                    <span className={cn('font-medium', roleColors.MODERATOR)}>
                      {reportReasonLabels[report.reason] || report.reason}
                    </span>
                  </div>
                  {report.description && (
                    <p className="text-[13px] text-[var(--color-text-secondary)]">
                      {report.description}
                    </p>
                  )}
                  {report.reviewer && (
                    <p className="text-[12px] text-[var(--color-text-tertiary)]">
                      검토자: {report.reviewer.displayName}
                    </p>
                  )}
                </div>

                {/* 상태 변경 */}
                <div className="flex justify-end pl-9">
                  <Dropdown
                    value={report.status}
                    onChange={(newStatus) =>
                      updateStatusMutation.mutate({
                        reportId: report.id,
                        status: newStatus as
                          | 'PENDING'
                          | 'REVIEWED'
                          | 'RESOLVED'
                          | 'DISMISSED',
                      })
                    }
                    options={[
                      { value: 'PENDING', label: '대기' },
                      { value: 'REVIEWED', label: '검토됨' },
                      { value: 'RESOLVED', label: '해결됨' },
                      { value: 'DISMISSED', label: '기각됨' },
                    ]}
                    disabled={updateStatusMutation.isPending}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* 더 보기 */}
          {hasNextPage && (
            <div className="pt-2">
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    불러오는 중...
                  </>
                ) : (
                  '더 보기'
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
