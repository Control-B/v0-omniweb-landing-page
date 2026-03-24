import { Header } from "@/components/header"
import { VideoHero } from "@/components/video-hero"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <Header />
      <main className="flex flex-1 flex-col pt-16">
        <VideoHero 
          videoUrl="https://drive.google.com/uc?export=download&id=1KEZKOYQGHURYeaj8nnP1mdofHr2ZGfpd"
        />
      </main>
      <Footer />
    </div>
  )
}
