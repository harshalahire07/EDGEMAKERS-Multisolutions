"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useServices } from "@/lib/database-hooks";
import { serviceCategories } from "@/lib/data";
import {
  Home,
  Landmark,
  Layers,
  Utensils,
  Sprout,
  Wrench,
  Bug,
  Car,
  ParkingCircle,
  Building,
  ExternalLink,
  type LucideProps,
} from "lucide-react";
import Image from "next/image";
import { MotionDiv } from "./motion-div";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import SignInDialog from "@/components/auth/sign-in-dialog";
import { useToast } from "@/hooks/use-toast";

const iconMap: { [key: string]: React.FC<LucideProps> } = {
  Home,
  Landmark,
  Layers,
  Utensils,
  Sprout,
  Wrench,
  Bug,
  Car,
  ParkingCircle,
  Building,
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 100, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.6, 0.05, 0.01, 0.9],
    },
  },
};

// Skeleton component for service cards
function ServiceCardSkeleton() {
  return (
    <MotionDiv variants={itemVariants} className="flex">
      <Card className="flex h-full w-full flex-col overflow-hidden rounded-xl border-2 border-transparent bg-background/50 shadow-lg">
        <CardHeader className="flex flex-row items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="flex flex-grow flex-col space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-40 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
        </CardContent>
      </Card>
    </MotionDiv>
  );
}

export default function Services() {
  const { services, loading } = useServices(); // Load services from database with real-time updates
  const [selectedCategory, setSelectedCategory] = useState("All Services");
  const [signInDialogOpen, setSignInDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");
  const [pendingFormUrl, setPendingFormUrl] = useState<string>("");
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const filteredServices =
    selectedCategory === "All Services"
      ? services.filter((s) => s.active !== false) // Only show active services
      : services.filter(
          (service) =>
            service.category === selectedCategory && service.active !== false
        );

  const handleInquire = (serviceTitle: string, googleFormUrl: string) => {
    if (!googleFormUrl) {
      toast({
        title: "Coming Soon",
        description:
          "The inquiry form for this service will be available soon. Please contact us directly.",
        variant: "default",
      });
      return;
    }

    if (!isAuthenticated) {
      setSelectedService(serviceTitle);
      setPendingFormUrl(googleFormUrl);
      setSignInDialogOpen(true);
    } else {
      window.open(googleFormUrl, "_blank");
    }
  };

  const handleSignInSuccess = () => {
    if (pendingFormUrl) {
      window.open(pendingFormUrl, "_blank");
      setPendingFormUrl("");
      setSelectedService("");
    }
  };

  return (
    <section
      id="services"
      className="w-full py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 bg-gray-50"
    >
      <div className="container px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center space-y-3 sm:space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-xs sm:text-sm text-accent">
              Our Services
            </div>
            <h2 className="font-headline text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter">
              What We Offer
            </h2>
            <p className="max-w-[90%] sm:max-w-[600px] md:max-w-[900px] text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground mx-auto">
              We provide a range of services designed to meet your business
              needs and ensure operational excellence.
            </p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mx-auto mt-8 sm:mt-10 md:mt-12 flex flex-wrap justify-center gap-2 sm:gap-3">
          {serviceCategories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className="transition-all duration-300 text-xs sm:text-sm"
              size={
                typeof window !== "undefined" && window.innerWidth < 640
                  ? "sm"
                  : "default"
              }
            >
              {category}
            </Button>
          ))}
        </div>

        {loading ? (
          <MotionDiv
            className="mx-auto mt-8 sm:mt-10 md:mt-12 grid max-w-7xl items-stretch gap-4 sm:gap-5 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <ServiceCardSkeleton key={i} />
            ))}
          </MotionDiv>
        ) : (
          <MotionDiv
            className="mx-auto mt-8 sm:mt-10 md:mt-12 grid max-w-7xl items-stretch gap-4 sm:gap-5 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ amount: 0.1 }}
            key={selectedCategory}
          >
            {filteredServices.map((service) => {
              const Icon = iconMap[service.icon];
              return (
                <MotionDiv
                  key={service.title}
                  variants={itemVariants}
                  className="flex"
                >
                  <Card className="group flex h-full w-full flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-gradient-to-br from-[hsl(var(--card))] via-[hsl(var(--muted))]/50 to-[hsl(var(--card))] shadow-lg transition-all duration-300 ease-in-out hover:border-accent hover:shadow-mint-200/40 hover:-translate-y-2">
                    <CardHeader className="flex flex-row items-center gap-4">
                      <div className="rounded-lg bg-gradient-to-br from-accent/10 to-accent/20 p-3 text-accent transition-all duration-300 group-hover:from-accent group-hover:to-accent/90 group-hover:text-white group-hover:shadow-lg group-hover:shadow-accent/30">
                        {Icon && <Icon className="h-6 w-6" />}
                      </div>
                      <CardTitle className="font-headline text-xl">
                        {service.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-grow flex-col space-y-4">
                      <p className="flex-grow text-muted-foreground">
                        {service.description}
                      </p>
                      <div className="relative mt-auto h-40 w-full overflow-hidden rounded-md">
                        <Image
                          src={service.image.imageUrl}
                          alt={service.image.description}
                          data-ai-hint={service.image.imageHint}
                          fill
                          className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                        />
                      </div>
                      <Button
                        onClick={() =>
                          handleInquire(service.title, service.googleFormUrl)
                        }
                        className="w-full"
                        size="sm"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Inquire Now
                      </Button>
                    </CardContent>
                  </Card>
                </MotionDiv>
              );
            })}
          </MotionDiv>
        )}

        {!loading && filteredServices.length === 0 && (
          <p className="mt-12 text-center text-muted-foreground">
            No services found in this category.
          </p>
        )}
      </div>

      <SignInDialog
        open={signInDialogOpen}
        onOpenChange={setSignInDialogOpen}
        onSuccess={handleSignInSuccess}
        serviceName={selectedService}
      />
    </section>
  );
}
