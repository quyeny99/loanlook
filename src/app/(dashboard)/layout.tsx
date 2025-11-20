import Header from "@/components/header";
import { AuthGuard } from "@/components/auth-guard";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <div>
        <Header />
        <div className="pt-24 mt-16 p-6 sm:p-8">{children}</div>
      </div>
    </AuthGuard>
  );
}
