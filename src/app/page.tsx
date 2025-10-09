import LoanDashboard from '@/components/loan-dashboard';

export default function Home() {
  return (
    <div className="min-h-screen w-full">
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <LoanDashboard />
      </main>
    </div>
  );
}
