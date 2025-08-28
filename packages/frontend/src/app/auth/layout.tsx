import AuthProvider from "./provider";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 shadow-sm border-[1px] border-zinc-200 rounded-lg p-8">
          {children}
        </div>
      </div>
    </AuthProvider>
  );
}
