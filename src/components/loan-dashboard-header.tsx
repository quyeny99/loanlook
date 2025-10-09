import { useRouter } from 'next/navigation';
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { LogOut } from 'lucide-react';

export function LoanDashboardHeader() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = () => {
    // Remove the authentication flag from localStorage
    localStorage.removeItem('isAuthenticated');
    
    toast({
      title: 'Signed Out',
      description: 'You have been successfully signed out.',
    });
    
    router.push('/login');
    router.refresh();
  };

  return (
    <CardHeader className="flex flex-row items-center justify-between">
      <div>
        <CardTitle className="text-3xl font-bold font-headline">
          LoanLook
        </CardTitle>
        <CardDescription>
          Manage and track all your loan data in one place.
        </CardDescription>
      </div>
       <Button variant="outline" onClick={handleSignOut}>
        <LogOut className="mr-2 h-4 w-4" />
        Sign Out
      </Button>
    </CardHeader>
  );
}
