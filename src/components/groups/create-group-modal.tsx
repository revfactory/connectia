'use client'

import { useState } from 'react'
import { Globe, Lock, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { trpc } from '@/lib/trpc'

interface CreateGroupModalProps {
  isOpen: boolean
  onClose: () => void
}

type Privacy = 'PUBLIC' | 'PRIVATE' | 'SECRET'

const privacyOptions: {
  value: Privacy
  label: string
  description: string
  icon: React.ElementType
}[] = [
  {
    value: 'PUBLIC',
    label: '공개',
    description: '누구나 그룹을 찾고 게시물을 볼 수 있습니다',
    icon: Globe,
  },
  {
    value: 'PRIVATE',
    label: '비공개',
    description: '누구나 그룹을 찾을 수 있지만, 멤버만 게시물을 볼 수 있습니다',
    icon: Lock,
  },
  {
    value: 'SECRET',
    label: '비밀',
    description: '멤버만 그룹을 찾고 게시물을 볼 수 있습니다',
    icon: EyeOff,
  },
]

export function CreateGroupModal({ isOpen, onClose }: CreateGroupModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [privacy, setPrivacy] = useState<Privacy>('PUBLIC')

  const utils = trpc.useUtils()

  const createMutation = trpc.group.createGroup.useMutation({
    onSuccess: () => {
      utils.group.getGroups.invalidate()
      utils.group.getMyGroups.invalidate()
      handleClose()
    },
  })

  const handleClose = () => {
    setName('')
    setDescription('')
    setPrivacy('PUBLIC')
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    createMutation.mutate({ name: name.trim(), description: description.trim() || undefined, privacy })
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="그룹 만들기">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 그룹 이름 */}
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[var(--color-text-secondary)]">
            그룹 이름
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="그룹 이름을 입력하세요"
            maxLength={100}
            required
          />
        </div>

        {/* 설명 */}
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[var(--color-text-secondary)]">
            설명 (선택)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="그룹에 대해 설명해주세요"
            maxLength={2000}
            rows={3}
            className="flex w-full rounded-md bg-[var(--color-bg-input)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:bg-[var(--color-bg-card)] transition-colors resize-none"
          />
        </div>

        {/* 공개 범위 */}
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[var(--color-text-secondary)]">
            공개 범위
          </label>
          <div className="space-y-2">
            {privacyOptions.map((option) => {
              const Icon = option.icon
              const isSelected = privacy === option.value
              return (
                <label
                  key={option.value}
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors',
                    isSelected
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] dark:bg-[rgba(45,136,255,0.1)]'
                      : 'border-[var(--color-divider)] hover:bg-[var(--color-bg-hover)]'
                  )}
                >
                  <input
                    type="radio"
                    name="privacy"
                    value={option.value}
                    checked={isSelected}
                    onChange={() => setPrivacy(option.value)}
                    className="sr-only"
                  />
                  <Icon
                    size={20}
                    className={cn(
                      'mt-0.5 shrink-0',
                      isSelected ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'
                    )}
                  />
                  <div>
                    <p
                      className={cn(
                        'text-[14px] font-medium',
                        isSelected ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-primary)]'
                      )}
                    >
                      {option.label}
                    </p>
                    <p className="text-[12px] text-[var(--color-text-secondary)]">
                      {option.description}
                    </p>
                  </div>
                </label>
              )
            })}
          </div>
        </div>

        {/* 에러 메시지 */}
        {createMutation.error && (
          <p className="text-[13px] text-[var(--color-error)]">
            {createMutation.error.message}
          </p>
        )}

        {/* 버튼 */}
        <Button
          type="submit"
          className="w-full"
          disabled={!name.trim() || createMutation.isPending}
        >
          {createMutation.isPending ? '만드는 중...' : '만들기'}
        </Button>
      </form>
    </Modal>
  )
}
