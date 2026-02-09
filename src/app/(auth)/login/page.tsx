'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <Card className="p-4 space-y-4">
      <Input
        type="email"
        placeholder="이메일 주소"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="h-12 rounded-md text-[17px]"
      />
      <Input
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="h-12 rounded-md text-[17px]"
      />
      <Button className="w-full h-12 text-xl font-bold rounded-md">
        로그인
      </Button>
      <div className="text-center">
        <Link href="/forgot-password" className="text-[var(--color-primary)] text-sm hover:underline">
          비밀번호를 잊으셨나요?
        </Link>
      </div>
      <div className="border-t border-[var(--color-divider)] pt-4 text-center">
        <Link href="/signup">
          <Button variant="secondary" size="lg" className="bg-[var(--color-online)] text-white hover:bg-[#2a9241] font-bold px-4">
            새 계정 만들기
          </Button>
        </Link>
      </div>
    </Card>
  )
}
