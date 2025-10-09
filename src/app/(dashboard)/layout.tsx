import { LoanDashboardHeader } from "@/components/loan-dashboard-header";


export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
        <LoanDashboardHeader></LoanDashboardHeader>
        <div>{children}</div>
    </div>
  );
}
