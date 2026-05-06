export default function Loading() {
  return (
    <main className="min-h-dvh bg-[#050a12] px-4 py-24 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl animate-pulse space-y-10">
        <div className="mx-auto max-w-3xl space-y-5 text-center">
          <div className="mx-auto h-4 w-48 rounded-full bg-cyan-300/20" />
          <div className="mx-auto h-12 w-full max-w-2xl rounded-2xl bg-white/10" />
          <div className="mx-auto h-5 w-full max-w-xl rounded-full bg-white/8" />
          <div className="mx-auto h-5 w-full max-w-md rounded-full bg-white/8" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-6">
              <div className="h-12 w-12 rounded-2xl bg-cyan-300/15" />
              <div className="mt-6 h-6 w-2/3 rounded-full bg-white/10" />
              <div className="mt-4 h-4 w-full rounded-full bg-white/8" />
              <div className="mt-3 h-4 w-4/5 rounded-full bg-white/8" />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
