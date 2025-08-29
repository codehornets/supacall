"use client"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAgent } from "@/hooks/use-agent"
import { useEffect, useState } from "react"
import Link from "next/link"
import { api } from "@/lib/api"
import { toast } from "sonner"
import UpsertContactPage from "./upsert"

interface Contact {
    id: string
    name?: string
    phone: string
    email?: string
}

export default function ContactsPage() {
    const [contacts, setContacts] = useState<Contact[]>([])
    const { selectedAgent } = useAgent()

    useEffect(() => {
        if (!selectedAgent) return
        fetchContacts()
    }, [selectedAgent])

    const fetchContacts = async () => {
        try {
            const res = await api.get(`/agents/${selectedAgent}/contacts`)
            setContacts(res.data)
        } catch (err) {
            console.error("Error fetching contacts:", err)
            toast.error("Failed to load contacts")
        }
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold">Contacts</h1>
                <UpsertContactPage />
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {contacts.map((contact) => (
                            <TableRow key={contact.id}>
                                <TableCell>{contact.name || '-'}</TableCell>
                                <TableCell>{contact.phone}</TableCell>
                                <TableCell>{contact.email || '-'}</TableCell>
                                <TableCell>
                                    <Link href={`/console/contacts/upsert?id=${contact.id}`}>
                                        <Button variant="ghost" size="sm">
                                            Edit
                                        </Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                        {contacts.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                                    No contacts found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}