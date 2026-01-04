"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn, UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import * as z from "zod";
import { registerUser, loginUser, emailExists } from "@/lib/user-database";

const authSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthValues = z.infer<typeof authSchema>;

interface SignInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  serviceName?: string;
}

export default function SignInDialog({
  open,
  onOpenChange,
  onSuccess,
  serviceName,
}: SignInDialogProps) {
  const { signIn } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);

  const form = useForm<AuthValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: AuthValues) => {
    if (isSignUp) {
      // Sign Up Flow
      const result = await registerUser(data.email, data.name, data.password);

      if (!result.success) {
        toast({
          title: "Sign Up Failed",
          description: result.message,
          variant: "destructive",
        });
        return;
      }

      // Auto sign-in after successful registration
      if (result.user) {
        signIn(result.user);

        toast({
          title: "Account Created!",
          description: `Welcome, ${result.user.name}!`,
        });

        // Check if admin
        if (result.user.isAdmin) {
          onOpenChange(false);
          form.reset();
          router.push("/admin");
        } else {
          onOpenChange(false);
          form.reset();
          onSuccess?.();
        }
      }
    } else {
      // Login Flow
      const result = await loginUser(data.email, data.password);

      if (!result.success) {
        toast({
          title: "Login Failed",
          description: result.message,
          variant: "destructive",
        });
        return;
      }

      // Sign in successful
      if (result.user) {
        signIn(result.user);

        toast({
          title: "Login Successful!",
          description: `Welcome back, ${result.user.name}!`,
        });

        // Check if admin
        if (result.user.isAdmin) {
          onOpenChange(false);
          form.reset();
          router.push("/admin");
        } else {
          onOpenChange(false);
          form.reset();
          onSuccess?.();
        }
      }
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">
            {isSignUp ? "Create Account" : "Sign In"}
          </DialogTitle>
          <DialogDescription>
            {serviceName
              ? `Please ${
                  isSignUp ? "create an account" : "sign in"
                } to inquire about ${serviceName}.`
              : `Please ${
                  isSignUp ? "create an account" : "sign in"
                } to continue.`}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
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
                      placeholder={
                        isSignUp
                          ? "Create a password (min. 6 characters)"
                          : "Enter your password"
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" size="lg">
              {isSignUp ? (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Account
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>
        </Form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              {isSignUp ? "Already have an account?" : "New to EDGEMAKERS?"}
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={toggleMode}
        >
          {isSignUp ? "Sign In Instead" : "Create Account"}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Your information is secure and will only be used to process your
          service inquiry.
        </p>
      </DialogContent>
    </Dialog>
  );
}
