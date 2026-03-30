/**
 * BullMQ Worker Process
 * 
 * Run with: npm run worker
 * Run with watch mode: npm run worker:dev
 * 
 * This worker processes all queue jobs for Website Rescue Agent.
 * Supports graceful shutdown and Sentry error reporting.
 * 
 * @see https://docs.bullmq.io/guide/workers
 */

import { Worker, type Job } from "bullmq";
import { 
  createRedisConnection, 
  defaultWorkerOptions,
  queueConfigurations,
} from "@/lib/queue-config";
import { db } from "@/lib/db";
import { crawlWebsite } from "@/server/services/crawl.service";
import { analyzeWebsite } from "@/server/services/analysis.service";
import { generateDemoSite } from "@/server/services/site-generator.service";
import { generateOutreachDraft } from "@/server/services/outreach.service";
import type { QueueName, JobPayload } from "@/types";
import * as Sentry from "@sentry/node";

// Initialize Sentry for worker
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: 0.1,
  });
}

const connection = createRedisConnection();

// ─── Job Processors ───────────────────────────────────────────────────────────

const processors: Record<string, (job: Job<JobPayload>) => Promise<void>> = {
  crawl: async (job) => {
    const { companyId } = job.data;
    console.log(`[crawl] Starting: ${companyId}`);
    
    await updateJobRecord(job, "RUNNING");
    await crawlWebsite(companyId);
    await updateJobRecord(job, "COMPLETED");

    // Pipeline: Queue analysis job
    const { getQueue } = await import("@/lib/queue");
    await getQueue("analyze").add("analyze", { companyId }, {
      attempts: 3,
      backoff: { type: "exponential", delay: 3000 },
    });

    console.log(`[crawl] Completed: ${companyId} → Analysis queued`);
  },

  analyze: async (job) => {
    const { companyId } = job.data;
    console.log(`[analyze] Starting: ${companyId}`);
    
    await updateJobRecord(job, "RUNNING");
    await analyzeWebsite(companyId);
    await updateJobRecord(job, "COMPLETED");

    console.log(`[analyze] Completed: ${companyId}`);
  },

  "generate-site": async (job) => {
    const { companyId, style } = job.data;
    console.log(`[generate-site] Starting: ${companyId} (${style})`);
    
    await updateJobRecord(job, "RUNNING");
    await generateDemoSite(companyId, style as string | undefined);
    await updateJobRecord(job, "COMPLETED");

    console.log(`[generate-site] Completed: ${companyId}`);
  },

  "generate-outreach": async (job) => {
    const { companyId, type } = job.data;
    console.log(`[generate-outreach] Starting: ${companyId} (${type})`);
    
    await updateJobRecord(job, "RUNNING");
    await generateOutreachDraft(companyId, type as string | undefined);
    await updateJobRecord(job, "COMPLETED");

    console.log(`[generate-outreach] Completed: ${companyId}`);
  },

  "send-outreach": async (job) => {
    const { companyId, outreachDraftId } = job.data as { companyId: string; outreachDraftId: string };
    console.log(`[send-outreach] Starting: ${companyId} (${outreachDraftId})`);
    
    await updateJobRecord(job, "RUNNING");
    
    try {
      // Worker-Context hat keinen User — wir verwenden "worker" als sentBy
      const { sendOutreach } = await import("@/server/services/outreach.service");
      const result = await sendOutreach(outreachDraftId, "worker");
      
      if (result.success) {
        console.log(`[send-outreach] Email sent: ${result.messageId}`);
        await updateJobRecord(job, "COMPLETED");
      } else {
        throw new Error(result.error || "Send failed");
      }
    } catch (error) {
      console.error(`[send-outreach] Failed:`, error);
      throw error; // BullMQ wird Retry handlen
    }

    console.log(`[send-outreach] Completed: ${companyId}`);
  },

  qualify: async (job) => {
    const { companyId } = job.data;
    console.log(`[qualify] Starting: ${companyId}`);
    
    await updateJobRecord(job, "RUNNING");
    // Qualification is handled during analysis
    await updateJobRecord(job, "COMPLETED");

    console.log(`[qualify] Completed: ${companyId}`);
  },

  "compare-competitors": async (job) => {
    const { companyId } = job.data;
    console.log(`[compare-competitors] Starting: ${companyId}`);
    
    await updateJobRecord(job, "RUNNING");
    // TODO: Implement competitor comparison
    console.log(`[compare-competitors] Not yet implemented`);
    await updateJobRecord(job, "COMPLETED");

    console.log(`[compare-competitors] Completed: ${companyId}`);
  },
};

// ─── Worker Creation ──────────────────────────────────────────────────────────

