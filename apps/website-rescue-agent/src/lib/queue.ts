/**
 * Queue System for Website Rescue Agent
 * 
 * Supports Redis (BullMQ) for production and In-Memory Mock for local development.
 * 
 * @see https://docs.bullmq.io/
 */

import { Queue, Worker, type Job } from "bullmq";
import type { QueueName, JobPayload } from "@/types";
import { db } from "./db";
import { 
  createRedisConnection, 
  defaultQueueOptions, 
  defaultWorkerOptions,
  queueConfigurations,
  checkRedisHealth,
} from "./queue-config";

// ─── Configuration ────────────────────────────────────────────────────────────

const USE_MOCK_QUEUE = process.env.USE_MOCK_QUEUE === "true" || !process.env.REDIS_URL;

// ─── Mock Queue for Local Development ─────────────────────────────────────────

type MockJob = {
  id: string;
  name: QueueName;
  data: JobPayload;
  status: "waiting" | "active" | "completed" | "failed";
  progress: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  errorMessage?: string;
};

class MockQueue {
  private jobs: Map<string, MockJob> = new Map();
  private name: QueueName;

  constructor(name: QueueName) {
    this.name = name;
    console.log(`[MockQueue] Created queue: ${name}`);
  }

  async add(name: QueueName, data: JobPayload, options?: { priority?: number; delay?: number; jobId?: string }) {
    const id = options?.jobId || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const job: MockJob = {
      id,
      name,
      data,
      status: "waiting",
      progress: 0,
      createdAt: new Date(),
    };
    this.jobs.set(id, job);

    // Auto-process after delay (for demo)
    const delay = options?.delay || 2000 + Math.random() * 3000;
    setTimeout(() => this.processJob(id), delay);

    console.log(`[MockQueue] Added job ${id} to ${this.name}, processing in ${Math.round(delay)}ms`);

    return { ...job, id } as unknown as Job;
  }

  private async processJob(id: string) {
    const job = this.jobs.get(id);
    if (!job) return;

    job.status = "active";
    job.startedAt = new Date();

    try {
      await this.executeMockJob(job);

      job.status = "completed";
      job.completedAt = new Date();
      job.progress = 100;

      // Update JobRecord
      await db.jobRecord.updateMany({
        where: { queueJobId: id },
        data: { status: "COMPLETED", completedAt: new Date(), progress: 100 },
      });

      // Update lead status
      await this.updateLeadStatus(job);

      console.log(`[MockQueue] Job ${id} completed`);

    } catch (error) {
      job.status = "failed";
      job.failedAt = new Date();
      job.errorMessage = error instanceof Error ? error.message : "Unknown error";

      await db.jobRecord.updateMany({
        where: { queueJobId: id },
        data: { 
          status: "FAILED", 
          completedAt: new Date(), 
          errorMessage: job.errorMessage 
        },
      });

      console.error(`[MockQueue] Job ${id} failed:`, job.errorMessage);
    }
  }

  private async executeMockJob(job: MockJob) {
    const { companyId } = job.data;

    switch (job.name) {
      case "crawl":
        await new Promise(r => setTimeout(r, 2000));
        await db.crawl.create({
          data: {
            companyId,
            status: "COMPLETED",
            startedAt: new Date(),
            completedAt: new Date(),
            pageCount: Math.floor(Math.random() * 5) + 1,
          },
        });
        break;

      case "analyze":
        await new Promise(r => setTimeout(r, 3000));
        const score = Math.floor(Math.random() * 60) + 20;
        await db.analysis.create({
          data: {
            companyId,
            status: "COMPLETED",
            overallScore: score,
            confidence: 0.8,
            designScore: score - 5 + Math.random() * 10,
            clarityScore: score - 10 + Math.random() * 15,
            conversionScore: score - 15 + Math.random() * 10,
            trustScore: score + Math.random() * 10,
            uxScore: score - 5 + Math.random() * 10,
            mobileScore: score - 10,
            seoScore: score - 5 + Math.random() * 5,
            performanceScore: score + Math.random() * 15,
            modernityScore: score - 20,
            strengths: JSON.stringify(["Domain professionell", "Kontaktdaten sichtbar"]),
            weaknesses: JSON.stringify(["Veraltetes Design", "Keine Mobile-Optimierung"]),
            quickWins: JSON.stringify(["Mobile-Optimierung aktivieren", "CTA hinzufügen"]),
            isQualified: score < 55,
          },
        });
        break;

      case "generate-site":
        await new Promise(r => setTimeout(r, 4000));
        await db.generatedSite.create({
          data: {
            companyId,
            status: "GENERATED",
            style: (job.data as any).style || "MODERN_PREMIUM",
            htmlContent: "<html><body><h1>Demo Website</h1></body></html>",
            cssContent: "body { font-family: sans-serif; }",
            hasPlaceholders: true,
            placeholderNotes: "Bitte ersetzen: Logo, Kontaktdaten, Bilder",
          },
        });
        break;

      case "generate-outreach":
        await new Promise(r => setTimeout(r, 2500));
        const company = await db.company.findUnique({ where: { id: companyId } });
        await db.outreachDraft.create({
          data: {
            companyId,
            type: (job.data as any).type || "EMAIL_SHORT",
            subject: `Website-Optimierung für ${company?.name || "Ihr Unternehmen"}`,
            body: `Guten Tag,\n\nich habe mir Ihre Website angesehen...`,
            status: "DRAFT",
            hasUnreviewedPlaceholders: true,
            isBlockedForSend: false,
          },
        });
        break;

      default:
        await new Promise(r => setTimeout(r, 1000));
    }
  }

