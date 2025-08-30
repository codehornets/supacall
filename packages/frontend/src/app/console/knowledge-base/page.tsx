"use client";

import { UploadDocument } from "./upload-document";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PiSpinner, PiTrash } from "react-icons/pi";
import { useAgent } from "@/hooks/use-agent";

export default function KnowledgeBasePage() {

  const [data, setData] = useState<any[]>([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { selectedAgent } = useAgent();

  const fetchKnowledgeBase = async () => {
    try {
      if (!selectedAgent) return;
      const response = await api.get(`/agents/${selectedAgent}/knowledge-base`);
      setData(response.data);
    } catch (error) {
      toast.error("Failed to fetch documents");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (!selectedAgent) return; 
      setIsDeleting(id);
      await api.delete(`/agents/${selectedAgent}/knowledge-base/${id}`);
      toast.success("Document deleted successfully");
      fetchKnowledgeBase();
    } catch (error) {
      toast.error("Failed to delete document");
    } finally {
      setIsDeleting(null);
    }
  };

  useEffect(() => {
    fetchKnowledgeBase();
  }, []);


  return (
    <div>
      <div className="px-5 flex items-center justify-between border-b border-zinc-200 h-[50px]">
        <h1 className="text-lg font-medium">Knowledge Base</h1>
        {selectedAgent && <UploadDocument agentId={selectedAgent} />}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Upload Date</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item: any) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.file.replace(/^\d{4}_\d{6}_\d{6}_/, '')}</TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${item.indexStatus === "COMPLETED"
                    ? "bg-green-100 text-green-800"
                    : item.indexStatus === "FAILED"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                    }`}
                >
                  {item.indexStatus.toLowerCase()}
                </span>
              </TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(item.createdAt), {
                  addSuffix: true,
                })}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(item.id)}
                  disabled={isDeleting === item.id}
                >
                  {isDeleting === item.id ? (
                    <PiSpinner className="animate-spin" />
                  ) : (
                    <PiTrash />
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
