export type SubscriptionStatus = "trialing" | "active" | "expired" | "canceled"
export type PlanType = "starter" | "standard" | "business" | null

export type TenantRecord = {
  id: string
  clerkUserId: string
  clerkOrgId?: string | null
  businessName: string
  industry: string
  websiteDomain: string
  trialStartedAt: string | null
  trialEndsAt: string | null
  subscriptionStartedAt: string | null
  subscriptionEndsAt: string | null
  subscriptionStatus: SubscriptionStatus
  plan: PlanType
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  onboardingCompleted: boolean
  createdAt: string
  updatedAt: string
}

export type TenantBillingStatus = {
  plan: Exclude<PlanType, null>
  subscriptionStatus: SubscriptionStatus
  daysLeft: number | null
  isTrialActive: boolean
  isExpired: boolean
  canAccessFeatures: boolean
  renewalDate: string | null
  subscriptionStartedAt: string | null
  subscriptionEndsAt: string | null
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  conversationLimit: number
}

export type AgentTone = "professional"

export type AgentConfigRecord = {
  tenantId: string
  id?: string
  agentName: string
  welcomeMessage: string
  tone: AgentTone
  goals: string[]
  supportedLanguages?: string[]
  active: boolean
  businessName?: string
  businessType?: string | null
  industry?: string | null
  websiteDomain?: string | null
  bookingUrl?: string | null
  agentMode?: string
  enabledChannels?: string[]
  leadCaptureFields?: string[]
  enabledFeatures?: Record<string, boolean>
  qualificationRules?: {
    requiredFields?: string[]
    handoffTriggers?: string[]
    disqualifiers?: string[]
    conversionSignals?: string[]
  }
  customInstructions?: string | null
  knowledgeSources?: KnowledgeSourceRecord[]
  widgetSettings?: WidgetSettingsPreferences
  channelBehaviorProfiles?: Array<{
    key: string
    label: string
    channels: string[]
    description: string
    behaviorRules: string[]
  }>
  promptPreview?: string
  availableModes?: AgentModeRecord[]
  modeDefinition?: {
    key: string
    label: string
    description: string
    conversionObjective: string
    qualificationNotes: string[]
    conversionStages: string[]
  }
  createdAt: string
  updatedAt: string
}

export type KnowledgeSourceRecord = {
  id: string
  url: string
  details: string
  status: "indexing" | "ready"
  addedAt: string
}

export type WidgetSettingsPreferences = {
  allowedDomains?: string[]
  widgetPrimaryColor?: string
  widgetPosition?: "bottom-right" | "bottom-left"
}

export type AgentModeRecord = {
  key: string
  label: string
  description: string
  promptFocus: string
  conversionObjective: string
  defaultGoals: string[]
  defaultChannels: string[]
  defaultLeadCaptureFields: string[]
  defaultEnabledFeatures: Record<string, boolean>
  qualificationNotes: string[]
  conversionStages: string[]
}

export type AgentTemplateRecord = {
  id: string
  name: string
  description: string
  agentMode: string
  industry?: string
  config?: Partial<AgentConfigUpdatePayload>
}

export type AgentConfigUpdatePayload = Partial<{
  agentName: string
  welcomeMessage: string
  tone: AgentTone | string
  businessName: string
  businessType: string
  industry: string
  websiteDomain: string
  bookingUrl: string
  agentMode: string
  goals: string[]
  supportedLanguages: string[]
  enabledChannels: string[]
  leadCaptureFields: string[]
  enabledFeatures: Record<string, boolean>
  qualificationRules: {
    requiredFields?: string[]
    handoffTriggers?: string[]
    disqualifiers?: string[]
    conversionSignals?: string[]
  }
  channel: string
  customInstructions: string
  active: boolean
}>

export type AgentBuildPromptResponse = {
  agentMode: string
  channel: string
  channelBehaviorProfiles: Array<{
    key: string
    label: string
    channels: string[]
    description: string
    behaviorRules: string[]
  }>
  effectiveChannelProfile: {
    key: string
    label: string
    channels: string[]
    description: string
    behaviorRules: string[]
  }
  modeDefinition: {
    key: string
    label: string
    description: string
    conversionObjective: string
    conversionStages: string[]
  }
  promptPreview: string
}

export type AgentTestResponse = {
  input: string
  response: string
  agentMode: string
  channel: string
  effectiveChannelProfile: {
    key: string
    label: string
    channels: string[]
    description: string
    behaviorRules: string[]
  }
  conversionStage: string
  analyticsTags: {
    agentMode: string
    channel: string
    conversionStage: string
  }
  suggestedNextField: string | null
  promptPreview: string
}

