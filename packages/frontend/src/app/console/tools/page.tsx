"use client"

import { Button } from "@/components/ui/button"
import { PiPlugs, PiPlus } from "react-icons/pi"
import Image from "next/image"

export default function ToolsPage() {
    return (
        <div>
            <div className="px-5 flex items-center justify-between border-b border-zinc-200 h-[50px]">
                <h1 className="text-lg font-medium">Tools</h1>
            </div>
            <div className="p-5">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-2 mb-2">
                    <h2 className="font-medium">MCP Providers</h2>
                    <Button>
                        <PiPlus />
                        Add MCP
                    </Button>
                </div>
                <div>

                </div>
            </div>
            <div className="p-5 space-y-2">
                <h2 className="font-medium border-b border-zinc-200 pb-2 mb-2">Calender Providers</h2>
                <div className="flex items-center justify-between rounded-sm border border-zinc-200 p-4">
                    <div>
                        <Image src="/cal-logo.png" alt="Cal.com" width={100} height={100} />
                    </div>
                    <Button>
                        <PiPlugs />
                        Connect
                    </Button>
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
