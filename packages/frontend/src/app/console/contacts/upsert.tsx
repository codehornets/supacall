"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAgent } from "@/hooks/use-agent"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { PiPencil, PiPlus } from "react-icons/pi"

const contactFormSchema = z.object({
    name: z.string().optional(),
    phone: z.string()
        .min(1, "Phone number is required")
        .regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number"),
    email: z.email("Please enter a valid email").optional().or(z.literal("")),
})

type ContactFormValues = z.infer<typeof contactFormSchema>

export default function UpsertContactPage({ contactId, editContact, onSuccess }: { contactId: string | null, editContact: ContactFormValues | null, onSuccess: () => void }) {
    const router = useRouter()
    const { selectedAgent } = useAgent()
    const [open, setOpen] = useState(false)

    const form = useForm<ContactFormValues>({
        resolver: zodResolver(contactFormSchema),
        defaultValues: {
            name: "",
            phone: "",
            email: "",
        },
    })

    useEffect(() => {
        if (contactId) {
            form.reset({
                name: editContact?.name || "",
                phone: editContact?.phone || "",
                email: editContact?.email || "",
            })
        } else if (editContact) {
            form.reset(editContact)
        }
    }, [contactId, editContact, form])

    const onSubmit = async (data: ContactFormValues) => {
        if (!selectedAgent) return

        try {
            await api.post(`/agents/${selectedAgent}/contacts`, contactId ? { contactId: contactId, ...data } : data)
            toast.success(contactId ? "Contact updated successfully" : "Contact created successfully")
            onSuccess()
            setOpen(false)
            form.reset({
                name: "",
                phone: "",
                email: "",
            })
        } catch (error) {
            console.error("Error saving contact:", error)
            toast.error("Failed to save contact")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={contactId ? "outline" : "default"}>
                    {contactId ? <PiPencil /> : <PiPlus />}
                    {contactId ? "Edit Contact" : "New Contact"}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{contactId ? "Edit Contact" : "New Contact"}</DialogTitle>
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
                                        <Input placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone</FormLabel>
                                    <FormControl>
                                        <Input placeholder="+1234567890" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="john@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => router.back()}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                {contactId ? "Save Changes" : "Create Contact"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}