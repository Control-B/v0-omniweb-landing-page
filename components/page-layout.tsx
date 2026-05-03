import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

interface PageLayoutProps {
  children: React.ReactNode
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-hidden bg-[#050a12] text-white">
      <div className="pointer-events-none absolute inset-0 kling-canvas" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.32] kling-grid-overlay" />
      <Header />
      <main className="relative flex-1 pt-16">
        {children}
      </main>
      <Footer />
    </div>
  )
}
