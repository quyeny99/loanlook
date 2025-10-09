import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { LogOut, User as UserIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type User = {
  fullName: string;
  avatar: string;
};

export function LoanDashboardHeader() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    
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
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={user.avatar} alt={user.fullName} />
              <AvatarFallback>
                <UserIcon />
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{user.fullName}</span>
          </div>
        )}
        <Button variant="outline" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </CardHeader>
  );
}
