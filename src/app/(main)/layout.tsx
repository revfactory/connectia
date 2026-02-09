import { TopNavigation } from '@/components/layout/top-navigation'
import { SidebarLeft } from '@/components/layout/sidebar-left'
import { SidebarRight } from '@/components/layout/sidebar-right'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-bg-page)]">
      <TopNavigation />
      <div className="flex justify-center">
        <SidebarLeft />
        <main className="w-full max-w-[680px] px-0 py-6 mx-4">
          {children}
        </main>
        <SidebarRight />
      </div>
    </div>
  )
}
