"use client"

import { Button } from "@/components/ui/button"
import { PiPlugs, PiTrash } from "react-icons/pi"
import Image from "next/image"
import { useState, useEffect } from "react";
import { useAgent } from "@/hooks/use-agent";
import { api } from "@/lib/api";
import { toast } from "sonner";
import AddMcpDialog from "./add";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function ToolsPage() {

    const [tools, setTools] = useState<any>(null);
    const { selectedAgent } = useAgent();
    const [calApiKey, setCalApiKey] = useState<string>("");

    useEffect(() => {
        if (!selectedAgent) return;
        fetchTools();
    }, [selectedAgent])

    const fetchTools = async () => {
        try {
            const response = await api.get(`/agents/${selectedAgent}/tools`);
            setTools(response.data);
            setCalApiKey(response.data.cal || "");
        } catch (error) {
            console.error("Error fetching tools:", error);
            toast.error("Failed to fetch tools");
        }
    }

    const handleDeleteMcp = async (endpoint: string) => {
        try {
            await api.delete(`/agents/${selectedAgent}/tools/mcp/${endpoint}`);
            fetchTools();
        } catch (error) {
            console.error("Error deleting MCP:", error);
            toast.error("Failed to delete MCP");
        }
    }

    const handleUpdateCalApiKey = async () => {
        try {
            await api.post(`/agents/${selectedAgent}/tools/cal`, { apiKey: calApiKey });
            fetchTools();
        } catch (error) {
            console.error("Error updating Cal API key:", error);
            toast.error("Failed to update Cal API key");
        }
    }

    return (
        <div>
            <div className="px-5 flex items-center justify-between border-b border-zinc-200 h-[50px]">
                <h1 className="text-lg font-medium">Tools</h1>
            </div>
            <div className="p-5">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-2 mb-2">
                    <h2 className="font-medium">MCP Providers</h2>
                    {selectedAgent && <AddMcpDialog selectedAgent={selectedAgent} onSuccess={fetchTools} />}
                </div>
                <div>
                    {tools && tools.mcp && tools.mcp.length > 0 ? tools.mcp.map((mcp: any, index: number) => (
                        <div key={`mcp-${index}`} className="flex items-center justify-between rounded-sm border border-zinc-200 p-4">
                            <h3>{mcp.endpoint}</h3>
                            <Button variant="destructive" onClick={() => handleDeleteMcp(mcp.endpoint)}>
                                <PiTrash />
                                Delete
                            </Button>
                        </div>
                    )) : <div>No MCP providers</div>}
                </div>
            </div>
            <div className="p-5 space-y-2">
                <h2 className="font-medium border-b border-zinc-200 pb-2 mb-2">Calender Providers</h2>
                <div className="flex items-center justify-between rounded-sm border border-zinc-200 p-4">
                    <div>
                        <Image src="/cal-logo.png" alt="Cal.com" width={100} height={100} />
                    </div>
                    <Dialog>
                        <DialogTrigger asChild>
                            {calApiKey ? <Button>
                                <PiPlugs />
                                Edit Connection
                            </Button> : <Button>
                                <PiPlugs />
                                Connect
                            </Button>}
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                Cal API Key
                            </DialogHeader>
                            <div className="space-y-2">
                                <Label>API Key</Label>
                                <Input value={calApiKey} onChange={(e) => setCalApiKey(e.target.value)} />
                            </div>
                            <DialogFooter>
                                <Button onClick={handleUpdateCalApiKey}>Save</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                </div>
                <div className="flex items-center justify-between rounded-sm border border-zinc-200 p-4">
                    <div>
                        <Image src="/calendly-logo.png" alt="Calendly" width={100} height={100} />
                    </div>
                    <Button>
                        <PiPlugs />
                        Connect
                    </Button>
                </div>
            </div>
        </div>
    )
}
