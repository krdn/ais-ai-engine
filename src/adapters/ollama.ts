import { createOllama } from "ollama-ai-provider-v2"
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

export class OllamaAdapter extends BaseAdapter {
  readonly providerType = "ollama"
  readonly supportsVision = true
  readonly supportsStreaming = true
  readonly supportsTools = false
  readonly supportsJsonMode = false

  private apiKey: string = ""
  private baseUrl: string = "http://localhost:11434/api"

  createModel(modelId: string, config?: ProviderConfig): LanguageModel {
    const effectiveConfig = config || ({} as ProviderConfig)
    const effectiveBaseUrl = effectiveConfig.baseUrl || this.baseUrl
    const directUrl = this.getDirectUrl(effectiveBaseUrl)
    return createOllama({ baseURL: this.ensureHttps(directUrl) })(modelId) as unknown as LanguageModel
  }

  async generate(options: GenerateOptions): Promise<GenerateResult> {
    const result = await generateText({
      model: options.model,
      ...(options.messages
        ? { messages: options.messages }
        : { prompt: options.prompt || "" }),
      system: options.system,
      maxOutputTokens: options.maxOutputTokens,
      temperature: options.temperature,
      topP: options.topP,
    })
    return { text: result.text, usage: result.usage }
  }

  async stream(options: GenerateOptions): Promise<StreamResult> {
    const result = streamText({
      model: options.model,
      ...(options.messages
        ? { messages: options.messages }
        : { prompt: options.prompt || "" }),
      system: options.system,
      maxOutputTokens: options.maxOutputTokens,
      temperature: options.temperature,
      topP: options.topP,
    })
    return { stream: result.textStream, provider: this.providerType, model: "unknown" }
  }

