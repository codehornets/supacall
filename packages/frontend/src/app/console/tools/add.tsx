"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { zodResolver } from "@hookform/resolvers/zod"
import { PiPlus } from "react-icons/pi"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { useState } from "react"

const mcpFormSchema = z.object({
    endpoint: z.string().min(1, "Endpoint is required"),
    authToken: z.string().optional(),
})

type McpFormValues = z.infer<typeof mcpFormSchema>


export default function AddMcpDialog({ selectedAgent, onSuccess }: { selectedAgent: string, onSuccess: () => void }) {

    const [open, setOpen] = useState(false)

    const form = useForm<McpFormValues>({
        resolver: zodResolver(mcpFormSchema),
        defaultValues: {
            endpoint: "",
            authToken: "",
        },
    })

    const onSubmit = async (data: McpFormValues) => {
        try {
            await api.post(`/agents/${selectedAgent}/tools/mcp`, data)
            toast.success("MCP added successfully")
            onSuccess()
            setOpen(false)
            form.reset({
                endpoint: "",
                authToken: "",
            })
        } catch (err) {
            console.error(err)
            toast.error("Failed to add MCP")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PiPlus />
                    Add MCP
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add MCP</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="endpoint"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Endpoint</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://api.mcp.server/endpoint" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="authToken"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Auth Token (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter auth token" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit">Add MCP</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}