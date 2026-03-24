import { Header } from "@/components/header"
import { VideoHero } from "@/components/video-hero"
import { Footer } from "@/components/footer"
import { Chatbot } from "@/components/chatbot"

export default function Home() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <Header />
      <main className="flex flex-1 flex-col pt-16">
        <VideoHero />
      </main>
      <Footer />
      <Chatbot />
    </div>
  )
}
