declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      JWT_SECRET: string;
      GOOGLE_CLIENT_ID: string;
      GOOGLE_CLIENT_SECRET: string;
      GOOGLE_CALLBACK_URL: string;
      OPENAI_API_KEY: string;
      SMTP_HOST: string;
      SMTP_PORT: string;
      SMTP_SECURE: string;
      SMTP_USER: string;
      SMTP_PASS: string;
      SMTP_FROM: string;
      WEB_PUSH_PUBLIC_KEY: string;
      WEB_PUSH_PRIVATE_KEY: string;
      WEB_PUSH_CONTACT: string;
      PORT: string;
      NODE_ENV: "development" | "production" | "test";
    }
  }
}

export {};
