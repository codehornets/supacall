"use client"

import { useAgent } from "@/hooks/use-agent";
import { api } from "@/lib/api";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PiSpinner } from "react-icons/pi";

export default function OAuthCompletePage() {

    const { slug } = useParams();
    const search = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const router = useRouter();
    const { selectedAgent } = useAgent();


    useEffect(() => {
        if (slug) {
            completeOAuth(slug as string)
        }
    }, [slug])

    const completeOAuth = async (slug: string) => {
        try {
            await api.post(`/agents/${selectedAgent}/tools/oauth-complete`, { code: search.get('code'), provider: slug })
            router.push(`/console/tools/settings`)
        } catch (error) {
            console.error(error)
            setError(true)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col gap-3 items-center justify-center h-screen">
                <PiSpinner className="text-lg animate-spin" />
                <h1>Connecting to {slug}...</h1>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <h1>Some error occured. Unable to connect to {slug}</h1>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1>Redirecting to settings page...</h1>
        </div>
    )

}