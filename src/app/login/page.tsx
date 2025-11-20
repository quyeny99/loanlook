"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { signIn } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  // Redirect if already logged in
  useEffect(() => {
    const checkAuth = () => {
      const userId = localStorage.getItem("userId");
      if (userId) {
        router.replace("/");
        return;
      }
      setIsChecking(false);
    };

    // Check immediately
    checkAuth();

    // Set timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setIsChecking(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Show loading if checking authentication
  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const filter = JSON.stringify({
        username: values.email,
        password: values.password,
      });
      const valuesParam =
        "id,username,password,avatar,fullname,display_name,type__code,type__name,blocked,block_reason,block_reason__code,block_reason__name,blocked_by,last_login,auth_method,auth_method__code,auth_method__name,auth_status,auth_status__code,auth_status__name,register_method,register_method__code,register_method__name,create_time,update_time";
      const url = `${
        process.env.NEXT_PUBLIC_API_URL
      }/login/?values=${valuesParam}&filter=${encodeURIComponent(filter)}`;

      const response = await fetch(url);

      const data = await response.json();

      if (!response.ok || !data.rows || !data.rows.id) {
        form.setError("password", {
          type: "manual",
          message: "Invalid email or password.",
        });
        return;
      }

      // Fetch user details after successful login
      const userFilter = JSON.stringify({ username: values.email });
      const userValues =
        "id,avatar,username,fullname,type__code,type__name,is_admin";
      const userUrl = `${
        process.env.NEXT_PUBLIC_API_URL
      }/data/User/?filter=${encodeURIComponent(
        userFilter
      )}&values=${userValues}`;

      const userResponse = await fetch(userUrl);

      const userData = await userResponse.json();

      if (userResponse.ok && userData.rows && userData.rows.length > 0) {
        // Check and create profile in Supabase
        const supabase = createClient();
        const username = values.email;

        // Check if profile exists and get role
        const { data: existingProfile, error: checkError } = await supabase
          .from("profiles")
          .select("id, role")
          .eq("username", username)
          .maybeSingle();

        // If profile doesn't exist, create it (role will use default 'user' from database)
        if (!existingProfile && !checkError) {
          const fullName = userData.rows[0].fullname || null;
          const id = userData.rows[0].id;

          const { error: insertError } = await supabase
            .from("profiles")
            .insert({
              id,
              username: username,
              full_name: fullName,
            });

          if (insertError) {
            console.error("Failed to create profile:", insertError);
            // Don't block login if profile creation fails
          }
        } else if (checkError) {
          // Some error occurred while checking
          console.error("Error checking profile:", checkError);
        }

        // Sign in with userId - profile will be loaded by AuthContext
        signIn(userData.rows[0].id);
        toast({
          title: "Success",
          description: "You have successfully logged in.",
        });
        router.push("/");
        router.refresh();
      } else {
        console.error("Failed to fetch user info");
      }
    } catch (error: any) {
      console.error("Login Error:", error);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Email or password is incorrect.",
      });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Enter your credentials to access your account.
          </CardDescription>
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
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
