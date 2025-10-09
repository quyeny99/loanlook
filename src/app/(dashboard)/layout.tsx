import Header from '@/components/header';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <Header />
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  );
}
