import AppLayout from "@/components/shared/layout";
import ConsoleProvider from "./provider";

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
    return (
        <ConsoleProvider>
            <AppLayout>
                {children}
            </AppLayout>
        </ConsoleProvider>
    )
}