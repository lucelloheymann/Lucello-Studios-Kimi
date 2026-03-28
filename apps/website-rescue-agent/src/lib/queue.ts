import { Queue, Worker, type Job } from "bullmq";
import IORedis from "ioredis";
import type { QueueName, JobPayload } from "@/types";

// ─── Redis Connection ─────────────────────────────────────────────────────────

let redisConnection: IORedis | null = null;

export function getRedisConnection(): IORedis {
  if (!redisConnection) {
    redisConnection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
      maxRetriesPerRequest: null, // Required for BullMQ
    });
  }
  return redisConnection;
}

// ─── Queue Factory ────────────────────────────────────────────────────────────

const queues: Partial<Record<QueueName, Queue>> = {};

export function getQueue(name: QueueName): Queue {
  if (!queues[name]) {
    queues[name] = new Queue(name, {
      connection: getRedisConnection(),
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
      },
    });
  }
  return queues[name]!;
}

// ─── Job-Enqueuing ────────────────────────────────────────────────────────────

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
  const job = await q.add(queue, payload, {
    priority: options?.priority,
    delay: options?.delay,
    jobId: options?.jobId,
  });
  return job.id ?? "";
}

// ─── Job-Pipeline (Lead → vollständige Analyse) ───────────────────────────────

export async function enqueuePipeline(companyId: string): Promise<void> {
  // Crawl → Analyze → Qualify (werden via onCompleted-Hooks gekettet)
  await enqueueJob("crawl", { companyId }, { priority: 5 });
}

// ─── Queue-Status ─────────────────────────────────────────────────────────────

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