function createWorker(name: QueueName): Worker<JobPayload> {
  const processor = processors[name];
  
  if (!processor) {
    throw new Error(`No processor defined for queue: ${name}`);
  }

  const config = queueConfigurations[name] || {};
  const concurrency = getConcurrencyForQueue(name);

  const worker = new Worker<JobPayload>(
    name,
    async (job) => {
      try {
        await processor(job);
      } catch (error) {
        // Report to Sentry
        Sentry.captureException(error, {
          tags: { queue: name, jobId: job.id },
          extra: { jobData: job.data },
        });
        throw error;
      }
    },
    {
      ...defaultWorkerOptions,
      connection,
      concurrency,
    }
  );

  // Event handlers
  worker.on("completed", (job) => {
    console.log(`[${name}] Job completed:`, job?.id);
  });

  worker.on("failed", async (job, error) => {
    if (!job) return;
    console.error(`[${name}] Job failed:`, job.id, error.message);
    await updateJobRecord(job, "FAILED", error.message);
    
    // Report to Sentry
    Sentry.captureException(error, {
      tags: { queue: name, jobId: job.id, event: "job_failed" },
      extra: { 
        jobData: job.data, 
        attemptsMade: job.attemptsMade,
        failedReason: job.failedReason,
      },
    });
  });

  worker.on("error", (error) => {
    console.error(`[${name}] Worker error:`, error);
    Sentry.captureException(error, {
      tags: { queue: name, event: "worker_error" },
    });
  });

  worker.on("stalled", (jobId) => {
    console.warn(`[${name}] Job stalled:`, jobId);
    Sentry.captureMessage(`Job stalled in ${name}`, {
      level: "warning",
      tags: { queue: name, jobId },
    });
  });

  return worker;
}

function getConcurrencyForQueue(name: QueueName): number {
  switch (name) {
    case "crawl":
      return parseInt(process.env.CRAWL_CONCURRENCY || "3", 10);
    case "analyze":
    case "generate-site":
    case "generate-outreach":
      return parseInt(process.env.LLM_CONCURRENCY || "2", 10);
    case "send-outreach":
      return parseInt(process.env.EMAIL_CONCURRENCY || "1", 10);
    default:
      return 2;
  }
}

// ─── Create All Workers ───────────────────────────────────────────────────────

const workerNames: QueueName[] = [
  "crawl",
  "analyze",
  "generate-site",
  "generate-outreach",
  "qualify",
  "compare-competitors",
  "send-outreach",
];

const workers = workerNames.map(createWorker);

// ─── JobRecord Utility ────────────────────────────────────────────────────────

async function updateJobRecord(
  job: Job,
  status: "RUNNING" | "COMPLETED" | "FAILED",
  errorMessage?: string
) {
  try {
    if (job.id) {
      await db.jobRecord.upsert({
        where: { id: job.id },
        update: {
          status,
          ...(status === "RUNNING" ? { startedAt: new Date() } : {}),
          ...(status !== "RUNNING" ? { completedAt: new Date() } : {}),
          ...(errorMessage ? { errorMessage } : {}),
          retryCount: job.attemptsMade,
          queueJobId: job.id,
        },
        create: {
          id: job.id,
          type: job.name,
          status,
          entityType: "Company",
          entityId: (job.data as JobPayload).companyId,
          startedAt: status === "RUNNING" ? new Date() : undefined,
          completedAt: status !== "RUNNING" ? new Date() : undefined,
          payload: JSON.stringify(job.data),
          queueJobId: job.id,
          retryCount: job.attemptsMade,
          ...(errorMessage ? { errorMessage } : {}),
        },
      });
    }
  } catch (error) {
    console.error("[Worker] Failed to update job record:", error);
    // Don't propagate - job record failure shouldn't fail the job
  }
}

// ─── Graceful Shutdown ────────────────────────────────────────────────────────

async function shutdown(signal: string) {
  console.log(`\n[Worker] Received ${signal}, shutting down...`);
  
  // Stop accepting new jobs
  for (const worker of workers) {
    worker.pause();
  }
  
  // Wait for current jobs to complete (with timeout)
  const shutdownTimeout = 30000; // 30 seconds
  const shutdownPromise = Promise.all(
    workers.map((w) => w.close())
  );
  
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Shutdown timeout")), shutdownTimeout);
  });
  
  try {
    await Promise.race([shutdownPromise, timeoutPromise]);
    console.log("[Worker] All workers closed gracefully");
  } catch (error) {
    console.error("[Worker] Forced shutdown:", error);
  }
  
  // Close Redis connection
  await connection.quit();
  
  // Flush Sentry
  await Sentry.close(2000);
  
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// ─── Startup ──────────────────────────────────────────────────────────────────

console.log("╔══════════════════════════════════════════════════════════════╗");
console.log("║   Website Rescue Agent Worker                                ║");
console.log("╚══════════════════════════════════════════════════════════════╝");
console.log("Active queues:", workers.map((w) => w.name).join(", "));
console.log("Press Ctrl+C to stop gracefully\n");
