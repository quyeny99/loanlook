
'use client';

import { LogOut, BarChart2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

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
    <header className="fixed top-0 left-0 right-0 z-50 flex flex-row items-center justify-between border-b bg-background p-4">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
            <Image
                src="https://drive.google.com/uc?id=1P0wjUyetjh_7ERCxjmhWARWi8Ig1qng5"
                alt="Company Logo"
                width={60}
                height={60}
                priority
            />
            <span className="text-3xl font-bold font-headline">
                Loan
            </span>
        </Link>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost">
                    <BarChart2 className="mr-2 h-4 w-4" />
                    Reports
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onSelect={() => router.push('/reports')}>1. Theo ngày</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => router.push('/reports/monthly')}>2. Monthly</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => router.push('/reports/date-range')}>3. Date Range</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </header>
  );
}

    