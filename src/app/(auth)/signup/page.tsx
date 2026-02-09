'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function SignupPage() {
  const [form, setForm] = useState({
    displayName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="p-4 space-y-3">
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold">새 계정 만들기</h2>
        <p className="text-sm text-[var(--color-text-secondary)]">빠르고 쉽습니다.</p>
      </div>
      <div className="border-t border-[var(--color-divider)]" />
      <Input
        placeholder="이름"
        value={form.displayName}
        onChange={(e) => updateField('displayName', e.target.value)}
        className="h-11 rounded-md"
      />
      <Input
        placeholder="사용자 이름 (영문, 숫자, 언더스코어)"
        value={form.username}
        onChange={(e) => updateField('username', e.target.value)}
        className="h-11 rounded-md"
      />
      <Input
        type="email"
        placeholder="이메일 주소"
        value={form.email}
        onChange={(e) => updateField('email', e.target.value)}
        className="h-11 rounded-md"
      />
      <Input
        type="password"
        placeholder="새 비밀번호"
        value={form.password}
        onChange={(e) => updateField('password', e.target.value)}
        className="h-11 rounded-md"
      />
      <Input
        type="password"
        placeholder="비밀번호 확인"
        value={form.confirmPassword}
        onChange={(e) => updateField('confirmPassword', e.target.value)}
        className="h-11 rounded-md"
      />
      <p className="text-[11px] text-[var(--color-text-secondary)]">
        가입하기 버튼을 클릭하면 Connectia의 약관, 개인정보처리방침에 동의하게 됩니다.
      </p>
      <Button className="w-full h-10 text-lg font-bold bg-[var(--color-online)] hover:bg-[#2a9241]">
        가입하기
      </Button>
      <div className="text-center pt-2">
        <Link href="/login" className="text-[var(--color-primary)] text-sm hover:underline">
          이미 계정이 있으신가요?
        </Link>
      </div>
    </Card>
  )
}