  async validate(config: ProviderConfig): Promise<ValidationResult> {
    try {
      const baseUrl = this.ensureHttps(config.baseUrl || this.baseUrl)
      const apiKey = config.apiKeyEncrypted
        ? this.decryptApiKey(config.apiKeyEncrypted)
        : this.apiKey

      const versionUrl = baseUrl.replace(/\/api$/, "/api/version")
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)
      const headers: Record<string, string> = {}
      if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`

      const response = await fetch(versionUrl, {
        signal: controller.signal,
        headers: { ...headers, "User-Agent": "AI-AfterSchool/1.0" },
      })
      clearTimeout(timeout)

      if (!response.ok) {
        return { isValid: false, error: `Ollama 서버 연결 실패: HTTP ${response.status}` }
      }

      const modelsController = new AbortController()
      const modelsTimeout = setTimeout(() => modelsController.abort(), 10000)

      try {
        let modelsResponse: Response
        if (apiKey) {
          const modelsUrl = baseUrl.replace(/\/api$/, "/api/models")
          modelsResponse = await fetch(modelsUrl, {
            signal: modelsController.signal,
            headers: { Authorization: `Bearer ${apiKey}` },
          })
        } else {
          const tagsUrl = baseUrl.replace(/\/api$/, "/api/tags")
          modelsResponse = await fetch(tagsUrl, {
            signal: modelsController.signal,
            headers,
          })
        }
        clearTimeout(modelsTimeout)

        if (!modelsResponse.ok) {
          return {
            isValid: false,
            error: apiKey
              ? `API 키 인증 실패: HTTP ${modelsResponse.status}`
              : `모델 목록 조회 실패: HTTP ${modelsResponse.status}`,
          }
        }

        const contentType = modelsResponse.headers.get("content-type") || ""
        if (!contentType.includes("application/json")) {
          return { isValid: false, error: "API 키 인증 실패: 유효하지 않은 응답 형식" }
        }

        const modelsData = (await modelsResponse.json()) as Record<string, unknown>
        const dataArr = modelsData.data as unknown[] | undefined
        const modelsArr = modelsData.models as unknown[] | undefined
        const modelCount = apiKey
          ? (dataArr?.length ?? 0)
          : (modelsArr?.length ?? 0)

        if (modelCount === 0 && apiKey) {
          const directUrl = this.getDirectUrl(baseUrl)
          const directModels = await this.fetchDirectModels(directUrl)
          if (directModels.length === 0) {
            return { isValid: true, error: "연결 성공, 그러나 사용 가능한 모델이 없습니다." }
          }
        } else if (modelCount === 0) {
          return { isValid: true, error: "연결 성공, 그러나 사용 가능한 모델이 없습니다." }
        }
      } catch {
        clearTimeout(modelsTimeout)
        return { isValid: true, error: "서버 연결 성공, 모델 목록 조회에 실패했습니다." }
      }

      return { isValid: true }
    } catch (error) {
      let errorMessage = "알 수 없는 오류"
      if (error instanceof Error) {
        if (error.name === "AbortError") errorMessage = "연결 시간 초과 (10초). 서버가 접근 가능한지 확인하세요."
        else if (error.message.includes("ECONNREFUSED")) errorMessage = "연결 거부됨. 서버가 실행 중인지 확인하세요."
        else if (error.message.includes("ENOTFOUND")) errorMessage = "호스트를 찾을 수 없음. URL을 확인하세요."
        else errorMessage = error.message
      }
      return { isValid: false, error: `[Ollama] ${errorMessage}` }
    }
  }

  async listModels(config: ProviderConfig): Promise<ModelInfo[]> {
    const baseUrl = this.ensureHttps(config.baseUrl || this.baseUrl)
    const apiKey = config.apiKeyEncrypted
      ? this.decryptApiKey(config.apiKeyEncrypted)
      : this.apiKey
    const isProxy = !!apiKey

    try {
      if (isProxy) {
        const proxyModels = await this.fetchProxyModels(baseUrl, apiKey)
        if (proxyModels.length > 0) return proxyModels
        const directUrl = this.getDirectUrl(baseUrl)
        return await this.fetchDirectModels(directUrl)
      }
      return await this.fetchDirectModels(baseUrl)
    } catch {
      return []
    }
  }

  private async fetchProxyModels(baseUrl: string, apiKey: string): Promise<ModelInfo[]> {
    try {
      const modelsUrl = baseUrl.replace(/\/api$/, "/api/models")
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)
      const response = await fetch(modelsUrl, {
        signal: controller.signal,
        headers: { Authorization: `Bearer ${apiKey}` },
      })
      clearTimeout(timeout)
      if (!response.ok) return []

      const data = (await response.json()) as { data?: Array<{ id: string; name: string; ollama?: unknown }> }
      if (!data.data) return []

      return data.data
        .filter((m) => m.ollama)
        .map((m) => ({
          id: m.id,
          modelId: m.id,
          displayName: m.name || m.id,
          contextWindow: 8192,
          supportsVision: m.id.includes("vision") || m.id.includes("llava"),
          supportsTools: false,
        }))
    } catch {
      return []
    }
  }

  private async fetchDirectModels(baseUrl: string, apiKey?: string): Promise<ModelInfo[]> {
    try {
      const tagsUrl = baseUrl.replace(/\/api$/, "/api/tags")
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)
      const headers: Record<string, string> = {}
      if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`

      const response = await fetch(tagsUrl, { signal: controller.signal, headers })
      clearTimeout(timeout)
      if (!response.ok) return []

      const data = (await response.json()) as { models?: Array<{ name: string }> }
      const models = data.models || []
      return models.map((m) => ({
        id: m.name,
        modelId: m.name,
        displayName: m.name,
        contextWindow: 8192,
        supportsVision: m.name.includes("vision") || m.name.includes("llava"),
        supportsTools: false,
      }))
    } catch {
      return []
    }
  }

  normalizeParams(params?: ModelParams): Record<string, unknown> {
    return { temperature: params?.temperature ?? 0.7, num_predict: params?.maxOutputTokens, top_p: params?.topP }
  }

  setApiKey(apiKey: string): void { this.apiKey = apiKey }
  setBaseUrl(baseUrl: string): void { this.baseUrl = baseUrl }

  protected buildHeaders(config: ProviderConfig): Record<string, string> {
    const headers: Record<string, string> = {}
    const apiKey = config.apiKeyEncrypted
      ? this.decryptApiKey(config.apiKeyEncrypted)
      : this.apiKey
    if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`
    return headers
  }

  protected getDefaultBaseUrl(): string { return "http://localhost:11434/api" }

  private getDirectUrl(_proxyBaseUrl: string): string {
    const directUrl = process.env.OLLAMA_DIRECT_URL
    if (directUrl) return this.ensureHttps(directUrl)
    return this.getDefaultBaseUrl()
  }

  private ensureHttps(url: string): string {
    if (!url.startsWith("http://")) return url
    try {
      const parsed = new URL(url)
      const host = parsed.hostname
      if (
        host === "localhost" ||
        host === "127.0.0.1" ||
        host.startsWith("192.168.") ||
        host.startsWith("10.") ||
        host.startsWith("172.")
      ) return url
      return url.replace(/^http:\/\//, "https://")
    } catch {
      return url
    }
  }
}
