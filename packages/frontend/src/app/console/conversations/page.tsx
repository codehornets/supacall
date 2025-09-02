"use client"

import { useEffect, useState } from "react"
import { useAgent } from "@/hooks/use-agent"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import { PiCircleFill, PiPaperPlaneRight, PiPhoneCall } from "react-icons/pi"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { startCase } from "lodash"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface Message {
    content: string
    role: "user" | "assistant"
    timestamp: string
}

interface Contact {
    id: string
    name: string
    phone: string
}

interface Conversation {
    id: string
    messages: Message[]
    contact: Contact
    updatedAt: string
    isLive: boolean
}

export default function ConversationsPage() {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [selectedConversation, setSelectedConversation] = useState<number>(-1)
    const { selectedAgent } = useAgent()
    const [dialPhone, setDialPhone] = useState<string>("")
    const [dialPhoneDialogOpen, setDialPhoneDialogOpen] = useState<boolean>(false)

    useEffect(() => {
        if (!selectedAgent) return
        fetchConversations()
    }, [selectedAgent])

    const fetchConversations = async () => {
        try {
            const response = await api.get(`/agents/${selectedAgent}/conversations`)
            setConversations(response.data)
            if (response.data.length > 0 && !selectedConversation) {
                setSelectedConversation(response.data[0])
            }
        } catch (err) {
            console.log(err)
        }
    }

    const handleDial = async () => {
        const toastId = toast.loading("Dialing phone number...")
        setDialPhoneDialogOpen(false)
        setDialPhone("")
        try {
            await api.post(`/phone-calls/outbound-call`, {
                phoneNumber: dialPhone,
                agentId: selectedAgent
            })
            toast.success("Phone number dialed successfully", { id: toastId })
        } catch (err) {
            console.error("Error dialing phone number:", err)
            toast.error("Failed to dial phone number", { id: toastId })
        }
    }

    return (
        <div className="flex h-full">
            {/* Conversation List */}
            <div className="w-[300px] border-r">
                <ScrollArea className="h-full">
                    <div>
                        <div className="flex items-center justify-between border-b border-zinc-200 py-2 px-2">
                            <h2 className="font-medium ">Conversations</h2>
                            <Dialog open={dialPhoneDialogOpen} onOpenChange={setDialPhoneDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="icon">
                                        <PiPhoneCall />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>Dial a number</DialogHeader>
                                    <DialogDescription>
                                        Dial a phone number to start a new conversation.
                                    </DialogDescription>
                                    <div className="space-y-2">
                                        <Label>Phone Number</Label>
                                        <Input placeholder="Enter a phone number" value={dialPhone} onChange={(e) => setDialPhone(e.target.value)} />
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={handleDial}>Dial</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <div>
                            {conversations.map((conversation, index) => (
                                <button
                                    key={conversation.id}
                                    onClick={() => setSelectedConversation(index)}
                                    className={cn(
                                        "w-full text-left p-3 hover:bg-muted transition-colors border-b border-zinc-200",
                                        selectedConversation === index && "bg-muted"
                                    )}
                                >
                                    <div className="font-medium flex items-center gap-2">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                {conversation.isLive && <PiCircleFill className="text-green-500 animate-pulse border-2 text-sm border-green-500 rounded-full" />}
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                {conversation.isLive ? "Live" : "Not Live"}
                                            </TooltipContent>
                                        </Tooltip>
                                        {conversation.contact.name || conversation.contact.phone}
                                    </div>
                                    <div className="text-sm text-muted-foreground truncate overflow-hidden max-w-[250px] text-ellipsis">
                                        {conversation.messages[conversation.messages.length - 1]?.content || "No messages"}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {new Date(conversation.updatedAt).toLocaleDateString()}
                                    </div>
                                </button>
                            ))}
                            {conversations.length === 0 && (
                                <div className="text-muted-foreground px-4 py-4">
                                    No conversations yet
                                </div>
                            )}
                        </div>
                    </div>
                </ScrollArea>
            </div>

            {/* Conversation View */}
            <div className="h-full w-[calc(100%-300px)]">
                {conversations[selectedConversation] ? (
                    <>
                        {/* Header */}
                        <div className="border-b h-[50px] flex items-center justify-between px-4">
                            <div className="flex items-center gap-2">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        {conversations[selectedConversation].isLive && <PiCircleFill className="text-green-500 animate-pulse text-sm border-2 border-green-500 rounded-full" />}
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {conversations[selectedConversation].isLive ? "Live" : "Not Live"}
                                    </TooltipContent>
                                </Tooltip>
                                <h2 className="font-semibold">
                                    {conversations[selectedConversation].contact.name || conversations[selectedConversation].contact.phone}
                                </h2>
                            </div>
                            <Button disabled={!conversations[selectedConversation].isLive} variant="outline">
                                <PiPhoneCall />
                                Dial In
                            </Button>
                        </div>

                        {/* Messages */}
                        <div className={`${conversations[selectedConversation].isLive ? "h-[calc(100vh-150px)]" : "h-[calc(100vh-50px)]"} p-5 space-y-4 overflow-y-auto overflow-x-hidden`}>
                            {conversations[selectedConversation].messages.map((message, index) => (
                                <div key={`msg-${index}`}>
                                    <p className={cn(
                                        "text-xs max-w-[80%] text-muted-foreground",
                                        message.role === "assistant" ?
                                            "text-primary ml-auto" :
                                            "text-muted-foreground"
                                    )}>{startCase(message.role)}</p>
                                    <div
                                        className={cn(
                                            "max-w-[80%] p-4 rounded-lg",
                                            message.role === "assistant"
                                                ? "bg-primary text-primary-foreground ml-auto"
                                                : "bg-muted"
                                        )}
                                    >
                                        {message.content}
                                        <div className="text-xs opacity-70 mt-1">
                                            {new Date(message.timestamp).toLocaleTimeString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input */}
                        {conversations[selectedConversation].isLive && <div className={`h-[100px] border-t border-zinc-200 flex items-end justify-end p-3`}>
                            <div className="h-full w-full">
                                <textarea placeholder="Type a message" className="w-full resize-none outline-none" />
                            </div>
                            <Button size="icon"><PiPaperPlaneRight /></Button>
                        </div>}
                    </>
                ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                        Select a conversation to view messages
                    </div>
                )}
            </div>
        </div>
    )
}
