import type { LanguageModel } from "ai"
import type {
  ProviderConfig,
  GenerateOptions,
  GenerateResult,
  StreamResult,
  ValidationResult,
  ModelInfo,
  ModelParams,
} from "../types.js"

export abstract class BaseAdapter {
  abstract readonly providerType: string
  abstract readonly supportsVision: boolean
  abstract readonly supportsStreaming: boolean
  abstract readonly supportsTools: boolean
  abstract readonly supportsJsonMode: boolean

  abstract createModel(modelId: string, config?: ProviderConfig): LanguageModel
  abstract generate(options: GenerateOptions): Promise<GenerateResult>
  abstract stream(options: GenerateOptions): Promise<StreamResult>
  abstract validate(config: ProviderConfig): Promise<ValidationResult>
  abstract listModels(config: ProviderConfig): Promise<ModelInfo[]>
  abstract normalizeParams(params?: ModelParams): Record<string, unknown>
  abstract setApiKey(apiKey: string): void
  abstract setBaseUrl(baseUrl: string): void
  protected abstract buildHeaders(config: ProviderConfig): Record<string, string>
  protected abstract getDefaultBaseUrl(): string

  protected buildUrl(config: ProviderConfig, endpoint: string): string {
    const baseUrl =
      config.baseUrl?.replace(/\/$/, "") || this.getDefaultBaseUrl()
    const cleanEndpoint = endpoint.startsWith("/")
      ? endpoint
      : `/${endpoint}`
    return `${baseUrl}${cleanEndpoint}`
  }

  protected handleError(error: unknown, context?: string): Error {
    const errorMessage =
      error instanceof Error ? error.message : String(error)
    const contextStr = context ? `[${context}] ` : ""
    return new Error(`${contextStr}${this.providerType}: ${errorMessage}`)
  }

  protected decryptApiKey(encrypted: string | null): string {
    if (!encrypted) return ""
    try {
      const { decryptApiKey } = require("../encryption.js")
      return decryptApiKey(encrypted)
    } catch {
      return ""
    }
  }
}