export type TelephonyConfigRecord = {
  tenantId: string
  omniwebPhoneAgentId: string
  aiPhoneNumber: string
  escalationPhone: string
  escalationEmail: string
  escalationMessage: string
  createdAt: string
  updatedAt: string
}

export type WidgetSettingsRecord = {
  publicWidgetId: string
  embedCode: string
  scriptUrl: string
  allowedDomains: string[]
  widgetEnabled: boolean
  widgetInstalled: boolean
  widgetLastSeenAt: string | null
  widgetPrimaryColor: string
  widgetPosition: "bottom-right" | "bottom-left"
  widgetWelcomeMessage: string
  voiceEnabled: boolean
  businessName: string
  agentMode: string
}

export type WidgetSettingsUpdatePayload = Partial<{
  widgetEnabled: boolean
  allowedDomains: string[]
  widgetPrimaryColor: string
  widgetPosition: "bottom-right" | "bottom-left"
  widgetWelcomeMessage: string
  voiceEnabled: boolean
}>

export type EngagementChannel = "website_chat" | "ai_voice_call" | "ai_telephony" | "shopify_storefront"
export type EngagementLeadStatus = "new" | "qualified" | "needs_follow_up" | "not_qualified" | "resolved"
export type EngagementIntent = "product_question" | "pricing_question" | "service_inquiry" | "support_request" | "booking_request_quote" | "complaint" | "other"
export type EngagementSummarySource = "deepgram" | "mock" | "manual" | null

export type EngagementRecord = {
  id: string
  tenantId: string
  sessionId: string
  channel: EngagementChannel
  sourceUrl: string
  language: string
  visitorName: string | null
  visitorEmail: string | null
  visitorPhone: string | null
  leadStatus: EngagementLeadStatus
  intent: EngagementIntent
  contactCaptured: boolean
  qualified: boolean
  followUpNeeded: boolean
  summaryShort: string | null
  summaryFull: string | null
  transcript: string | null
  leadScore: number | null
  painPoints: string[]
  buyingSignals: string[]
  objections: string[]
  keyQuestions: string[]
  productsOrServices: string[]
  recommendedNextAction: string | null
  ownerNotes: string | null
  agentMode?: string | null
  conversionStage?: string | null
  metadata?: Record<string, unknown> | null
  messageCount: number
  summarySource: EngagementSummarySource
  summaryIsPlaceholder: boolean
  createdAt: string
  updatedAt: string
}

export type FollowUpChannel = "email" | "sms" | "voice_call" | "website_chat"
export type FollowUpTaskStatus = "pending" | "sent" | "failed" | "canceled"

export type FollowUpTaskRecord = {
  id: string
  tenantId: string
  engagementId: string
  instruction: string
  channel: FollowUpChannel
  status: FollowUpTaskStatus
  internalNote: string | null
  scheduledFor: string | null
  createdAt: string
  updatedAt: string
}

export type AnalyticsFilters = {
  dateFrom?: string | null
  dateTo?: string | null
  channel?: EngagementChannel | null
  leadStatus?: EngagementLeadStatus | null
  intent?: EngagementIntent | null
  followUpNeeded?: boolean | null
  contactCaptured?: boolean | null
  search?: string | null
}

export type AnalyticsSummaryMetrics = {
  totalConversations: number
  qualifiedLeads: number
  followUpNeeded: number
  contactInfoCaptured: number
  avgMessagesPerSession: number
  conversionRate: number
}

export type TenantStatus = {
  isSignedIn: boolean
  onboardingCompleted: boolean
  trialStartedAt: string | null
  trialEndsAt: string | null
  subscriptionStartedAt: string | null
  subscriptionEndsAt: string | null
  daysLeft: number | null
  subscriptionStatus: SubscriptionStatus | null
  canAccessDashboard: boolean
  canAccessFeatures: boolean
  isTrialActive: boolean
  isExpired: boolean
  shouldRedirectToOnboarding: boolean
  shouldRedirectToPricing: boolean
  plan: PlanType
  tenantId: string | null
  businessName: string | null
  industry: string | null
  websiteDomain: string | null
  clerkUserId: string | null
  email: string | null
  firstName: string | null
}

export type DashboardSnapshot = {
  status: TenantStatus
  tenant: TenantRecord | null
  billingStatus: TenantBillingStatus | null
  agentConfig: AgentConfigRecord | null
  telephonyConfig: TelephonyConfigRecord | null
  widgetEmbedCode: string | null
}
