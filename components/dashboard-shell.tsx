"use client"

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Loader2, Mic, ShoppingBag, Sparkles, UserRoundCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

type DashboardUser = {
  id: string
  email: string | null
  userMetadata: Record<string, unknown>
}

type OnboardingStep = {
  key: string
  label: string
  description: string
  href?: string | null
}

type OnboardingState = {
  tenant: {
    id: string
    name: string
    slug: string
    contact_email: string
    status: string
  }
  assistant_config: {
    assistant_name: string
    tone: string
    voice_enabled: boolean
  }
  business_profile: {
    business_name: string
    vertical: string
    website_url?: string | null
  }
  shopify_install_url?: string | null
  dashboard_path: string
  next_step: string
  suggested_steps: OnboardingStep[]
}

type ShopifyState = {
  connected: boolean
  shop_domain?: string | null
  next_step: string
  install_url?: string | null
  deployment?: {
    endpoints?: {
      shell_app_url?: string
      webhook_url?: string
      livekit_bootstrap_url?: string
    }
    shopify_cli?: {
      application_url?: string
      redirect_urls?: string[]
      webhook_uri?: string
    }
  }
  suggested_actions?: string[]
}

type LiveKitState = {
  configured: boolean
  livekitUrl?: string
  room?: string
  token?: string
  tenantSlug?: string | null
  error?: string
}

type SetupFormState = {
  business_name: string
  contact_name: string
  contact_email: string
  website_url: string
  shop_domain: string
  vertical: string
  assistant_name: string
  tone: string
  enable_voice: boolean
  enable_telephony: boolean
  notes: string
}

const verticalOptions = [
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'professional_services', label: 'Professional Services' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'automotive', label: 'Automotive' },
  { value: 'custom', label: 'Custom' },
]

