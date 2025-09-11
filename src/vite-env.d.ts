/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly REACT_APP_PATIENT_IDENTIFIER_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
