/**
 * BullMQ Configuration for Production
 * 
 * This file contains the production-ready queue configuration
 * with proper Redis connection handling, retry logic, and monitoring.
 */

import { QueueOptions, WorkerOptions } from "bullmq";
import IORedis from "ioredis";

// ─── Redis Connection Configuration ───────────────────────────────────────────

export const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

/**
 * Create a Redis connection for BullMQ
 * Uses a single connection instance to avoid connection leaks
 */
export function createRedisConnection(): IORedis {
  const connection = new IORedis(REDIS_URL, {
    maxRetriesPerRequest: null, // Required by BullMQ
    enableReadyCheck: false,    // Required by BullMQ
    
    // Connection pool settings
    lazyConnect: true,
    keepAlive: 30000,
    
    // Retry strategy for connection failures
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000);
      console.log(`[Redis] Retry attempt ${times}, delay ${delay}ms`);
      return delay;
    },
    
    // Reconnect on error (except for specific errors)
    reconnectOnError: (err: Error) => {
      const targetErrors = ["READONLY", "ECONNREFUSED", "ETIMEDOUT"];
      return targetErrors.some(e => err.message.includes(e));
    },
  });

  // Connection event handlers
  connection.on("connect", () => {
    console.log("[Redis] Connection established");
  });

  connection.on("ready", () => {
    console.log("[Redis] Connection ready");
  });

  connection.on("error", (err) => {
    console.error("[Redis] Connection error:", err.message);
  });

  connection.on("close", () => {
    console.log("[Redis] Connection closed");
  });

  connection.on("reconnecting", () => {
    console.log("[Redis] Reconnecting...");
  });

  return connection;
}

// ─── Queue Options ────────────────────────────────────────────────────────────

/**
 * Default queue options for all queues
 * Note: 'connection' must be provided when creating the queue
 */
export const defaultQueueOptions: Omit<QueueOptions, 'connection'> = {
  defaultJobOptions: {
    // Retry configuration
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000, // Start with 5s, then 10s, then 20s
    },
    
    // Job cleanup
    removeOnComplete: {
      count: 100,     // Keep last 100 completed jobs
      age: 24 * 3600, // Remove jobs older than 24 hours
    },
    removeOnFail: {
      count: 50,      // Keep last 50 failed jobs for debugging
      age: 7 * 24 * 3600, // Remove failed jobs older than 7 days
    },
  },
};

// ─── Worker Options ───────────────────────────────────────────────────────────

/**
 * Default worker options for all workers
 * Note: 'connection' must be provided when creating the worker
 */
export const defaultWorkerOptions: Omit<WorkerOptions, 'connection'> = {
  // Concurrency settings
  concurrency: parseInt(process.env.WORKER_CONCURRENCY || "4", 10),
  
  // Rate limiting (optional)
  limiter: {
    max: parseInt(process.env.WORKER_RATE_LIMIT_MAX || "10", 10),
    duration: parseInt(process.env.WORKER_RATE_LIMIT_DURATION || "1000", 10),
  },
  
  // Lock duration
  lockDuration: 6 * 60 * 1000, // 6 minutes
  
  // Stalled job check interval
  stalledInterval: 30 * 1000, // 30 seconds
  
  // Max stalled job count before considering worker dead
  maxStalledCount: 2,
};

// ─── Queue-Specific Configurations ────────────────────────────────────────────

/**
 * Configuration for specific queue types
 */
export const queueConfigurations: Record<string, Partial<Omit<QueueOptions, 'connection'>>> = {
  crawl: {
    defaultJobOptions: {
      ...defaultQueueOptions.defaultJobOptions,
      attempts: 2,
    },
  },
  
  analyze: {
    defaultJobOptions: {
      ...defaultQueueOptions.defaultJobOptions,
      attempts: 2,
    },
  },
  
  "generate-site": {
    defaultJobOptions: {
      ...defaultQueueOptions.defaultJobOptions,
      attempts: 2,
    },
  },
  
  "generate-outreach": {
    defaultJobOptions: {
      ...defaultQueueOptions.defaultJobOptions,
      attempts: 2,
    },
  },
  
  "send-outreach": {
    defaultJobOptions: {
      ...defaultQueueOptions.defaultJobOptions,
      attempts: 3, // More retries for sending
      backoff: {
        type: "fixed",
        delay: 30000, // 30s fixed delay between retries
      },
    },
  },
};

// ─── Health Check ─────────────────────────────────────────────────────────────

/**
 * Check Redis connection health
 */
export async function checkRedisHealth(): Promise<{ healthy: boolean; message: string }> {
  try {
    const redis = createRedisConnection();
    await redis.ping();
    await redis.quit();
    return { healthy: true, message: "Redis connection OK" };
  } catch (error) {
    return { 
      healthy: false, 
      message: error instanceof Error ? error.message : "Unknown Redis error" 
    };
  }
}
