import { INDEXING_QUEUE, REDIS_URL } from "./lib/constants";
import { Worker } from "bullmq";
import { IndexerService } from "./services/indexer.service";

// Create the worker to process indexing jobs
export const indexingWorker = new Worker<{ documentId: string }>(
    INDEXING_QUEUE,
    async (job) => {
        const { documentId } = job.data;

        try {
            // TODO: Implement actual file processing and indexing logic here
            console.log(`Processing document ${documentId}`);

            await IndexerService.indexKnowledgeBase(documentId);

            return { success: true, documentId };
        } catch (error) {
            console.error(`Error processing document ${documentId}:`, error);
            throw error;
        }
    },
    {
        connection: {
            url: REDIS_URL,
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

process.on("SIGINT", async () => {
    console.log("SIGINT signal received. Shutting down gracefully...");
    await indexingWorker.close();
    process.exit(0);
});

process.on("SIGTERM", async () => {
    console.log("SIGTERM signal received. Shutting down gracefully...");
    await indexingWorker.close();
    process.exit(0);
});