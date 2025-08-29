import { Queue } from "bullmq";
import { REDIS_URL, INDEXING_QUEUE } from "./constants";


// Create the indexing queue
export const indexingQueue = new Queue<{ documentId: string }>(INDEXING_QUEUE, {
  connection: {
    url: REDIS_URL,
  },
});
