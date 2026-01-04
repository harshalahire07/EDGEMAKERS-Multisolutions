"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { db, StorageQuotaError } from "@/lib/database";
import { Mail } from "lucide-react";
import { useState } from "react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedWhatsapp = whatsapp.trim();

    // Require at least one contact method
    if (!trimmedEmail && !trimmedWhatsapp) {
      toast({
        title: "Contact Information Required",
        description:
          "Please provide either an email address or WhatsApp number.",
        variant: "destructive",
      });
      return;
    }

    // Validate email if provided
    if (trimmedEmail && !trimmedEmail.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    // Validate WhatsApp number if provided
    if (trimmedWhatsapp) {
      const phonePattern =
        /^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
      if (!phonePattern.test(trimmedWhatsapp)) {
        toast({
          title: "Invalid WhatsApp Number",
          description:
            "Please enter a valid WhatsApp number (e.g., +91 98765 43210)",
          variant: "destructive",
        });
        return;
      }

      // Ensure digit count between 10-15 after removing non-digits
      const digits = trimmedWhatsapp.replace(/\D/g, "");
      if (digits.length < 10 || digits.length > 15) {
        toast({
          title: "Invalid WhatsApp Number",
          description: "Please enter a valid WhatsApp number (10-15 digits).",
          variant: "destructive",
        });
        return;
      }
    }

    setIsLoading(true);

    try {
      // Check if already subscribed by email (only if email provided)
      if (trimmedEmail && db.isDuplicateNewsletterEmail(trimmedEmail)) {
        toast({
          title: "Already Subscribed",
          description:
            "This email is already subscribed to our newsletter. Check your inbox for our latest updates!",
          variant: "default",
        });
        setIsLoading(false);
        return;
      }

      const newSubscriber = {
        id: Date.now().toString(),
        email: trimmedEmail,
        whatsapp: trimmedWhatsapp || undefined,
        subscribedAt: new Date().toISOString(),
        status: "active",
      };

      db.addNewsletterSubscriber(newSubscriber);

      toast({
        title: "Subscribed Successfully!",
        description: "Thank you for subscribing to our newsletter.",
      });

      setEmail("");
      setWhatsapp("");
    } catch (error: any) {
      // Check if this is a storage quota error
      if (error instanceof StorageQuotaError) {
        toast({
          title: "Storage Full",
          description:
            "Unable to subscribe. Browser storage is full. Please contact the administrator.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to subscribe. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-secondary/50 py-12 md:py-16">
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Mail className="h-4 w-4" />
            Stay Updated
          </div>
          <h3 className="font-headline text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl mb-3">
            Subscribe to Our Newsletter
          </h3>
          <p className="text-muted-foreground mb-8 md:text-lg">
            Get the latest updates on our services, industry insights, and
            exclusive offers delivered to your inbox.
          </p>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 max-w-md mx-auto"
          >
            <Input
              type="email"
              placeholder="Enter your email (optional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background"
              disabled={isLoading}
            />
            <Input
              type="tel"
              placeholder="WhatsApp Number (optional)"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="bg-background"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground text-center -mt-1">
              Provide either email or WhatsApp number (or both)
            </p>
            <Button
              type="submit"
              disabled={isLoading}
              className="whitespace-nowrap"
            >
              {isLoading ? "Subscribing..." : "Subscribe"}
            </Button>
          </form>

          <p className="mt-4 text-xs text-muted-foreground">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </div>
  );
}
