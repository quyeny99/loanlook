import { AuthProvider } from '@/context/AuthContext';
import Header from '@/components/header';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <Header />
      <div className="pt-24 p-6 sm:p-8">{children}</div>
    </AuthProvider>
  );
}
