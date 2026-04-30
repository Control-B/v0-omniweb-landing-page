export function normalizeWebsiteDomain(input: string) {
  const trimmed = input.trim()
  if (!trimmed) return ""

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  const parsed = new URL(withProtocol)
  return parsed.hostname.replace(/^www\./i, "").toLowerCase()
}
