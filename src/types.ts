/**
 * AI Engine 핵심 타입 정의
 *
 * Prisma 의존성 없이 독립적으로 사용할 수 있는 타입들입니다.
 * apps/web에서 Prisma 모델과 매핑하여 사용합니다.
 */

import type { LanguageModel, LanguageModelUsage, ModelMessage } from "ai"

// =============================================================================
// 기본 타입 (Enums)
// =============================================================================

export type ProviderType =
  | "openai"
  | "anthropic"
  | "google"
  | "ollama"
  | "deepseek"
  | "mistral"
  | "cohere"
  | "xai"
  | "zhipu"
  | "moonshot"
  | "openrouter"
  | "custom"

export type ProviderName =
  | "anthropic"
  | "openai"
  | "google"
  | "ollama"
  | "deepseek"
  | "mistral"
  | "cohere"
  | "xai"
  | "zhipu"
  | "moonshot"
  | "openrouter"

export type FeatureType =
  | "learning_analysis"
  | "counseling_suggest"
  | "report_generate"
  | "face_analysis"
  | "palm_analysis"
  | "personality_summary"
  | "saju_analysis"
  | "mbti_analysis"
  | "vark_analysis"
  | "name_analysis"
  | "zodiac_analysis"
  | "compatibility_analysis"
  | "general_chat"

export type AuthType = "none" | "api_key" | "bearer" | "custom_header"

export type CostTier = "free" | "low" | "medium" | "high"

export type QualityTier = "fast" | "balanced" | "premium"

export type Capability =
  | "vision"
  | "function_calling"
  | "json_mode"
  | "streaming"
  | "tools"

export type MatchMode = "auto_tag" | "specific_model"

export type FallbackMode = "next_priority" | "any_available" | "fail"

// =============================================================================
// Provider 관련 타입
// =============================================================================

export interface ProviderConfig {
  id: string
  name: string
  providerType: ProviderType
  baseUrl: string | null
  apiKeyEncrypted: string | null
  authType: AuthType
  customAuthHeader: string | null
  capabilities: Capability[]
  costTier: CostTier
  qualityTier: QualityTier
  isEnabled: boolean
  isValidated: boolean
  priority: number
  createdAt: Date
  updatedAt: Date
}

export interface ProviderInput {
  name: string
  providerType: ProviderType
  baseUrl?: string | null
  apiKey?: string | null
  authType: AuthType
  customAuthHeader?: string | null
  capabilities?: Capability[]
  costTier: CostTier
  qualityTier: QualityTier
  isEnabled?: boolean
}

// =============================================================================
// Model 관련 타입
// =============================================================================

export interface ModelConfig {
  id: string
  providerId: string
  modelId: string
  displayName: string
  contextWindow: number | null
  supportsVision: boolean
  supportsTools: boolean
  defaultParams: ModelParams | null
  isDefault: boolean
}

export interface ModelInput {
  providerId: string
  modelId: string
  displayName: string
  contextWindow?: number | null
  supportsVision?: boolean
  supportsTools?: boolean
  defaultParams?: ModelParams | null
  isDefault?: boolean
}

export interface ModelParams {
  temperature?: number
  maxOutputTokens?: number
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: number
  [key: string]: unknown
}

export interface ModelInfo {
  id: string
  modelId: string
  displayName: string
  contextWindow?: number
  supportsVision: boolean
  supportsTools: boolean
}

// =============================================================================
// 검증 및 레지스트리 타입
// =============================================================================

export interface ValidationResult {
  isValid: boolean
  error?: string
  details?: Record<string, unknown>
}

export interface ResolutionResult {
  provider: ProviderConfig
  model: ModelConfig
}

// =============================================================================
// 어댑터 관련 타입
// =============================================================================

export type { LanguageModel, LanguageModelUsage, ModelMessage }

export interface GenerateOptions {
  model: LanguageModel
  messages?: ModelMessage[]
  prompt?: string
  system?: string
  maxOutputTokens?: number
  temperature?: number
  topP?: number
  [key: string]: unknown
}

export interface GenerateResult {
  text: string
  usage: LanguageModelUsage
}

export interface StreamResult {
  stream: AsyncIterable<string>
  provider: string
  model: string
}

// =============================================================================
// 제공자 설정 및 비용 정보
// =============================================================================

export interface ProviderStaticConfig {
  name: ProviderName
  displayName: string
  requiresApiKey: boolean
  supportsVision: boolean
  defaultModel: string
  models: string[]
}

