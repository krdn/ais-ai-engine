// 타입 및 상수
export type {
  ProviderType,
  ProviderName,
  FeatureType,
  AuthType,
  CostTier,
  QualityTier,
  Capability,
  MatchMode,
  FallbackMode,
  ProviderConfig,
  ProviderInput,
  ModelConfig,
  ModelInput,
  ModelParams,
  ModelInfo,
  ValidationResult,
  ResolutionResult,
  ProviderStaticConfig,
  GenerateOptions,
  GenerateResult,
  StreamResult,
  LanguageModel,
  LanguageModelUsage,
  ModelMessage,
} from "./types.js"

export {
  PROVIDER_CONFIGS,
  COST_PER_MILLION_TOKENS,
  PROVIDER_NAME_TO_TYPE,
  providerTypeToName,
  providerNameToType,
} from "./types.js"

// 암호화
export { encryptApiKey, decryptApiKey, maskApiKey } from "./encryption.js"

// 어댑터 (서브패스로도 접근 가능: @ais/ai-engine/adapters)
export {
  getAdapter,
  getAdapterFactory,
  hasAdapter,
  getRegisteredTypes,
  registerAdapter,
  BaseAdapter,
} from "./adapters/index.js"

// 라우터 (서브패스로도 접근 가능: @ais/ai-engine/router)
export {
  optimizeProviderOrder,
  estimateCost,
  withFailover,
  createFailoverExecutor,
  isRetryableError,
  FailoverError,
} from "./router/index.js"

export type {
  BudgetPeriod,
  BudgetAlert,
  RoutingResult,
  FailoverContext,
  FailoverResult,
  ProviderError,
  TrackFailureFn,
} from "./router/index.js"
