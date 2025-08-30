"use client"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAgent } from "@/hooks/use-agent"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import UpsertContactPage from "./upsert"
import { PiTrash } from "react-icons/pi"

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

    const deleteContact = async (contactId: string) => {
        try {
            await api.delete(`/agents/${selectedAgent}/contacts/${contactId}`)
            toast.success("Contact deleted successfully")
            fetchContacts()
        } catch (err) {
            console.error("Error deleting contact:", err)
            toast.error("Failed to delete contact")
        }
    }

    return (
        <div>
            <div className="px-5 flex items-center justify-between border-b border-zinc-200 h-[50px]">
                <h1 className="text-lg font-medium">Contacts</h1>
                <UpsertContactPage onSuccess={fetchContacts} contactId={null} editContact={null} />
            </div>

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
                            <TableCell className="flex items-center gap-2">
                                <UpsertContactPage contactId={contact.id} editContact={{ name: contact.name || "", phone: contact.phone, email: contact.email || "" }} onSuccess={fetchContacts} />
                                <Button variant="destructive" size="icon" onClick={() => deleteContact(contact.id)}><PiTrash /></Button>
                            </TableCell>
                        </TableRow>
                    ))}
                    {contacts.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="text-muted-foreground">
                                No contacts found
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div >
    )
}