  private async updateLeadStatus(job: MockJob) {
    const { companyId } = job.data;
    if (!companyId) return;

    const statusMap: Record<QueueName, string> = {
      crawl: "CRAWLED",
      analyze: "ANALYZED",
      "generate-site": "SITE_GENERATED",
      "generate-outreach": "OUTREACH_DRAFT_READY",
      qualify: "QUALIFIED",
      "compare-competitors": "ANALYZED",
      "send-outreach": "SENT",
    };

    const newStatus = statusMap[job.name];
    if (newStatus) {
      await db.company.update({
        where: { id: companyId },
        data: { status: newStatus },
      });

      await db.pipelineState.create({
        data: {
          companyId,
          toStatus: newStatus,
          reason: `Automatically after ${job.name}`,
        },
      });
    }
  }

  // Stats methods
  async getWaitingCount() {
    return Array.from(this.jobs.values()).filter(j => j.status === "waiting").length;
  }
  async getActiveCount() {
    return Array.from(this.jobs.values()).filter(j => j.status === "active").length;
  }
  async getCompletedCount() {
    return Array.from(this.jobs.values()).filter(j => j.status === "completed").length;
  }
  async getFailedCount() {
    return Array.from(this.jobs.values()).filter(j => j.status === "failed").length;
  }
  async getDelayedCount() {
    return 0;
  }
}

// ─── Queue Factory ────────────────────────────────────────────────────────────

const queues: Partial<Record<QueueName, Queue | MockQueue>> = {};
let redisConnection: ReturnType<typeof createRedisConnection> | null = null;

export function getQueue(name: QueueName): Queue | MockQueue {
  if (!queues[name]) {
    if (USE_MOCK_QUEUE) {
      queues[name] = new MockQueue(name);
    } else {
      // Lazy connection initialization
      if (!redisConnection) {
        redisConnection = createRedisConnection();
      }

      const config = queueConfigurations[name] || {};
      
      queues[name] = new Queue(name, {
        ...defaultQueueOptions,
        ...config,
        connection: redisConnection,
      });

      console.log(`[BullMQ] Created queue: ${name}`);
    }
  }
  return queues[name]!;
}

// ─── Job Enqueuing ────────────────────────────────────────────────────────────

export async function enqueueJob(
  queue: QueueName,
  payload: JobPayload,
  options?: {
    priority?: number;
    delay?: number;
    jobId?: string;
  }
): Promise<string> {
  const q = getQueue(queue);
  const job = await q.add(queue, payload, options);
  return job.id ?? "";
}

export async function enqueuePipeline(companyId: string): Promise<void> {
  await enqueueJob("crawl", { companyId }, { priority: 5 });
}

// ─── Queue Status ─────────────────────────────────────────────────────────────

export async function getQueueStats(name: QueueName) {
  const q = getQueue(name);
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    q.getWaitingCount(),
    q.getActiveCount(),
    q.getCompletedCount(),
    q.getFailedCount(),
    q.getDelayedCount(),
  ]);
  return { waiting, active, completed, failed, delayed };
}

export async function getAllQueueStats() {
  const names: QueueName[] = [
    "crawl",
    "analyze",
    "generate-site",
    "generate-outreach",
    "qualify",
    "compare-competitors",
    "send-outreach",
  ];
  const stats = await Promise.all(
    names.map(async (name) => ({ name, ...(await getQueueStats(name)) }))
  );
  return stats;
}

// ─── Health Check ─────────────────────────────────────────────────────────────

export { checkRedisHealth };

// ─── Close Connections (for graceful shutdown) ────────────────────────────────

export async function closeQueueConnections(): Promise<void> {
  console.log("[Queue] Closing connections...");
  
  // Close all queues
  for (const [name, queue] of Object.entries(queues)) {
    if (queue instanceof Queue) {
      await queue.close();
      console.log(`[Queue] Closed: ${name}`);
    }
  }
  
  // Clear queues map
  Object.keys(queues).forEach(key => delete queues[key as QueueName]);
  
  // Close Redis connection
  if (redisConnection) {
    await redisConnection.quit();
    redisConnection = null;
    console.log("[Queue] Redis connection closed");
  }
}

// ─── Mode Info ────────────────────────────────────────────────────────────────

console.log(`[Queue] Mode: ${USE_MOCK_QUEUE ? "MOCK (In-Memory)" : "REDIS (BullMQ)"}`);
console.log(`[Queue] Redis URL: ${USE_MOCK_QUEUE ? "N/A" : process.env.REDIS_URL}`);
