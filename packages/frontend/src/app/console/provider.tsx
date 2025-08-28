"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export default function ConsoleProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { isAuthenticated, user } = useAuth();

    useEffect(() => {
        // If not authenticated, redirect to login
        if (!isAuthenticated) {
            router.push("/auth/login");
            return;
        }

        // If authenticated but not verified, redirect to verification
        if (isAuthenticated && user && !user.isVerified) {
            router.push("/auth/verify");
        }
    }, [isAuthenticated, user, router]);

    // Only render children (console pages) if authenticated and verified
    return (isAuthenticated && user && user.isVerified) ? <>{children}</> : null;
}
