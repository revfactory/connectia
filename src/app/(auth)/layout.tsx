export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-page)]">
      <div className="w-full max-w-[980px] flex flex-col lg:flex-row items-center gap-10 p-6">
        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-[56px] font-bold text-[var(--color-primary)] leading-tight">Connectia</h1>
          <p className="text-2xl text-[var(--color-text-primary)] mt-4">
            Connectia에서 주변 사람들의 소식을 확인하세요.
          </p>
        </div>
        <div className="w-full max-w-[396px]">
          {children}
        </div>
      </div>
    </div>
  )
}