function getString(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function prettifyEnum(value: string) {
  return value
    .split('_')
    .filter(Boolean)
    .map((segment) => segment[0]?.toUpperCase() + segment.slice(1))
    .join(' ')
}

export function DashboardShell({ user }: { user: DashboardUser }) {
  const defaultContactName = useMemo(() => {
    const firstName = getString(user.userMetadata.first_name)
    const lastName = getString(user.userMetadata.last_name)
    return `${firstName} ${lastName}`.trim()
  }, [user.userMetadata])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [liveKitLoading, setLiveKitLoading] = useState(false)
  const [onboarding, setOnboarding] = useState<OnboardingState | null>(null)
  const [shopify, setShopify] = useState<ShopifyState | null>(null)
  const [liveKit, setLiveKit] = useState<LiveKitState | null>(null)
  const [form, setForm] = useState<SetupFormState>({
    business_name: getString(user.userMetadata.company) || defaultContactName || 'My Omniweb Workspace',
    contact_name: defaultContactName,
    contact_email: user.email || '',
    website_url: '',
    shop_domain: '',
    vertical: 'ecommerce',
    assistant_name: getString(user.userMetadata.first_name)
      ? `${getString(user.userMetadata.first_name)}'s Assistant`
      : 'Omniweb Assistant',
    tone: 'professional',
    enable_voice: true,
    enable_telephony: false,
    notes: '',
  })

  const loadShopify = useCallback(async () => {
    const response = await fetch('/api/platform/shopify', { cache: 'no-store' })
    if (!response.ok) {
      if (response.status === 400 || response.status === 404) {
        setShopify(null)
        return
      }

      const payload = await response.json().catch(() => ({}))
      throw new Error(payload.detail || payload.error || 'Failed to load Shopify status')
    }

    setShopify(await response.json())
  }, [])

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const onboardingResponse = await fetch('/api/platform/onboarding', { cache: 'no-store' })

      if (onboardingResponse.status === 404) {
        setOnboarding(null)
        setShopify(null)
        setLiveKit(null)
        return
      }

      if (!onboardingResponse.ok) {
        const payload = await onboardingResponse.json().catch(() => ({}))
        throw new Error(payload.detail || payload.error || 'Failed to load onboarding state')
      }

      const onboardingPayload = (await onboardingResponse.json()) as OnboardingState
      setOnboarding(onboardingPayload)
      await loadShopify()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }, [loadShopify])

  useEffect(() => {
    void loadDashboard()
  }, [loadDashboard])

  async function handleProvisionWorkspace(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const response = await fetch('/api/platform/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          website_url: form.website_url || null,
          shop_domain: form.shop_domain || null,
          notes: form.notes || null,
        }),
      })

      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload.detail || payload.error || 'Failed to create workspace')
      }

      setOnboarding(payload)
      await loadShopify()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create workspace')
    } finally {
      setSaving(false)
    }
  }

  async function handleGenerateLiveKitToken() {
    setLiveKitLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/livekit/token', { cache: 'no-store' })
      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(payload.error || 'Failed to generate voice token')
      }

      setLiveKit(payload)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate voice token')
    } finally {
      setLiveKitLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
        Loading your Omniweb workspace...
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold">Omniweb Control Center</h2>
          <p className="text-muted-foreground">
            Tenant provisioning, Shopify onboarding, and voice testing all meet here.
          </p>
        </div>
        <form action="/auth/signout" method="post">
          <Button variant="outline" className="border-white/10">
            Sign out
          </Button>
        </form>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-card/50 p-5">
          <div className="mb-3 flex items-center gap-3">
            <UserRoundCheck className="h-5 w-5 text-cyan-400" />
            <h2 className="font-semibold">Auth Status</h2>
          </div>
          <p className="text-sm text-muted-foreground">Signed in as {user.email || 'authenticated user'}.</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-card/50 p-5">
          <div className="mb-3 flex items-center gap-3">
            <ShoppingBag className="h-5 w-5 text-cyan-400" />
            <h2 className="font-semibold">Shopify App</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {shopify?.connected
              ? `Connected to ${shopify.shop_domain ?? 'your store'}.`
              : onboarding
                ? 'Ready to install the Shopify app shell and storefront embed.'
                : 'Create a workspace first to generate install links.'}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-card/50 p-5">
          <div className="mb-3 flex items-center gap-3">
            <Mic className="h-5 w-5 text-cyan-400" />
            <h2 className="font-semibold">Voice Agent</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {liveKit?.configured
              ? `Token ready for room ${liveKit.room}.`
              : onboarding?.assistant_config.voice_enabled
                ? 'Generate a test token once your voice env vars are set.'
                : 'Voice is disabled for this workspace.'}
          </p>
        </div>
      </div>

      {!onboarding ? (
        <div className="rounded-3xl border border-white/10 bg-card/50 p-6 md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-cyan-400" />
            <div>
              <h2 className="text-xl font-semibold">Create your workspace</h2>
              <p className="text-sm text-muted-foreground">
                This provisions your tenant in the platform database and unlocks Shopify + voice setup.
              </p>
            </div>
          </div>

          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleProvisionWorkspace}>
            <label className="space-y-2 text-sm md:col-span-1">
              <span>Business name</span>
              <input
                value={form.business_name}
                onChange={(event) => setForm((current) => ({ ...current, business_name: event.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-background px-4 py-3"
                required
              />
            </label>
            <label className="space-y-2 text-sm md:col-span-1">
              <span>Contact name</span>
              <input
                value={form.contact_name}
                onChange={(event) => setForm((current) => ({ ...current, contact_name: event.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-background px-4 py-3"
              />
            </label>
            <label className="space-y-2 text-sm md:col-span-1">
              <span>Contact email</span>
              <input
                type="email"
                value={form.contact_email}
                onChange={(event) => setForm((current) => ({ ...current, contact_email: event.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-background px-4 py-3"
                required
              />
            </label>
            <label className="space-y-2 text-sm md:col-span-1">
              <span>Assistant name</span>
              <input
                value={form.assistant_name}
                onChange={(event) => setForm((current) => ({ ...current, assistant_name: event.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-background px-4 py-3"
              />
            </label>
            <label className="space-y-2 text-sm md:col-span-1">
              <span>Website URL</span>
              <input
                type="url"
                placeholder="https://example.com"
                value={form.website_url}
                onChange={(event) => setForm((current) => ({ ...current, website_url: event.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-background px-4 py-3"
              />
            </label>
            <label className="space-y-2 text-sm md:col-span-1">
              <span>Shopify shop domain</span>
              <input
                placeholder="your-store.myshopify.com"
                value={form.shop_domain}
                onChange={(event) => setForm((current) => ({ ...current, shop_domain: event.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-background px-4 py-3"
              />
            </label>
            <label className="space-y-2 text-sm md:col-span-1">
              <span>Vertical</span>
              <select
                value={form.vertical}
                onChange={(event) => setForm((current) => ({ ...current, vertical: event.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-background px-4 py-3"
              >
                {verticalOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm md:col-span-1">
              <span>Tone</span>
              <select
                value={form.tone}
                onChange={(event) => setForm((current) => ({ ...current, tone: event.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-background px-4 py-3"
              >
                <option value="professional">Professional</option>
                <option value="friendly">Friendly</option>
                <option value="consultative">Consultative</option>
              </select>
            </label>
            <label className="space-y-2 text-sm md:col-span-2">
              <span>Notes</span>
              <textarea
                value={form.notes}
                onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                className="min-h-28 w-full rounded-xl border border-white/10 bg-background px-4 py-3"
                placeholder="Anything the assistant should know about this tenant setup?"
              />
            </label>
            <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-background/40 px-4 py-3 text-sm">
              <input
                type="checkbox"
                checked={form.enable_voice}
                onChange={(event) => setForm((current) => ({ ...current, enable_voice: event.target.checked }))}
              />
              Enable voice setup
            </label>
            <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-background/40 px-4 py-3 text-sm">
              <input
                type="checkbox"
                checked={form.enable_telephony}
                onChange={(event) => setForm((current) => ({ ...current, enable_telephony: event.target.checked }))}
              />
              Enable telephony scaffolding
            </label>
            <div className="md:col-span-2">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={saving}>
                {saving ? 'Creating workspace...' : 'Provision workspace'}
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-card/50 p-6">
              <h2 className="text-xl font-semibold">Workspace status</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-background/40 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Tenant</p>
                  <p className="mt-2 text-lg font-semibold">{onboarding.tenant.name}</p>
                  <p className="text-sm text-muted-foreground">Slug: {onboarding.tenant.slug}</p>
                  <p className="text-sm text-muted-foreground">Status: {onboarding.tenant.status}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-background/40 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Assistant</p>
                  <p className="mt-2 text-lg font-semibold">{onboarding.assistant_config.assistant_name}</p>
                  <p className="text-sm text-muted-foreground">Tone: {onboarding.assistant_config.tone}</p>
                  <p className="text-sm text-muted-foreground">Voice: {onboarding.assistant_config.voice_enabled ? 'Enabled' : 'Disabled'}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-card/50 p-6">
              <h2 className="text-xl font-semibold">Next steps</h2>
              <div className="mt-4 space-y-3">
                {onboarding.suggested_steps.map((step) => (
                  <div key={step.key} className="rounded-2xl border border-white/10 bg-background/40 p-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-medium">{step.label}</p>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                      {step.href ? (
                        <Button variant="outline" className="border-white/10" asChild>
                          <a href={step.href} target={step.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                            Open
                          </a>
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-card/50 p-6">
              <h2 className="text-xl font-semibold">Shopify deployment</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {shopify?.connected
                  ? `Connected storefront: ${shopify.shop_domain ?? 'store connected'}`
                  : 'Use the install link to connect your Shopify store and activate the app shell.'}
              </p>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <p>Next step: {prettifyEnum(shopify?.next_step ?? onboarding.next_step)}</p>
                {shopify?.deployment?.shopify_cli?.application_url ? (
                  <p>CLI app URL: {shopify.deployment.shopify_cli.application_url}</p>
                ) : null}
                {shopify?.deployment?.shopify_cli?.webhook_uri ? (
                  <p>Webhook URL: {shopify.deployment.shopify_cli.webhook_uri}</p>
                ) : null}
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {shopify?.install_url || onboarding.shopify_install_url ? (
                  <Button className="bg-blue-600 hover:bg-blue-700" asChild>
                    <a href={shopify?.install_url || onboarding.shopify_install_url || '#'} target="_blank" rel="noreferrer">
                      Install Shopify app
                    </a>
                  </Button>
                ) : null}
                <Button variant="outline" className="border-white/10" asChild>
                  <Link href="/resources">Open docs</Link>
                </Button>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-card/50 p-6">
              <h2 className="text-xl font-semibold">Voice token test</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Generate a short-lived token for the current authenticated merchant and tenant room.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button variant="outline" className="border-white/10" onClick={handleGenerateLiveKitToken} disabled={liveKitLoading}>
                  {liveKitLoading ? 'Generating...' : 'Generate token'}
                </Button>
              </div>
              {liveKit ? (
                <div className="mt-4 rounded-2xl border border-white/10 bg-background/40 p-4 text-sm text-muted-foreground">
                  <p>Server URL: {liveKit.livekitUrl}</p>
                  <p>Room: {liveKit.room}</p>
                  <p>Tenant slug: {liveKit.tenantSlug || 'unassigned'}</p>
                  {liveKit.token ? <p>JWT preview: {liveKit.token.slice(0, 42)}...</p> : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
