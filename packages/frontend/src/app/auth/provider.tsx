"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, user } = useAuth();

    useEffect(() => {
        // If authenticated, redirect to console
        if (isAuthenticated && user && user.isVerified) {
            router.push("/console");
        }
        if (isAuthenticated && user && !user.isVerified && pathname !== "/auth/verify") {
            router.push("/auth/verify");
        }
    }, [isAuthenticated, user]);

    // Only render children (auth pages) if not authenticated
    return (!isAuthenticated || (isAuthenticated && user && !user.isVerified)) ? <>{children}</> : null;
}
