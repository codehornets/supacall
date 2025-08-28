"use client"

import React from "react"
import { PiGearFill } from "react-icons/pi"
import { useRouter } from "next/navigation"
import Image from "next/image"

const routes = [
    {
        name: "Settings",
        icon: PiGearFill,
        path: "/console/settings"
    }
]


export default function AppLayout({ page, children }: { page: string, children: React.ReactNode }) {
    const router = useRouter()

    return (
        <div className="w-screen h-screen flex">
            <div className="h-screen flex flex-col items-center w-[60px] border-r-[1px] border-zinc-200 flex-shrink-0">
                <Image src="/logo.svg" className="mb-2" alt="Manyreply" width={25} height={25} />
                {routes.map((route) => (
                    <button onClick={() => router.push(route.path)} className={`p-2 active:scale-95 flex flex-start items-center rounded-sm gap-2 hover:bg-zinc-200 transition-all text-[15px] ${page === route.name.toLowerCase() && "bg-zinc-200"}`}><route.icon className="text-xl text-gray-600" /></button>
                ))}
            </div>
            <div style={{ width: "calc(100vw - 60px)" }} className="h-full overflow-x-hidden overflow-y-auto">
                {children}
            </div>
        </div>
    )
}
