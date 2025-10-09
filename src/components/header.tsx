'use client';

import { LogOut } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { CardHeader, CardTitle } from './ui/card';
import { useToast } from '@/hooks/use-toast';

export default function Header() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = () => {
    localStorage.removeItem('isAuthenticated');

    toast({
      title: 'Signed Out',
      description: 'You have been successfully signed out.',
    });

    router.push('/login');
    router.refresh();
  };

  return (
    <CardHeader className="flex flex-row items-center justify-between border-b">
      <div>
        <CardTitle className="text-3xl font-bold font-headline flex items-center gap-1">
          <Image
            src="https://drive.google.com/uc?id=1P0wjUyetjh_7ERCxjmhWARWi8Ig1qng5"
            alt="Company Logo"
            width={60}
            height={60}
            priority
          />
          <div>Loan</div>
        </CardTitle>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </CardHeader>
  );
}
