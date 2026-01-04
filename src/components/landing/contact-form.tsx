"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useServices } from "@/lib/database-hooks";
import { db, StorageQuotaError } from "@/lib/database";
import { sanitizeObject, RateLimiter, isValidEmail } from "@/lib/security";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Phone, Send, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { useRef } from "react";
import * as z from "zod";

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .trim()
    .regex(
      /^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/,
      "Please enter a valid phone number (e.g., +91 98765 43210 or 9876543210)"
    )
    .refine(
      (value) => {
        const digits = value.replace(/\D/g, "");
        return digits.length >= 10 && digits.length <= 15;
      },
      {
        message:
          "Phone number must contain between 10 and 15 digits (e.g., +91 98765 43210 or 9876543210)",
      }
    ),
  service: z.string().min(1, "Please select a service"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactForm() {
  const { toast } = useToast();
  const { services, loading } = useServices(); // Load services from database with real-time updates
  const rateLimiterRef = useRef(new RateLimiter());

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      service: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    // Validate email format
    if (!isValidEmail(data.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    // Check rate limit (5 requests per minute per email)
    if (!rateLimiterRef.current.checkLimit(data.email, 5, 60 * 1000)) {
      toast({
        title: "Too Many Requests",
        description: "Please wait a minute before submitting again",
        variant: "destructive",
      });
      return;
    }

    // Sanitize all inputs
    const sanitizedData = sanitizeObject(data);
    // Check for recent duplicate submission (fail-open on error)
    try {
      const { isDuplicate, lastSubmission } = db.isRecentContactSubmission(
        sanitizedData.email,
        5
      );

      if (isDuplicate && lastSubmission) {
        const minutesAgo = Math.round(
          (Date.now() - new Date(lastSubmission.submittedAt).getTime()) /
            (1000 * 60)
        );
        toast({
          title: "Recent Submission Detected",
          description: `You submitted a contact form ${minutesAgo} minute${
            minutesAgo !== 1 ? "s" : ""
          } ago. Please wait a few minutes before submitting again, or call us directly if urgent.`,
          variant: "destructive",
        });
        return;
      }
    } catch (error) {
      // Fail open: if duplicate check fails, allow submission to proceed
      console.error("Duplicate check failed:", error);
    }

    // Store in database with sanitized data
    try {
      const newContact = {
        id: Date.now().toString(),
        ...sanitizedData,
        submittedAt: new Date().toISOString(),
        status: "new",
      };

      db.addContact(newContact);

      toast({
        title: "Message Sent!",
        description:
          "Thank you for contacting us. We'll get back to you soon! We typically respond within 24 hours.",
      });

      form.reset();
    } catch (error: any) {
      // Check if this is a storage quota error
      if (error instanceof StorageQuotaError) {
        toast({
          title: "Storage Full",
          description:
            "Your browser storage is full. Please visit the admin panel to export and clear old data, then try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <section
      id="contact"
      className="w-full bg-background py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32"
    >
      <div className="container px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 max-w-7xl mx-auto">
        <div className="mx-auto max-w-2xl text-center mb-8 sm:mb-10 md:mb-12">
          <div className="inline-block rounded-lg bg-muted px-3 py-1 text-xs sm:text-sm text-primary mb-3 sm:mb-4">
            Get In Touch
          </div>
          <h2 className="font-headline text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter mb-3 sm:mb-4">
            Contact Us
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground">
            Have a question or ready to get started? Fill out the form below and
            we'll get back to you as soon as possible.
          </p>
        </div>

        <Card className="mx-auto max-w-2xl border-2 border-primary/20 shadow-2xl">
          <CardHeader className="space-y-1 sm:space-y-2">
            <CardTitle className="font-headline text-xl sm:text-2xl">
              Send us a Message
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              We're here to help with all your facility management needs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 sm:space-y-6"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="John Doe"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder="john@example.com"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="tel"
                            placeholder="+91 98765 43210"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="service"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Interested In</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a service" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {loading ? (
                            <SelectItem value="loading" disabled>
                              Loading services...
                            </SelectItem>
                          ) : (
                            services.map((service) => (
                              <SelectItem
                                key={service.title}
                                value={service.title}
                              >
                                {service.title}
                              </SelectItem>
                            ))
                          )}
                          <SelectItem value="general">
                            General Inquiry
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about your requirements..."
                          className="min-h-[120px] resize-none"
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
                  size="lg"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
