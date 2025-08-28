"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { PiPlus } from "react-icons/pi"
import { useAgent } from "@/hooks/use-agent"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    allowWebsite: z.boolean(),
    allowPhone: z.boolean(),
})

type FormData = z.infer<typeof formSchema>

const defaultValues: FormData = {
    name: "",
    description: "",
    allowWebsite: true,
    allowPhone: false,
}

export default function NewAgent() {
    const [open, setOpen] = useState(false)
    const { createAgent } = useAgent()

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues,
    })

    const onSubmit = async (values: FormData) => {
        try {
            await createAgent(values)
            setOpen(false)
            form.reset(defaultValues)
        } catch (error) {
            console.error("Failed to create agent:", error)
        }
    }

    return (
        <>
            <Button 
                variant="outline"
                size="icon"
                onClick={() => setOpen(true)}
            >
                <PiPlus />
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Agent</DialogTitle>
                        <DialogDescription>
                            Create a new agent to handle conversations with your customers.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter agent name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Enter agent description" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex flex-col gap-4">
                                <FormField
                                    control={form.control}
                                    name="allowWebsite"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center p-2 border border-zinc-200 rounded-md justify-between">
                                            <div className="space-y-0.5">
                                                <FormLabel>Allow Website</FormLabel>
                                                <FormDescription>
                                                    Enable website conversations
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="allowPhone"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center p-2 border border-zinc-200 rounded-md justify-between">
                                            <div className="space-y-0.5">
                                                <FormLabel>Allow Phone</FormLabel>
                                                <FormDescription>
                                                    Enable phone conversations
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    Create Agent
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    )
}