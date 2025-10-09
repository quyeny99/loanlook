'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const filter = JSON.stringify({
        username: values.email,
        password: values.password,
      });
      const valuesParam = 'id,username,password,avatar,fullname,display_name,type__code,type__name,blocked,block_reason,block_reason__code,block_reason__name,blocked_by,last_login,auth_method,auth_method__code,auth_method__name,auth_status,auth_status__code,auth_status__name,register_method,register_method__code,register_method__name,create_time,update_time';
      const url = `https://api.y99.vn/login/?values=${valuesParam}&filter=${encodeURIComponent(
        filter
      )}`;

      const response = await fetch(url);
      
      if (!response.ok) {
        form.setError('password', {
          type: 'manual',
          message: 'Invalid email or password.',
        });
        return;
      }
      
      const data = await response.json();

      if (!data.rows || data.rows.length === 0) {
        form.setError('password', {
          type: 'manual',
          message: 'Invalid email or password.',
        });
        return;
      }
      
      localStorage.setItem('isAuthenticated', 'true');

      toast({
        title: 'Success',
        description: 'You have successfully logged in.',
      });
      router.push('/');
      router.refresh();
    } catch (error: any) {
      console.error('Login Error:', error);
       toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'An unexpected error occurred. Please try again.',
      });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
