export const fieldLabelMap: Record<string, string> = {
  name: "Name",
  email: "Email",
  phone: "Phone",
  company: "Company",
  goal: "Primary goal",
  timeline: "Timeline",
  budget: "Budget",
  location: "Location",
  vehicle: "Vehicle",
  serviceType: "Service type",
  productInterest: "Product interest",
  orderNumber: "Order number",
}

export const channelLabelMap: Record<string, string> = {
  website_chat: "Website chat",
  ai_voice_call: "Voice widget",
  ai_telephony: "Telephony",
  shopify_storefront: "Storefront",
}

export function getModeTone(key: string) {
  switch (key) {
    case "ecommerce":
      return "border-cyan-200 bg-cyan-50 text-cyan-800"
    case "roadside":
      return "border-amber-200 bg-amber-50 text-amber-900"
    case "service_business":
      return "border-emerald-200 bg-emerald-50 text-emerald-800"
    default:
      return "border-violet-200 bg-violet-50 text-violet-800"
  }
}
