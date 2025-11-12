"use client";

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
import { getAllowedEmails } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { signIn } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

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

      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userId", data.rows.id);

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

      // Check if user is allowed to access the system by email
      const allowedEmails = await getAllowedEmails();
      let role = "user";
      if (allowedEmails.includes(values.email)) {
        role = "cs";
      } else if (userData.rows[0].is_admin) {
        role = "admin";
      }

      if (userResponse.ok && userData.rows && userData.rows.length > 0) {
        localStorage.setItem(
          "userInfo",
          JSON.stringify({ ...userData.rows[0], role })
        );
        signIn({ ...userData.rows[0], role });
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
