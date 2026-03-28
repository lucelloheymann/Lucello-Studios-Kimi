// BullMQ Worker — separater Prozess (npm run worker)
// Verarbeitet alle Queue-Jobs für Website Rescue Agent

import { Worker, type Job } from "bullmq";
import { getRedisConnection } from "@/lib/queue";
import { db } from "@/lib/db";
import { crawlWebsite } from "@/server/services/crawl.service";
import { analyzeWebsite } from "@/server/services/analysis.service";
import { generateDemoSite } from "@/server/services/site-generator.service";
import { generateOutreachDraft } from "@/server/services/outreach.service";
import type { QueueName, JobPayload } from "@/types";

const connection = getRedisConnection();

// ─── Crawl Worker ─────────────────────────────────────────────────────────────

const crawlWorker = new Worker<JobPayload>(
  "crawl",
  async (job: Job<JobPayload>) => {
    const { companyId } = job.data;
    console.log(`[crawl] Start: ${companyId}`);

    await updateJobRecord(job, "RUNNING");
    await crawlWebsite(companyId);
    await updateJobRecord(job, "COMPLETED");

    // Pipeline: direkt Analyse starten
    const { getQueue } = await import("@/lib/queue");
    await getQueue("analyze").add("analyze", { companyId }, {
      attempts: 3,
      backoff: { type: "exponential", delay: 3000 },
    });

    console.log(`[crawl] Fertig: ${companyId} → Analyse eingereiht`);
  },
  {
    connection,
    concurrency: parseInt(process.env.CRAWL_CONCURRENCY || "3"),
  }
);

// ─── Analyse Worker ───────────────────────────────────────────────────────────

const analyzeWorker = new Worker<JobPayload>(
  "analyze",
  async (job: Job<JobPayload>) => {
    const { companyId } = job.data;
    console.log(`[analyze] Start: ${companyId}`);

    await updateJobRecord(job, "RUNNING");
    await analyzeWebsite(companyId);
    await updateJobRecord(job, "COMPLETED");

    console.log(`[analyze] Fertig: ${companyId}`);
  },
  {
    connection,
    concurrency: parseInt(process.env.LLM_CONCURRENCY || "2"),
  }
);

// ─── Site-Generator Worker ────────────────────────────────────────────────────

const siteGenWorker = new Worker<JobPayload>(
  "generate-site",
  async (job: Job<JobPayload>) => {
    const { companyId, style } = job.data;
    console.log(`[generate-site] Start: ${companyId} (${style})`);

    await updateJobRecord(job, "RUNNING");
    await generateDemoSite(companyId, style as string | undefined);
    await updateJobRecord(job, "COMPLETED");

    console.log(`[generate-site] Fertig: ${companyId}`);
  },
  {
    connection,
    concurrency: parseInt(process.env.LLM_CONCURRENCY || "2"),
  }
);

// ─── Outreach Worker ──────────────────────────────────────────────────────────

const outreachWorker = new Worker<JobPayload>(
  "generate-outreach",
  async (job: Job<JobPayload>) => {
    const { companyId, type } = job.data;
    console.log(`[generate-outreach] Start: ${companyId} (${type})`);

    await updateJobRecord(job, "RUNNING");
    await generateOutreachDraft(companyId, type as string | undefined);
    await updateJobRecord(job, "COMPLETED");

    console.log(`[generate-outreach] Fertig: ${companyId}`);
  },
  {
    connection,
    concurrency: parseInt(process.env.LLM_CONCURRENCY || "2"),
  }
);

// ─── Error-Handling ───────────────────────────────────────────────────────────

const workers = [crawlWorker, analyzeWorker, siteGenWorker, outreachWorker];

for (const worker of workers) {
  worker.on("failed", async (job, error) => {
    if (!job) return;
    console.error(`[${worker.name}] Job fehlgeschlagen:`, job.id, error.message);
    await updateJobRecord(job, "FAILED", error.message);
  });

  worker.on("error", (error) => {
    console.error(`[${worker.name}] Worker-Fehler:`, error);
  });
}

// ─── JobRecord-Utility ────────────────────────────────────────────────────────

async function updateJobRecord(
  job: Job,
  status: "RUNNING" | "COMPLETED" | "FAILED",
  errorMessage?: string
) {
  try {
    if (job.id) {
      await db.jobRecord.upsert({
        where: { queueJobId: job.id },
        update: {
          status,
          ...(status === "RUNNING" ? { startedAt: new Date() } : {}),
          ...(status !== "RUNNING" ? { completedAt: new Date() } : {}),
          ...(errorMessage ? { errorMessage } : {}),
          retryCount: job.attemptsMade,
          queueJobId: job.id,
        },
        create: {
          type: job.name,
          status,
          entityType: "Company",
          entityId: (job.data as JobPayload).companyId,
          startedAt: new Date(),
          payload: job.data as Record<string, unknown>,
          queueJobId: job.id,
          retryCount: job.attemptsMade,
        },
      });
    }
  } catch {
    // Job-Record-Fehler nicht propagieren
  }
}

// ─── Graceful Shutdown ────────────────────────────────────────────────────────

async function shutdown() {
  console.log("Worker wird heruntergefahren...");
  await Promise.all(workers.map((w) => w.close()));
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

console.log("Website Rescue Agent Worker gestartet.");
console.log("Queues:", workers.map((w) => w.name).join(", "));
