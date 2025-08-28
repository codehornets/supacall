import { Queue, Worker } from "bullmq";
import { REDIS_URL, INDEXING_QUEUE } from "./constants";

interface IndexingJobData {
  documentId: string;
  file: string;
  agentId: string;
}

// Create the indexing queue
export const indexingQueue = new Queue<IndexingJobData>(INDEXING_QUEUE, {
  connection: {
    host: new URL(REDIS_URL).hostname,
    port: parseInt(new URL(REDIS_URL).port),
  },
});

// Create the worker to process indexing jobs
export const indexingWorker = new Worker<IndexingJobData>(
  INDEXING_QUEUE,
  async (job) => {
    const { documentId, file, agentId } = job.data;
    
    try {
      // TODO: Implement actual file processing and indexing logic here
      console.log(`Processing document ${documentId} at ${file} for agent ${agentId}`);
      
      // Example processing steps:
      // 1. Read the file
      // 2. Extract text content
      // 3. Split into chunks
      // 4. Generate embeddings
      // 5. Store in vector database
      
      await job.updateProgress(100);
      return { success: true, documentId };
    } catch (error) {
      console.error(`Error processing document ${documentId}:`, error);
      throw error;
    }
  },
  {
    connection: {
      host: new URL(REDIS_URL).hostname,
      port: parseInt(new URL(REDIS_URL).port),
    },
    concurrency: 2, // Process 2 files at a time
  }
);

// Handle worker events
indexingWorker.on("completed", (job) => {
  console.log(`Completed processing document ${job.data.documentId}`);
});

indexingWorker.on("failed", (job, error) => {
  console.error(`Failed processing document ${job?.data.documentId}:`, error);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  await indexingWorker.close();
  await indexingQueue.close();
});
