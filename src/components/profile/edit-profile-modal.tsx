'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  currentProfile: {
    displayName: string
    bio: string | null
    location: string | null
    website: string | null
  }
}

export function EditProfileModal({ isOpen, onClose, currentProfile }: EditProfileModalProps) {
  const [form, setForm] = useState({
    displayName: currentProfile.displayName,
    bio: currentProfile.bio || '',
    location: currentProfile.location || '',
    website: currentProfile.website || '',
  })

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    // TODO: call tRPC mutation
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="프로필 수정">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1 block">이름</label>
          <Input
            value={form.displayName}
            onChange={(e) => updateField('displayName', e.target.value)}
            maxLength={50}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1 block">바이오</label>
          <textarea
            value={form.bio}
            onChange={(e) => updateField('bio', e.target.value)}
            maxLength={500}
            rows={3}
            className="flex w-full rounded-md bg-[var(--color-bg-input)] px-3 py-2 text-sm placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:bg-[var(--color-bg-card)] transition-colors resize-none"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1 block">위치</label>
          <Input
            value={form.location}
            onChange={(e) => updateField('location', e.target.value)}
            placeholder="도시, 국가"
            maxLength={100}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1 block">웹사이트</label>
          <Input
            value={form.website}
            onChange={(e) => updateField('website', e.target.value)}
            placeholder="https://"
            maxLength={200}
          />
        </div>
        <Button onClick={handleSave} className="w-full">
          저장
        </Button>
      </div>
    </Modal>
  )
}
