/// <reference types="vite/client" />

interface ImportMetaEnv {
  VITE_BASE_URL: string; // Define other environment variables as needed
  // Add more variables here as necessary
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}