import { registerOTel } from "@vercel/otel";

export async function register() {
  // Register OpenTelemetry for Vercel
  if (process.env.NEXT_RUNTIME === "nodejs") {
    registerOTel({ serviceName: "website-rescue-agent" });
    
    // Import server-side Sentry configuration
    await import("./sentry.server.config");
  }
  
  if (process.env.NEXT_RUNTIME === "edge") {
    // Import edge Sentry configuration
    await import("./sentry.edge.config");
  }
}
