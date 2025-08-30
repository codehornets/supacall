"use client"

import { useEffect, useState } from "react"
import { useAgent } from "@/hooks/use-agent"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"

interface Message {
    id: string
    content: string
    role: "user" | "assistant"
    createdAt: string
}

interface Conversation {
    id: string
    messages: Message[]
    contactName?: string
    contactPhone: string
    updatedAt: string
}

export default function ConversationsPage() {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
    const { selectedAgent } = useAgent()

    useEffect(() => {
        if (!selectedAgent) return
        fetchConversations()
    }, [selectedAgent])

    const fetchConversations = async () => {
        const response = await api.get(`/agents/${selectedAgent}/conversations`)
        setConversations(response.data)
        if (response.data.length > 0 && !selectedConversation) {
            setSelectedConversation(response.data[0])
        }
    }

    return (
        <div className="flex h-full">
            {/* Conversation List */}
            <div className="w-[300px] border-r">
                <ScrollArea className="h-full">
                    <div>
                        <h2 className="font-medium py-2 px-2 border-b border-zinc-200">Conversations</h2>
                        <div className="space-y-2">
                            {conversations.map((conversation) => (
                                <button
                                    key={conversation.id}
                                    onClick={() => setSelectedConversation(conversation)}
                                    className={cn(
                                        "w-full text-left p-3 rounded-lg hover:bg-muted transition-colors",
                                        selectedConversation?.id === conversation.id && "bg-muted"
                                    )}
                                >
                                    <div className="font-medium">
                                        {conversation.contactName || conversation.contactPhone}
                                    </div>
                                    <div className="text-sm text-muted-foreground truncate">
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
            <div className="flex-1 flex flex-col">
                {selectedConversation ? (
                    <>
                        {/* Header */}
                        <div className="border-b p-4">
                            <h2 className="font-semibold">
                                {selectedConversation.contactName || selectedConversation.contactPhone}
                            </h2>
                        </div>

                        {/* Messages */}
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-4">
                                {selectedConversation.messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={cn(
                                            "max-w-[80%] p-4 rounded-lg",
                                            message.role === "user"
                                                ? "bg-primary text-primary-foreground ml-auto"
                                                : "bg-muted"
                                        )}
                                    >
                                        {message.content}
                                        <div className="text-xs opacity-70 mt-1">
                                            {new Date(message.createdAt).toLocaleTimeString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                        Select a conversation to view messages
                    </div>
                )}
            </div>
        </div>
    )
}
