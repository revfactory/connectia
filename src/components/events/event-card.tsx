'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Users, Calendar, Wifi } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { trpc } from '@/lib/trpc'

interface EventCardProps {
  id: string
  name: string
  coverImageUrl?: string | null
  startDate: Date
  endDate?: Date | null
  location?: string | null
  isOnline: boolean
  attendeeCount: number
  interestedCount: number
  myStatus?: 'GOING' | 'INTERESTED' | 'NOT_GOING' | null
  hostName?: string
  groupName?: string | null
}

const MONTH_NAMES = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월',
]

export function EventCard({
  id,
  name,
  coverImageUrl,
  startDate,
  endDate,
  location,
  isOnline,
  attendeeCount,
  interestedCount,
  myStatus = null,
  hostName,
  groupName,
}: EventCardProps) {
  const [currentStatus, setCurrentStatus] = useState(myStatus)
  const utils = trpc.useUtils()

  const respondMutation = trpc.event.respondToEvent.useMutation({
    onSuccess: () => {
      utils.event.getEvents.invalidate()
      utils.event.getMyEvents.invalidate()
    },
  })

  const date = new Date(startDate)
  const month = MONTH_NAMES[date.getMonth()]
  const day = date.getDate()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')

  const handleRespond = (status: 'GOING' | 'INTERESTED', e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const newStatus = currentStatus === status ? 'NOT_GOING' : status
    setCurrentStatus(newStatus === 'NOT_GOING' ? null : newStatus)
    respondMutation.mutate({ eventId: id, status: newStatus })
  }

  return (
    <Link href={`/events?eventId=${id}`}>
      <div className="flex gap-4 overflow-hidden rounded-lg bg-[var(--color-bg-card)] p-4 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-dropdown)]">
        {/* 날짜 배지 */}
        <div className="flex w-14 shrink-0 flex-col items-center">
          <span className="text-[12px] font-bold uppercase text-[var(--color-error)]">
            {month}
          </span>
          <span className="text-[24px] font-bold leading-tight text-[var(--color-text-primary)]">
            {day}
          </span>
        </div>

        {/* 이벤트 정보 */}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-bold text-[var(--color-text-primary)]">
            {name}
          </h3>

          <p className="mt-0.5 text-[13px] text-[var(--color-text-secondary)]">
            {hours}:{minutes}
            {endDate && (
              <>
                {' ~ '}
                {new Date(endDate).getHours().toString().padStart(2, '0')}:
                {new Date(endDate).getMinutes().toString().padStart(2, '0')}
              </>
            )}
          </p>

          {(location || isOnline) && (
            <div className="mt-1 flex items-center gap-1 text-[13px] text-[var(--color-text-secondary)]">
              {isOnline ? (
                <>
                  <Wifi size={14} />
                  <span>온라인</span>
                </>
              ) : (
                <>
                  <MapPin size={14} />
                  <span className="truncate">{location}</span>
                </>
              )}
            </div>
          )}

          <div className="mt-1 flex items-center gap-1 text-[13px] text-[var(--color-text-secondary)]">
            <Users size={14} />
            <span>
              참석 {attendeeCount}명
              {interestedCount > 0 && ` · 관심 ${interestedCount}명`}
            </span>
          </div>

          {/* 응답 버튼 */}
          <div className="mt-3 flex gap-2">
            <Button
              variant={currentStatus === 'GOING' ? 'default' : 'secondary'}
              size="sm"
              onClick={(e) => handleRespond('GOING', e)}
              disabled={respondMutation.isPending}
            >
              {currentStatus === 'GOING' ? '참석 예정' : '참석'}
            </Button>
            <Button
              variant={currentStatus === 'INTERESTED' ? 'default' : 'secondary'}
              size="sm"
              onClick={(e) => handleRespond('INTERESTED', e)}
              disabled={respondMutation.isPending}
            >
              {currentStatus === 'INTERESTED' ? '관심 있음' : '관심'}
            </Button>
          </div>
        </div>

        {/* 커버 이미지 */}
        {coverImageUrl && (
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg">
            <Image
              src={coverImageUrl}
              alt={name}
              fill
              className="object-cover"
            />
          </div>
        )}
      </div>
    </Link>
  )
}
