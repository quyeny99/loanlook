import {
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function LoanDashboardHeader() {
  return (
    <CardHeader>
      <CardTitle className="text-3xl font-bold font-headline">
        LoanLook
      </CardTitle>
      <CardDescription>
        Manage and track all your loan data in one place.
      </CardDescription>
    </CardHeader>
  );
}
