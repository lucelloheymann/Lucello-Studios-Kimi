import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,
  
  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  
  // Replay für Session-Aufzeichnung (optional)
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Environment
  environment: process.env.NODE_ENV || "development",
  
  // Release tracking
  release: process.env.SENTRY_RELEASE,
  
  // Debug mode - immer aktiv in Development
  debug: process.env.NODE_ENV === "development",
  
  // BeforeSend zum Filtern sensibler Daten
  beforeSend(event) {
    // Filtere potentielle PII aus dem Frontend
    if (event.user) {
      delete event.user.ip_address;
      delete event.user.email;
    }
    return event;
  },
});
