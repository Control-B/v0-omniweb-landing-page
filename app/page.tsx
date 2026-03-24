import Link from "next/link"
import { Header } from "@/components/header"
import { VideoHero } from "@/components/video-hero"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <Header />
      <main className="flex flex-1 flex-col pt-16">
        <VideoHero />
      </main>
      <Footer />
      
      {/* Temporary admin link - remove after uploading video */}
      <Link 
        href="/admin" 
        className="fixed bottom-4 right-4 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-80"
      >
        Upload Video
      </Link>
    </div>
  )
}
