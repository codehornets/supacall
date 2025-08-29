"use client"

import React from "react"
import { PiBooksFill, PiChartDonutFill, PiChatsTeardropFill, PiGearFill, PiSpinner, PiToolboxFill, PiUsersFill } from "react-icons/pi"
import { usePathname, useRouter } from "next/navigation"
import Image from "next/image"
import { useAgent } from "@/hooks/use-agent"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import NewAgent from "./new-agent"

const routes = [
    {
        name: "Dashboard",
        icon: PiChartDonutFill,
        path: "/console/dashboard"
    },
    {
        name: "Conversations",
        icon: PiChatsTeardropFill,
        path: "/console/conversations"
    },
    {
        name: "Contacts",
        icon: PiUsersFill,
        path: "/console/contacts"
    },
    {
        name: "Knowledge Base",
        icon: PiBooksFill,
        path: "/console/knowledge-base"
    },
    {
        name: "Tools",
        icon: PiToolboxFill,
        path: "/console/tools"
    },
    {
        name: "Settings",
        icon: PiGearFill,
        path: "/console/settings"
    }
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const { agents, selectedAgent, setSelectedAgent, loading } = useAgent()
    const pathname = usePathname()

    return (
        <div className="w-screen h-screen flex">
            <div className="h-screen flex flex-col gap-3 pt-5 items-start px-3 w-[250px] border-r-[1px] border-zinc-200 flex-shrink-0">
                <Image src="/logo-full.svg" className="mb-2" alt="Supacall" width={150} height={75} />
                <div className="w-full flex gap-2">
                    <Select value={selectedAgent || ""} onValueChange={setSelectedAgent}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select an agent" />
                        </SelectTrigger>
                        <SelectContent>
                            {agents.map((agent) => (
                                <SelectItem key={agent.id} value={agent.id}>
                                    {agent.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <NewAgent />
                </div>
                <div className="flex flex-col gap-2 w-full">
                    {routes.map((route) => (
                        <button
                            key={route.path}
                            onClick={() => router.push(route.path)}
                            className={`p-2 w-full active:scale-95 flex flex-start items-center rounded-sm gap-2 hover:bg-zinc-200 transition-all text-[15px] ${pathname === route.path && "bg-zinc-200"}`}
                        >
                            <route.icon className="text-xl text-gray-600" />
                            {route.name}
                        </button>
                    ))}
                </div>
            </div>
            {/* Main Content */}
            <div style={{ width: "calc(100vw - 250px)" }} className="h-full overflow-x-hidden overflow-y-auto">
                {loading && <div className="flex justify-center items-center h-full">
                    <PiSpinner className="animate-spin text-lg" />
                </div>}
                {selectedAgent && !loading ? children : <div className="flex justify-center items-center h-full">
                    <p className="text-sm text-gray-500">No agent selected</p>
                </div>}
            </div>
        </div>
    )
}
