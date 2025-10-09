import LoanDashboard from '@/components/loan-dashboard';

export default function Home() {
  return (
    <div className="min-h-screen w-full">
      <main className="mx-auto px-2 py-4 sm:px-4 lg:px-6">
        <LoanDashboard />
      </main>
    </div>
  );
}
