"use client"

import { useEffect, useMemo, useState } from "react"
import { Info } from "lucide-react"

import { knowledgeSourcesStorageKey } from "@/lib/saas/widgetEmbed"

type KnowledgeSource = {
  id: string
  url: string
  details: string
  status: "indexing" | "ready"
  addedAt: string
}

type KnowledgeSourcesPanelProps = {
  tenantId: string
  websiteDomain: string | null
}

function storageKey(tenantId: string) {
  return knowledgeSourcesStorageKey(tenantId)
}

function buildDefaultSource(websiteDomain: string | null): KnowledgeSource[] {
  if (!websiteDomain) {
    return []
  }

  return [
    {
      id: "default-source",
      url: `https://${String(websiteDomain).replace(/^https?:\/\//, "")}`,
      details: "",
      status: "indexing",
      addedAt: new Date().toISOString(),
    },
  ]
}

export function KnowledgeSourcesPanel({ tenantId, websiteDomain }: KnowledgeSourcesPanelProps) {
  const [knowledgeUrl, setKnowledgeUrl] = useState(websiteDomain ? String(websiteDomain).replace(/^https?:\/\//, "") : "")
  const [knowledgeDetails, setKnowledgeDetails] = useState("")
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>([])
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    try {
      const savedKnowledge = window.localStorage.getItem(storageKey(tenantId))
      if (savedKnowledge) {
        setKnowledgeSources(JSON.parse(savedKnowledge) as KnowledgeSource[])
        return
      }
    } catch {
      return
    }

    setKnowledgeSources(buildDefaultSource(websiteDomain))
  }, [tenantId, websiteDomain])

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    window.localStorage.setItem(storageKey(tenantId), JSON.stringify(knowledgeSources))
    window.dispatchEvent(new CustomEvent("omniweb:knowledge-sources-updated"))
  }, [tenantId, knowledgeSources])

  const hasUrl = knowledgeUrl.trim().length > 0
  const addDisabled = !hasUrl

  const sourceCountLabel = useMemo(() => String(knowledgeSources.length), [knowledgeSources.length])

  const showTemporaryMessage = (nextMessage: string) => {
    setMessage(nextMessage)
    window.setTimeout(() => setMessage(""), 2400)
  }

  const handleAddKnowledge = () => {
    const normalizedUrl = knowledgeUrl.trim()
    if (!normalizedUrl) {
      return
    }

    const next: KnowledgeSource = {
      id: String(Date.now()),
      url: normalizedUrl.startsWith("http://") || normalizedUrl.startsWith("https://") ? normalizedUrl : `https://${normalizedUrl}`,
      details: knowledgeDetails.trim(),
      status: "indexing",
      addedAt: new Date().toISOString(),
    }

    setKnowledgeSources((current) => [next, ...current])
    setKnowledgeUrl("")
    setKnowledgeDetails("")
    showTemporaryMessage("Knowledge source added.")

    window.setTimeout(() => {
      setKnowledgeSources((current) => current.map((item) => item.id === next.id ? { ...item, status: "ready" } : item))
    }, 1400)
  }

  const handleSaveKnowledgeDetails = (id: string, details: string) => {
    setKnowledgeSources((current) => current.map((item) => item.id === id ? { ...item, details } : item))
    showTemporaryMessage("Knowledge details saved.")
  }

  const handleRemoveKnowledge = (id: string) => {
    setKnowledgeSources((current) => current.filter((item) => item.id !== id))
    showTemporaryMessage("Knowledge source removed.")
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_360px]">
      <div className="space-y-5">
        <section className="rounded-[1.75rem] border border-white/70 bg-[linear-gradient(90deg,rgba(99,102,241,0.10),rgba(34,211,238,0.08),rgba(99,102,241,0.08))] p-6 shadow-[0_16px_35px_rgba(148,163,184,0.12)]">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Knowledge Sources</h2>
          <p className="mt-2 text-sm text-slate-600">Add URLs the AI agent should learn from — FAQ pages, policies, product pages, and more</p>
        </section>

        <section className="rounded-[1.75rem] border border-white/70 bg-white/80 p-5 shadow-[0_16px_35px_rgba(148,163,184,0.12)]">
          <p className="text-lg font-semibold text-slate-900">Add a knowledge URL</p>
          <p className="mt-1 text-sm text-slate-500">Paste a page URL, then add the extra product, service, policy, or brand details that may not be fully written on the page.</p>
          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Website or page URL</label>
              <div className="flex gap-3">
                <input
                  value={knowledgeUrl}
                  onChange={(event) => setKnowledgeUrl(event.target.value)}
                  placeholder="yourstore.com/pages/faq"
                  className="h-12 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 shadow-sm outline-none transition focus:border-[#4f46e5] focus:ring-4 focus:ring-[#4f46e5]/10"
                />
                <button
                  type="button"
                  onClick={handleAddKnowledge}
                  disabled={addDisabled}
                  className="h-12 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                >
                  Add URL
                </button>
              </div>
              <p className="mt-2 text-sm text-slate-500">The agent will crawl this page and index its content for answering shoppers.</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Extra details for this source</label>
              <textarea
                value={knowledgeDetails}
                onChange={(event) => setKnowledgeDetails(event.target.value)}
                rows={4}
                placeholder="Example: These products are best for sensitive skin. Mention the 30-day exchange policy. Recommend the starter bundle for first-time buyers."
                className="min-h-32 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-[#4f46e5] focus:ring-4 focus:ring-[#4f46e5]/10"
              />
              <p className="mt-2 text-sm text-slate-500">Add the details shoppers should hear even if they are not obvious on the URL. This becomes part of the AI agent&apos;s knowledge.</p>
            </div>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-white/70 bg-white/80 p-5 shadow-[0_16px_35px_rgba(148,163,184,0.12)]">
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold text-slate-900">Indexed sources</p>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{sourceCountLabel}</span>
          </div>

          {message ? (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>
          ) : null}

          <div className="mt-5 space-y-5">
            {knowledgeSources.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">No knowledge sources added yet.</p>
            ) : (
              knowledgeSources.map((source) => (
                <KnowledgeSourceCard
                  key={source.id}
                  source={source}
                  onRemove={() => handleRemoveKnowledge(source.id)}
                  onSaveDetails={(details) => handleSaveKnowledgeDetails(source.id, details)}
                />
              ))
            )}
          </div>
        </section>
      </div>

      <div className="space-y-5">
        <section className="rounded-[1.75rem] border border-white/70 bg-white/80 p-5 shadow-[0_16px_35px_rgba(148,163,184,0.12)]">
          <p className="text-lg font-semibold text-slate-900">What to add first</p>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-600">
            <p>Start with pages shoppers ask about most: FAQs, shipping, returns, product care, sizing, and warranty policies.</p>
            <p className="mt-3">Use public storefront URLs. Password-protected admin links cannot be indexed.</p>
            <p className="mt-3">Add subscriber details for product benefits, service rules, sales guidance, and answers that are missing from the page.</p>
          </div>
        </section>

        <section className="overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/80 shadow-[0_16px_35px_rgba(148,163,184,0.12)]">
          <div className="flex items-center gap-2 border-b border-sky-200 bg-sky-200/80 px-4 py-3 text-sm font-semibold text-sky-950">
            <Info className="h-4 w-4" />
            Tips for better answers
          </div>
          <div className="p-4 text-sm text-slate-700">
            <ul className="space-y-2">
              <li>Add one focused page per source.</li>
              <li>Write details like you are training a new sales associate.</li>
              <li>Keep policy pages updated before re-indexing.</li>
              <li>Add product pages for richer recommendations.</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}

