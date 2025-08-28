import ConsoleProvider from "./provider";

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
    return (
        <ConsoleProvider>
            {children}
        </ConsoleProvider>
    )
}