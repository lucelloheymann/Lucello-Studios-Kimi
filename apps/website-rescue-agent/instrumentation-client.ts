import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Adds request headers and IP for users
  sendDefaultPii: true,
  
  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  
  // Session Replay (disabled by default, enable if needed)
  // replaysSessionSampleRate: 0.1,
  // replaysOnErrorSampleRate: 1.0,
  
  // Logs (enable if using Sentry logs)
  // enableLogs: true,
  
  // Environment
  environment: process.env.NODE_ENV || "development",
  
  // Release tracking (requires SENTRY_RELEASE env var in CI)
  release: process.env.SENTRY_RELEASE,
  
  // Debug mode (only in development)
  debug: process.env.NODE_ENV === "development" && process.env.SENTRY_DEBUG === "true",
  
  // BeforeSend hook to filter sensitive data
  beforeSend(event) {
    // Filter out sensitive headers
    if (event.request?.headers) {
      const headers = event.request.headers;
      delete headers.cookie;
      delete headers.authorization;
    }
    return event;
  },
  
  integrations: [
    // Session Replay integration (enable if needed)
    // Sentry.replayIntegration(),
  ],
});
