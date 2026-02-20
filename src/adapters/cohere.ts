import { createCohere } from "@ai-sdk/cohere"
import { generateText, streamText, type LanguageModel } from "ai"
import { BaseAdapter } from "./base.js"
import type {
  ProviderConfig,
  GenerateOptions,
  GenerateResult,
  StreamResult,
  ValidationResult,
  ModelInfo,
  ModelParams,
} from "../types.js"

export class CohereAdapter extends BaseAdapter {
  readonly providerType = "cohere"
  readonly supportsVision = false
  readonly supportsStreaming = true
  readonly supportsTools = true
  readonly supportsJsonMode = false

  private apiKey: string = ""
  private baseUrl: string = "https://api.cohere.com/v1"

  createModel(modelId: string, config?: ProviderConfig): LanguageModel {
    const effectiveConfig = config || ({} as ProviderConfig)
    const effectiveApiKey = effectiveConfig.apiKeyEncrypted
      ? this.decryptApiKey(effectiveConfig.apiKeyEncrypted)
      : this.apiKey
    return createCohere({ apiKey: effectiveApiKey })(modelId) as unknown as LanguageModel
  }

  async generate(options: GenerateOptions): Promise<GenerateResult> {
    const result = await generateText({
      model: options.model,
      ...(options.messages ? { messages: options.messages } : { prompt: options.prompt || "" }),
      system: options.system, maxOutputTokens: options.maxOutputTokens, temperature: options.temperature, topP: options.topP,
    })
    return { text: result.text, usage: result.usage }
  }

  async stream(options: GenerateOptions): Promise<StreamResult> {
    const result = streamText({
      model: options.model,
      ...(options.messages ? { messages: options.messages } : { prompt: options.prompt || "" }),
      system: options.system, maxOutputTokens: options.maxOutputTokens, temperature: options.temperature, topP: options.topP,
    })
    return { stream: result.textStream, provider: this.providerType, model: "unknown" }
  }

  async validate(config: ProviderConfig): Promise<ValidationResult> {
    try {
      const apiKey = config.apiKeyEncrypted ? this.decryptApiKey(config.apiKeyEncrypted) : this.apiKey
      if (!apiKey) return { isValid: false, error: "API 키가 설정되지 않았습니다." }
      const testModel = this.createModel("command-r", config)
      await generateText({ model: testModel, prompt: "Hello", maxOutputTokens: 10 })
      return { isValid: true }
    } catch (error) {
      return { isValid: false, error: this.handleError(error, "validation").message }
    }
  }

  async listModels(_config: ProviderConfig): Promise<ModelInfo[]> {
    return [
      { id: "command-r-plus", modelId: "command-r-plus", displayName: "Command R+", contextWindow: 128000, supportsVision: false, supportsTools: true },
      { id: "command-r", modelId: "command-r", displayName: "Command R", contextWindow: 128000, supportsVision: false, supportsTools: true },
    ]
  }

  normalizeParams(params?: ModelParams): Record<string, unknown> {
    return { temperature: params?.temperature ?? 0.7, max_tokens: params?.maxOutputTokens, p: params?.topP }
  }

  setApiKey(apiKey: string): void { this.apiKey = apiKey }
  setBaseUrl(baseUrl: string): void { this.baseUrl = baseUrl }

  protected buildHeaders(config: ProviderConfig): Record<string, string> {
    const apiKey = config.apiKeyEncrypted ? this.decryptApiKey(config.apiKeyEncrypted) : this.apiKey
    return { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }
  }

  protected getDefaultBaseUrl(): string { return "https://api.cohere.com/v1" }
}
