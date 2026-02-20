import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/adapters/index.ts",
    "src/router/index.ts",
    "src/prompts/index.ts",
    "src/templates.ts",
    "src/types.ts",
  ],
  format: ["esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  outDir: "dist",
  external: [
    "ai",
    "@ai-sdk/openai",
    "@ai-sdk/anthropic",
    "@ai-sdk/google",
    "@ai-sdk/deepseek",
    "@ai-sdk/mistral",
    "@ai-sdk/cohere",
    "@ai-sdk/xai",
    "@ai-sdk/openai-compatible",
    "ollama-ai-provider-v2",
  ],
});
