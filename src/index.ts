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
  ResolutionRequirements,
  GenerateOptions,
  GenerateResult,
  StreamResult,
  FeatureMappingInput,
  FeatureConfig,
  FeatureMappingConfig,
  ProviderWithModels,
} from "./types.js"

// ai 패키지 타입 재수출
export type {
  LanguageModel,
  LanguageModelUsage,
  ModelMessage,
} from "ai"

export {
  PROVIDER_CONFIGS,
  PROVIDER_NAME_TO_TYPE,
  providerTypeToName,
  providerNameToType,
  COST_PER_MILLION_TOKENS as LLM_COST_CONFIG,
  COST_PER_MILLION_TOKENS,
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

// Universal Router / Base Router Functions
export {
  generateWithProvider,
  generateWithSpecificProvider,
  streamWithProvider,
  generateWithVision,
  generateVisionWithSpecificProvider,
} from "./universal-router.js"

export type {
  BudgetPeriod,
  BudgetAlert,
  RoutingResult,
  FailoverContext,
  FailoverResult,
  ProviderError,
  TrackFailureFn,
} from "./router/index.js"

// 템플릿
export {
  getProviderTemplates,
  getProviderTemplate,
  type ProviderTemplate,
} from "./templates.js"

// 설정 및 레지스트리
export {
  getEnabledProvidersWithVision,
  getEnabledProviders,
} from "./config.js"

export {
  syncProviderModels,
  validateProvider,
} from "./registry-sync.js"

export {
  getProviderRegistry,
  type ProviderRegistry,
} from "./provider-registry.js"

// 사용량 및 라우팅 추가 함수
export {
  checkAllBudgetThresholds,
  getBudgetSummary,
} from "./smart-routing.js"

export {
  getUsageStats,
  getUsageStatsByProvider,
  getUsageStatsByFeature,
  getCurrentPeriodCost,
} from "./usage-tracker.js"

export {
  getMonthlyAggregations,
  getMonthlyTotalCost,
  getYearlyCostTrend,
  aggregateMonthlyUsage,
  aggregatePreviousMonth,
  cleanupOldUsageData,
} from "./usage-aggregation.js"

// Feature Resolver Export
export { FeatureResolver } from "./feature-resolver.js"

// 테스트 유틸리티
export {
  testProviderConnection,
} from "./test-provider.js"

export {
  checkOllamaHealth,
  testOllamaConnection,
  getOllamaModels,
} from "./providers/ollama.js"
