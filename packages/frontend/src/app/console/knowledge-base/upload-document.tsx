"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, Upload } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const uploadSchema = z.object({
  file: z
    .any()
    .refine((v): v is FileList => v instanceof FileList, "Invalid file input")
    .refine((files: FileList) => files.length > 0, "Please select a file")
    .transform((files: FileList) => files[0])
    .refine(
      (file: File) => file.size <= MAX_FILE_SIZE,
      "File size must be less than 10MB"
    )
    .refine(
      (file: File) => ALLOWED_FILE_TYPES.includes(file.type),
      "File type not supported"
    ),
});

type UploadFormSchema = z.infer<typeof uploadSchema>;

interface UploadDocumentProps {
  agentId: string;
}

export function UploadDocument({ agentId }: UploadDocumentProps) {
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<UploadFormSchema>({
    resolver: zodResolver(uploadSchema),
  });

  const handleUpload = async (data: UploadFormSchema) => {
    try {
      setIsUploading(true);
      
      const presignedUrlResponse = await api.get("/files/presigned-url-for-upload", {
        params: { filename: data.file.name }
      });

      const awsFileName = presignedUrlResponse.data.filename;
      const presignedUrl = presignedUrlResponse.data.url;

      // Upload to S3
      await fetch(presignedUrl, {
        method: "PUT",
        body: data.file,
        headers: {
          "Content-Type": data.file.type
        }
      });

      // Create document in knowledge base
      await api.post(`/knowledge-base/${agentId}`, {
        name: awsFileName
      });

      toast.success("Document uploaded successfully");
      setOpen(false);
      form.reset();
      
      // Trigger table refresh
      const event = new CustomEvent("documentUploaded");
      window.dispatchEvent(event);
    } catch (error) {
      toast.error("Failed to upload document");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload a document to your knowledge base. Supported formats: PDF, TXT,
            MD, DOCX. Maximum size: 10MB.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleUpload)} className="space-y-4">
            <FormField
              control={form.control}
              name="file"
              render={({ field: { onChange }, ...field }) => (
                <FormItem>
                  <FormLabel>File</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept={ALLOWED_FILE_TYPES.join(",")}
                      onChange={(e) => onChange(e.target.files)}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="submit"
                disabled={isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Upload"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}