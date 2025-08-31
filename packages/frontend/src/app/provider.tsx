'use client';

import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/sonner";
import { PiSpinner } from "react-icons/pi";

export default function AppProvider({ children }: { children: React.ReactNode }) {
    const { init, isLoading, isInitialized } = useAuth();

    useEffect(() => {
        init();
    }, []);

    if (isLoading || !isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <PiSpinner className="text-lg animate-spin" />
            </div>
        );
    }

    return (
        <>
            {children}
            <Toaster />
        </>
    );
}
