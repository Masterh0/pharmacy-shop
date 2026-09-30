// app/manager/layout.tsx
import { AuthGuard } from "@/src/components/guards/AuthGuard";

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRole="ADMIN" redirectTo="/login">
      <div className="flex h-screen">
        
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </AuthGuard>
  );
}
