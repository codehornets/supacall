"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PiSpinner } from "react-icons/pi";

export default function ConsolePage() {

    const router = useRouter();

    useEffect(() => {
        router.push("/console/dashboard");
    }, [])

    return <div className="flex items-center justify-center h-screen"><PiSpinner className="text-lg animate-spin" /></div>

}
