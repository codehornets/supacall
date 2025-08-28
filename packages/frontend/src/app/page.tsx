"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { PiSpinner } from "react-icons/pi";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      if (user && user.isVerified) {
        router.push("/console")
      } else {
        router.push("/auth/verify");
      }
    } else {
      router.push("/auth/login");
    }
  }, [isAuthenticated, user]);


  return <div className="flex items-center justify-center h-screen"><PiSpinner className="text-lg animate-spin" /></div>
}