export const PROVIDER_CONFIGS: Record<ProviderName, ProviderStaticConfig> = {
  anthropic: {
    name: "anthropic",
    displayName: "Claude",
    requiresApiKey: true,
    supportsVision: true,
    defaultModel: "claude-sonnet-4-5",
    models: ["claude-sonnet-4-5", "claude-3-5-haiku-latest"],
  },
  openai: {
    name: "openai",
    displayName: "ChatGPT",
    requiresApiKey: true,
    supportsVision: true,
    defaultModel: "gpt-4o",
    models: ["gpt-4o", "gpt-4o-mini"],
  },
  google: {
    name: "google",
    displayName: "Gemini",
    requiresApiKey: true,
    supportsVision: true,
    defaultModel: "gemini-2.5-flash-preview-05-20",
    models: ["gemini-2.5-flash-preview-05-20", "gemini-2.0-flash"],
  },
  ollama: {
    name: "ollama",
    displayName: "Ollama",
    requiresApiKey: false,
    supportsVision: false,
    defaultModel: "llama3.2:3b",
    models: [],
  },
  deepseek: {
    name: "deepseek",
    displayName: "DeepSeek",
    requiresApiKey: true,
    supportsVision: false,
    defaultModel: "deepseek-chat",
    models: ["deepseek-chat", "deepseek-reasoner"],
  },
  mistral: {
    name: "mistral",
    displayName: "Mistral",
    requiresApiKey: true,
    supportsVision: false,
    defaultModel: "mistral-large-latest",
    models: ["mistral-large-latest", "mistral-small-latest", "codestral-latest"],
  },
  cohere: {
    name: "cohere",
    displayName: "Cohere",
    requiresApiKey: true,
    supportsVision: false,
    defaultModel: "command-r-plus",
    models: ["command-r-plus", "command-r"],
  },
  xai: {
    name: "xai",
    displayName: "Grok",
    requiresApiKey: true,
    supportsVision: true,
    defaultModel: "grok-3",
    models: ["grok-3", "grok-3-mini"],
  },
  zhipu: {
    name: "zhipu",
    displayName: "GLM (Z.ai)",
    requiresApiKey: true,
    supportsVision: true,
    defaultModel: "glm-4v-plus",
    models: ["glm-4v-plus", "glm-4-plus", "glm-4-flash"],
  },
  moonshot: {
    name: "moonshot",
    displayName: "Kimi",
    requiresApiKey: true,
    supportsVision: false,
    defaultModel: "kimi-k2.5-preview",
    models: ["kimi-k2.5-preview", "kimi-k2-preview", "moonshot-v1-128k"],
  },
  openrouter: {
    name: "openrouter",
    displayName: "OpenRouter",
    requiresApiKey: true,
    supportsVision: true,
    defaultModel: "openai/gpt-4o",
    models: [
      "openai/gpt-4o",
      "openai/gpt-4o-mini",
      "anthropic/claude-sonnet-4-5",
      "google/gemini-2.5-flash",
    ],
  },
}

export const COST_PER_MILLION_TOKENS: Record<
  ProviderName,
  { input: number; output: number }
> = {
  anthropic: { input: 3.0, output: 15.0 },
  openai: { input: 2.5, output: 10.0 },
  google: { input: 0.3, output: 2.5 },
  ollama: { input: 0, output: 0 },
  deepseek: { input: 0.27, output: 1.1 },
  mistral: { input: 2.0, output: 6.0 },
  cohere: { input: 2.5, output: 10.0 },
  xai: { input: 3.0, output: 15.0 },
  zhipu: { input: 0.35, output: 1.4 },
  moonshot: { input: 1.0, output: 4.0 },
  openrouter: { input: 2.5, output: 10.0 },
}

// =============================================================================
// Legacy 호환성 매핑
// =============================================================================

export const PROVIDER_NAME_TO_TYPE: Record<ProviderName, ProviderType> = {
  anthropic: "anthropic",
  openai: "openai",
  google: "google",
  ollama: "ollama",
  deepseek: "deepseek",
  mistral: "mistral",
  cohere: "cohere",
  xai: "xai",
  zhipu: "zhipu",
  moonshot: "moonshot",
  openrouter: "openrouter",
}

export function providerTypeToName(
  type: ProviderType
): ProviderName | null {
  const entries = Object.entries(PROVIDER_NAME_TO_TYPE) as [
    ProviderName,
    ProviderType,
  ][]
  const found = entries.find(([, t]) => t === type)
  return found ? found[0] : null
}

export function providerNameToType(name: ProviderName): ProviderType {
  return PROVIDER_NAME_TO_TYPE[name]
}
