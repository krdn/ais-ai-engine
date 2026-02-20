import type { BaseAdapter } from "./base.js"
import type { ProviderType } from "../types.js"
import { OpenAIAdapter } from "./openai.js"
import { AnthropicAdapter } from "./anthropic.js"
import { GoogleAdapter } from "./google.js"
import { OllamaAdapter } from "./ollama.js"
import { ZhipuAdapter } from "./zhipu.js"
import { MoonshotAdapter } from "./moonshot.js"
import { DeepSeekAdapter } from "./deepseek.js"
import { MistralAdapter } from "./mistral.js"
import { CohereAdapter } from "./cohere.js"
import { XaiAdapter } from "./xai.js"
import { OpenRouterAdapter } from "./openrouter.js"

class AdapterFactory {
  private adapters: Map<ProviderType, new () => BaseAdapter> = new Map()
  private instances: Map<ProviderType, BaseAdapter> = new Map()

  constructor() {
    this.registerDefaultAdapters()
  }

  private registerDefaultAdapters(): void {
    this.adapters.set("openai", OpenAIAdapter)
    this.adapters.set("anthropic", AnthropicAdapter)
    this.adapters.set("google", GoogleAdapter)
    this.adapters.set("ollama", OllamaAdapter)
    this.adapters.set("zhipu", ZhipuAdapter)
    this.adapters.set("moonshot", MoonshotAdapter)
    this.adapters.set("deepseek", DeepSeekAdapter)
    this.adapters.set("mistral", MistralAdapter)
    this.adapters.set("cohere", CohereAdapter)
    this.adapters.set("xai", XaiAdapter)
    this.adapters.set("openrouter", OpenRouterAdapter)
  }

  registerAdapter(type: ProviderType, adapterClass: new () => BaseAdapter): void {
    this.adapters.set(type, adapterClass)
    this.instances.delete(type)
  }

  getAdapter(type: ProviderType): BaseAdapter {
    const cached = this.instances.get(type)
    if (cached) return cached

    const AdapterClass = this.adapters.get(type)
    if (!AdapterClass) {
      throw new Error(`No adapter registered for provider type: ${type}`)
    }

    const instance = new AdapterClass()
    this.instances.set(type, instance)
    return instance
  }

  hasAdapter(type: ProviderType): boolean {
    return this.adapters.has(type)
  }

  getRegisteredTypes(): ProviderType[] {
    return Array.from(this.adapters.keys())
  }

  invalidateAdapter(type: ProviderType): void {
    this.instances.delete(type)
  }

  invalidateAll(): void {
    this.instances.clear()
  }
}

const adapterFactory = new AdapterFactory()

export function getAdapterFactory(): AdapterFactory {
  return adapterFactory
}

export function registerAdapter(
  type: ProviderType,
  adapterClass: new () => BaseAdapter
): void {
  adapterFactory.registerAdapter(type, adapterClass)
}

export function getAdapter(type: ProviderType): BaseAdapter {
  return adapterFactory.getAdapter(type)
}

export function hasAdapter(type: ProviderType): boolean {
  return adapterFactory.hasAdapter(type)
}

export function getRegisteredTypes(): ProviderType[] {
  return adapterFactory.getRegisteredTypes()
}

export { BaseAdapter } from "./base.js"
export { OpenAIAdapter } from "./openai.js"
export { AnthropicAdapter } from "./anthropic.js"
export { GoogleAdapter } from "./google.js"
export { OllamaAdapter } from "./ollama.js"
export { ZhipuAdapter } from "./zhipu.js"
export { MoonshotAdapter } from "./moonshot.js"
export { DeepSeekAdapter } from "./deepseek.js"
export { MistralAdapter } from "./mistral.js"
export { CohereAdapter } from "./cohere.js"
export { XaiAdapter } from "./xai.js"
export { OpenRouterAdapter } from "./openrouter.js"
