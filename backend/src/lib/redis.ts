import Redis from "ioredis";
import { Queue } from "bullmq";

export const redisConnection = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
  maxRetriesPerRequest: null,
});

export const notificationQueue = new Queue("notifications", {
  connection: redisConnection as any,
});

export const applicationEventsQueue = new Queue("application_events", {
  connection: redisConnection as any,
  defaultJobOptions: {
    attempts: 3,
  }
});
