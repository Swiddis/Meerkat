/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_API_URL: string
  readonly VITE_COGNITO_POOL: string
  readonly VITE_COGNITO_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}