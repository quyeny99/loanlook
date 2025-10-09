import Header from '@/components/header';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <Header />
      <div className="pt-24 p-6 sm:p-8">{children}</div>
    </div>
  );
}
