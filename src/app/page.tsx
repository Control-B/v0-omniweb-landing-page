const features = [
  {
    title: "AI-native workflows",
    description:
      "Ship pages, experiments, and campaigns with collaborative AI copilots that stay aligned with your brand system.",
  },
  {
    title: "Unified web command center",
    description:
      "See analytics, content updates, SEO health, and release status across every digital surface from one dashboard.",
  },
  {
    title: "Realtime team velocity",
    description:
      "Move from idea to launch with shared briefs, reusable blocks, and approvals that never block momentum.",
  },
];

const stats = [
  { value: "4.8x", label: "faster launch cycles" },
  { value: "92%", label: "fewer manual handoffs" },
  { value: "30+", label: "integrations connected" },
];

const pillars = [
  "Composable publishing for landing pages, docs, and lifecycle content",
  "Audience intelligence built from live product, CRM, and campaign signals",
  "Release automation with approvals, rollback safety, and observability",
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#1d4ed8_0%,#0b1020_28%,#050816_62%,#02030a_100%)] text-white">
      <section className="mx-auto flex w-full max-w-7xl flex-col px-6 pb-20 pt-6 sm:px-10 lg:px-12">
        <header className="mb-16 flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-400/20 text-sm font-semibold text-cyan-200 ring-1 ring-inset ring-cyan-300/30">
              OW
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.24em] text-white/90 uppercase">
                Omniweb
              </p>
              <p className="text-xs text-white/50">The AI operating system for web teams</p>
            </div>
          </div>
          <nav className="hidden gap-8 text-sm text-white/70 md:flex">
            <a href="#features" className="transition hover:text-white">
              Features
            </a>
            <a href="#proof" className="transition hover:text-white">
              Results
            </a>
            <a href="#contact" className="transition hover:text-white">
              Contact
            </a>
          </nav>
        </header>

        <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative">
            <div className="absolute -top-14 left-0 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
            <div className="absolute right-12 top-24 h-60 w-60 rounded-full bg-fuchsia-500/20 blur-3xl" />
            <div className="relative">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-cyan-300" />
                Launch sharper web experiences with one command center
              </div>
              <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl">
                Your entire web growth engine, orchestrated by AI.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70 sm:text-xl">
                Omniweb connects content, experimentation, analytics, and release automation so high-performing teams can build, learn, and ship without silos.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100"
                >
                  Book a live demo
                </a>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Explore the platform
                </a>
              </div>
              <div className="mt-12 grid gap-4 sm:grid-cols-3">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-md"
                  >
                    <p className="text-3xl font-semibold text-white">{stat.value}</p>
                    <p className="mt-2 text-sm text-white/60">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative lg:pl-6">
            <div className="absolute inset-0 rounded-[2rem] bg-linear-to-br from-cyan-400/20 via-transparent to-fuchsia-500/20 blur-2xl" />
            <div className="relative rounded-[2rem] border border-white/10 bg-white/8 p-5 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl">
              <div className="rounded-[1.5rem] border border-white/10 bg-[#071120] p-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <p className="text-sm font-medium text-white/60">Live workspace</p>
                    <p className="mt-1 text-lg font-semibold">Q2 launch command center</p>
                  </div>
                  <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
                    12 tasks shipping today
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl bg-white/5 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-white/50">Campaign brief</p>
                        <p className="mt-1 font-medium">AI drafted homepage refresh from product notes</p>
                      </div>
                      <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">
                        Ready for review
                      </span>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full w-[78%] rounded-full bg-linear-to-r from-cyan-300 to-blue-500" />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-sm text-white/50">Experimentation</p>
                      <p className="mt-2 text-2xl font-semibold">+18.4%</p>
                      <p className="mt-1 text-sm text-white/60">Conversion lift on AI-personalized hero variants</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-sm text-white/50">Release health</p>
                      <p className="mt-2 text-2xl font-semibold">99.98%</p>
                      <p className="mt-1 text-sm text-white/60">Uptime protected with instant rollback guards</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-linear-to-r from-white/8 to-transparent p-4">
                    <p className="text-sm text-white/50">Connected teams</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-sm text-white/80">
                      {['Marketing', 'Product', 'Design', 'RevOps', 'Growth Engineering'].map((team) => (
                        <span key={team} className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                          {team}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto w-full max-w-7xl px-6 py-8 sm:px-10 lg:px-12">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
            Built for operators
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Replace disconnected tools with one focused system.
          </h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 backdrop-blur-md transition hover:-translate-y-1 hover:bg-white/8"
            >
              <div className="mb-5 h-12 w-12 rounded-2xl bg-cyan-400/10 ring-1 ring-inset ring-cyan-300/20" />
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="mt-3 leading-7 text-white/65">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="proof" className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-20 sm:px-10 lg:grid-cols-[0.95fr_1.05fr] lg:px-12">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-md">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-fuchsia-200/80">
            Why teams switch
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight">
            Omniweb turns every release into a measurable growth loop.
          </h2>
          <div className="mt-8 space-y-5">
            {pillars.map((pillar) => (
              <div key={pillar} className="flex gap-4 rounded-2xl bg-black/20 p-4">
                <div className="mt-1 h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_20px_rgba(103,232,249,0.8)]" />
                <p className="text-white/72">{pillar}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-md">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
                Customer signal
              </p>
              <h3 className="mt-4 text-3xl font-semibold">“We shipped in days, not quarters.”</h3>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/65">
              Trusted by growth-led SaaS teams
            </span>
          </div>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
            Omniweb gave our team one shared operating layer across launches, localization, SEO, and experimentation. We cut planning overhead in half and finally had a live view of what moved revenue.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 font-semibold text-cyan-100">
              AL
            </div>
            <div>
              <p className="font-medium">Ava Lin</p>
              <p className="text-sm text-white/55">VP Growth, Northstar Cloud</p>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="mx-auto w-full max-w-7xl px-6 pb-24 sm:px-10 lg:px-12">
        <div className="rounded-[2.25rem] border border-cyan-300/20 bg-linear-to-r from-cyan-400/15 via-white/8 to-fuchsia-500/15 px-8 py-10 backdrop-blur-md sm:px-12 sm:py-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-100/80">
                Ready to launch faster?
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Bring product, marketing, and growth onto one intelligent web platform.
              </h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="mailto:hello@omniweb.ai"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100"
              >
                hello@omniweb.ai
              </a>
              <a
                href="https://cal.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Schedule a strategy call
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
