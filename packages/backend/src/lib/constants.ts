export const SERVER_PORT = process.env.SERVER_PORT || 8080;
export const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
export const JWT_SECRET = process.env.JWT_SECRET || "";

// Knowledge Base Constants
export const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
export const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];

// Queue Names
export const INDEXING_QUEUE = "kb-indexing-queue";

// AWS S3 Configuration
export const AWS_S3_ACCESS_KEY_ID = process.env.AWS_S3_ACCESS_KEY_ID || ""
export const AWS_S3_SECRET_ACCESS_KEY = process.env.AWS_S3_SECRET_ACCESS_KEY || ""
export const AWS_S3_ENDPOINT_URL = process.env.AWS_S3_ENDPOINT_URL
export const AWS_STORAGE_BUCKET_NAME = process.env.AWS_STORAGE_BUCKET_NAME || ""

// Weaviate Configuration
export const WEAVIATE_URL = process.env.WEAVIATE_URL || ""
export const WEAVIATE_API_KEY = process.env.WEAVIATE_API_KEY || ""
export const WEAVIATE_LOCAL_URL = process.env.WEAVIATE_LOCAL_URL || ""

// Twilio Configuration
export const TWILIO_WEBHOOK_DOMAIN = process.env.TWILIO_WEBHOOK_DOMAIN || ""

// OpenAI Configuration
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ""