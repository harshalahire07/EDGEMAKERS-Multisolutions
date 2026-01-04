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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useJobs } from "@/lib/database-hooks";
import { db, StorageQuotaError } from "@/lib/database";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Briefcase,
  Clock,
  DollarSign,
  HandHeart,
  Heart,
  MapPin,
  Printer,
  Send,
  TrendingUp,
  Users,
} from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const jobApplicationSchema = z.object({
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
  position: z.string().min(1, "Please select a position"),
  experience: z.string().min(1, "Please select your experience level"),
  message: z.string().min(20, "Message must be at least 20 characters"),
});

type JobApplicationValues = z.infer<typeof jobApplicationSchema>;

const benefits = [
  {
    icon: DollarSign,
    title: "Competitive Salary",
    description: "Industry-leading compensation packages",
  },
  {
    icon: TrendingUp,
    title: "Career Growth",
    description: "Clear path for advancement and skill development",
  },
  {
    icon: Heart,
    title: "Health Benefits",
    description: "Comprehensive health insurance for you and your family",
  },
  {
    icon: Clock,
    title: "Work-Life Balance",
    description: "Flexible schedules and paid time off",
  },
  {
    icon: Users,
    title: "Team Culture",
    description: "Collaborative and inclusive work environment",
  },
  {
    icon: HandHeart,
    title: "Employee Welfare",
    description: "Various welfare programs and support systems",
  },
];

// Skeleton component for job cards
function JobCardSkeleton() {
  return (
    <Card className="border-2 border-primary/20 bg-background/50">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Skeleton className="h-7 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <div className="space-y-2 mt-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-3 w-40" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-3 w-40" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CareersPage() {
  const { toast } = useToast();
  const { jobs: jobOpenings, loading } = useJobs(); // Load jobs from database with real-time updates
  const activeJobs = jobOpenings.filter((j) => j.active !== false);

  const form = useForm<JobApplicationValues>({
    resolver: zodResolver(jobApplicationSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      position: "",
      experience: "",
      message: "",
    },
  });

  const onSubmit = async (data: JobApplicationValues) => {
    // Check for recent duplicate application (fail-open on error)
    try {
      const { isDuplicate, lastApplication } = db.isRecentJobApplication(
        data.email,
        data.position,
        5
      );

      if (isDuplicate && lastApplication) {
        toast({
          title: "Application Already Submitted",
          description:
            "You recently applied for this position. We have your application and will review it soon. Submitting multiple applications won't speed up the process.",
          variant: "destructive",
        });
        return;
      }
    } catch (error) {
      // Fail open: if duplicate check fails, allow submission to proceed
      console.error("Duplicate check failed:", error);
    }

    // Store in database
    try {
      const newApplication = {
        id: Date.now().toString(),
        ...data,
        submittedAt: new Date().toISOString(),
        status: "pending",
      };

      db.addApplication(newApplication);

      toast({
        title: "Application Submitted!",
        description:
          "Thank you for your interest. We'll review your application and get back to you soon! You can track your application status by contacting our HR team.",
      });

      form.reset();
    } catch (error: any) {
      // Check if this is a storage quota error
      if (error instanceof StorageQuotaError) {
        toast({
          title: "Storage Full",
          description:
            "Unable to submit application. Browser storage is full. Please contact us directly via email or try again later.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to submit application. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handlePrintJob = (job: any) => {
    const originalTitle = document.title;
    let cleanupDone = false;

    const cleanup = () => {
      if (cleanupDone) return;
      cleanupDone = true;

      // Restore original title
      document.title = originalTitle;

      // Remove no-print class from all job cards
      const allCards = document.querySelectorAll(".job-card");
      allCards.forEach((card) => card.classList.remove("no-print"));

      // Remove the printing class
      document.body.classList.remove("printing-job");

      // Remove event listener
      window.removeEventListener("afterprint", cleanup);
    };

    try {
      document.title = job.title + " - EDGEMAKERS Multisolutions";

      // Add printing class to body
      document.body.classList.add("printing-job");

      // Hide all job cards except the target one
      const allCards = document.querySelectorAll(".job-card");
      allCards.forEach((card) => {
        const cardElement = card as HTMLElement;
        const cardJobId = cardElement.getAttribute("data-job-id");
        if (cardJobId !== job.id) {
          cardElement.classList.add("no-print");
        } else {
          cardElement.classList.remove("no-print");
        }
      });

      // Register afterprint listener for cleanup
      window.addEventListener("afterprint", cleanup);

      // Trigger print dialog
      window.print();
    } catch (error) {
      console.error("Print error:", error);
      cleanup(); // Ensure cleanup on error
      toast({
        title: "Print Error",
        description: "Failed to open print dialog. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden py-24 md:py-32 bg-gradient-to-br from-teal-50/40 via-emerald-50/30 to-green-50/40">
        <div className="absolute inset-0 bg-grid-green-200/[0.25] bg-[10px_10px] [mask-image:linear-gradient(0deg,transparent,#F5FAF7,transparent)]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
        <div className="container relative px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-block rounded-lg bg-muted px-3 py-1 text-sm text-primary">
              Join Our Team
            </div>
            <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl mb-6">
              Build Your Career with{" "}
              <span className="text-primary">EDGEMAKERS</span>
            </h1>
            <p className="text-muted-foreground md:text-xl/relaxed mb-8">
              Join a team that values excellence, innovation, and growth.
              Discover rewarding career opportunities in facility management and
              human resources.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="w-full bg-secondary/30 py-20 md:py-32">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <div className="mb-4 inline-block rounded-lg bg-muted px-3 py-1 text-sm text-primary">
              Employee Benefits
            </div>
            <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl mb-4">
              Why Work With Us
            </h2>
            <p className="text-muted-foreground md:text-xl/relaxed">
              We believe in taking care of our employees because they are our
              greatest asset.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card
                  key={index}
                  className="group border-2 border-transparent bg-background/50 transition-all duration-300 hover:border-primary/50 hover:-translate-y-2"
                >
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 transition-colors duration-300 group-hover:bg-primary">
                      <Icon className="h-7 w-7 text-primary group-hover:text-primary-foreground" />
                    </div>
                    <h3 className="font-headline text-xl font-bold mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Job Openings */}
      <section className="w-full bg-background py-20 md:py-32">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <div className="mb-4 inline-block rounded-lg bg-muted px-3 py-1 text-sm text-primary">
              Current Openings
            </div>
            <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl mb-4">
              Available Positions
            </h2>
            <p className="text-muted-foreground md:text-xl/relaxed">
              Explore our current job openings and find the perfect role for
              you.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <JobCardSkeleton key={i} />
                ))
              : activeJobs.map((job, index) => (
                  <Card
                    key={index}
                    data-job-id={job.id}
                    className="job-card border-2 border-primary/20 bg-background/50 hover:border-primary/50 transition-all duration-300"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="job-title font-headline text-2xl mb-2">
                            {job.title}
                          </CardTitle>
                          <CardDescription className="text-base">
                            {job.department}
                          </CardDescription>
                        </div>
                        <Briefcase className="h-8 w-8 text-primary" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        {job.description}
                      </p>
                      <div className="job-details space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span>{job.location}</span>
                          <span className="print-label">
                            Location: {job.location}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-primary" />
                          <span>{job.type}</span>
                          <span className="print-label">Type: {job.type}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Briefcase className="h-4 w-4 text-primary" />
                          <span>{job.experience} experience</span>
                          <span className="print-label">
                            Experience: {job.experience}
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePrintJob(job)}
                        className="mt-4 w-full print:hidden"
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        Print Job Details
                      </Button>

                      {/* Print-only content */}
                      <div className="print-only">
                        <div className="print-header">
                          <h1>EDGEMAKERS Multisolutions</h1>
                          <p>Job Posting</p>
                        </div>
                        <div className="record-field">
                          <span className="record-label">Posted:</span>
                          <span className="record-value">
                            {new Date().toLocaleDateString()}
                          </span>
                        </div>
                        <div className="record-field">
                          <p>
                            To apply for this position, please visit our website
                            at edgemakers.com or contact our HR department.
                          </p>
                        </div>
                        <div className="record-field">
                          <p>
                            Printed from edgemakers.com on{" "}
                            {new Date().toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
          </div>
          {!loading && activeJobs.length === 0 && (
            <p className="text-center text-muted-foreground mt-8">
              No job openings available at the moment. Check back soon!
            </p>
          )}
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="w-full bg-secondary/30 py-20 md:py-32">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <div className="mb-4 inline-block rounded-lg bg-muted px-3 py-1 text-sm text-primary">
              Apply Now
            </div>
            <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl mb-4">
              Submit Your Application
            </h2>
            <p className="text-muted-foreground md:text-xl/relaxed">
              Fill out the form below and our HR team will get in touch with
              you.
            </p>
          </div>

          <Card className="mx-auto max-w-2xl border-2 border-primary/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">
                Career Application Form
              </CardTitle>
              <CardDescription>
                Share your details and we'll contact you about relevant
                opportunities.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
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
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="+91 98765 43210"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Position Applied For</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a position" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {loading ? (
                              <SelectItem value="loading" disabled>
                                Loading positions...
                              </SelectItem>
                            ) : (
                              jobOpenings.map((job) => (
                                <SelectItem key={job.title} value={job.title}>
                                  {job.title}
                                </SelectItem>
                              ))
                            )}
                            <SelectItem value="other">
                              Other Position
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Years of Experience</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select experience level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0-1">0-1 years</SelectItem>
                            <SelectItem value="1-3">1-3 years</SelectItem>
                            <SelectItem value="3-5">3-5 years</SelectItem>
                            <SelectItem value="5-10">5-10 years</SelectItem>
                            <SelectItem value="10+">10+ years</SelectItem>
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
                        <FormLabel>Cover Letter / Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us about yourself, your experience, and why you'd be a great fit..."
                            className="min-h-[150px] resize-none"
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
                      "Submitting..."
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit Application
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
