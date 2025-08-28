import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getUniqueFileName } from "./filename";
import { AWS_S3_ACCESS_KEY_ID, AWS_S3_SECRET_ACCESS_KEY, AWS_S3_ENDPOINT_URL, AWS_STORAGE_BUCKET_NAME } from "./constants"

export async function getPresignedUrlForUpload(filename: string) {
  const s3 = new S3Client({
    credentials: {
      accessKeyId: AWS_S3_ACCESS_KEY_ID,
      secretAccessKey: AWS_S3_SECRET_ACCESS_KEY
    },
    region: "us-east-1",
    endpoint: AWS_S3_ENDPOINT_URL,
    apiVersion: "v4"
  });

  filename = getUniqueFileName(filename);

  const command = new PutObjectCommand({
    Bucket: AWS_STORAGE_BUCKET_NAME,
    Key: filename,
    ContentType: 'application/octet-stream'
  })

  const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

  return { filename: filename, url: url };

}

export async function getPresignedUrlForGet(filename: string) {
  const s3 = new S3Client({
    credentials: {
      accessKeyId: AWS_S3_ACCESS_KEY_ID,
      secretAccessKey: AWS_S3_SECRET_ACCESS_KEY
    },
    region: "us-east-1",
    endpoint: AWS_S3_ENDPOINT_URL,
    apiVersion: "v4"
  });

  const command = new GetObjectCommand({
    Bucket: AWS_STORAGE_BUCKET_NAME,
    Key: filename,
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

  return {
    filename: filename,
    url: url
  };

}