type KnowledgeSourceCardProps = {
  source: KnowledgeSource
  onRemove: () => void
  onSaveDetails: (details: string) => void
}

function KnowledgeSourceCard({ source, onRemove, onSaveDetails }: KnowledgeSourceCardProps) {
  const [draft, setDraft] = useState(source.details)

  useEffect(() => {
    setDraft(source.details)
  }, [source.details])

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-semibold text-slate-900 break-all">{source.url}</p>
          <p className="mt-1 text-sm text-slate-500">Added {new Date(source.addedAt).toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${source.status === "ready" ? "bg-emerald-100 text-emerald-700" : "bg-sky-100 text-sky-700"}`}>
            {source.status === "ready" ? "Added" : "Added — indexing"}
          </span>
          <button type="button" onClick={onRemove} className="text-sm text-rose-500 transition hover:text-rose-600">Remove</button>
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-2 block text-sm font-medium text-slate-700">Subscriber details</label>
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={3}
          placeholder="Add product/service notes, recommendations, caveats, policies, and sales guidance for this URL."
          className="min-h-28 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-[#4f46e5] focus:ring-4 focus:ring-[#4f46e5]/10"
        />
      </div>

      <p className="mt-2 text-sm text-slate-500">Update this whenever the page needs extra context. Saving will re-sync this source.</p>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={() => onSaveDetails(draft)}
          className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Save details
        </button>
      </div>
    </div>
  )
}
