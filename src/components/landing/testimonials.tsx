"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useTestimonials } from "@/lib/database-hooks";
import Autoplay from "embla-carousel-autoplay";
import React from "react";
import { MotionDiv } from "./motion-div";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.2,
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
      ease: "easeOut",
    },
  },
};

// Skeleton component for testimonial cards
function TestimonialCardSkeleton() {
  return (
    <CarouselItem className="md:basis-1/2 lg:basis-1/3">
      <MotionDiv className="p-1 h-full">
        <Card className="h-full bg-background/50 shadow-lg">
          <CardContent className="flex h-full flex-col items-center justify-center space-y-4 p-8 text-center">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex items-center gap-3 pt-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
      </MotionDiv>
    </CarouselItem>
  );
}

export default function Testimonials() {
  const { testimonials, loading } = useTestimonials(); // Load testimonials from database with real-time updates
  const activeTestimonials = testimonials.filter((t) => t.active !== false);

  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  return (
    <section
      id="testimonials"
      className="w-full py-20 md:py-32 bg-secondary/30"
    >
      <div className="container px-4 md:px-6">
        <MotionDiv
          className="flex flex-col items-center justify-center space-y-4 text-center"
          initial="hidden"
          whileInView="visible"
          variants={containerVariants}
          viewport={{ amount: 0.5 }}
        >
          <MotionDiv className="space-y-2" variants={itemVariants}>
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm text-primary">
              Client Stories
            </div>
            <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl">
              Why Our Clients Trust Us
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Hear directly from businesses we've helped on their journey to
              excellence.
            </p>
          </MotionDiv>
        </MotionDiv>
        {loading ? (
          <Carousel
            plugins={[]}
            opts={{
              align: "start",
              loop: true,
            }}
            className="mx-auto mt-16 w-full max-w-6xl"
          >
            <CarouselContent>
              {Array.from({ length: 4 }).map((_, i) => (
                <TestimonialCardSkeleton key={i} />
              ))}
            </CarouselContent>
            <CarouselPrevious className="border-2" />
            <CarouselNext className="border-2" />
          </Carousel>
        ) : (
          <Carousel
            plugins={[plugin.current]}
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
            opts={{
              align: "start",
              loop: true,
            }}
            className="mx-auto mt-16 w-full max-w-6xl"
          >
            <CarouselContent>
              {activeTestimonials.map((testimonial, index) => (
                <CarouselItem
                  key={testimonial.id}
                  className="md:basis-1/2 lg:basis-1/3"
                >
                  <MotionDiv
                    className="p-1 h-full"
                    initial={{ opacity: 0, y: 100 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.8,
                      delay: index * 0.1,
                      ease: [0.6, 0.05, 0.01, 0.9],
                    }}
                    viewport={{ amount: 0.2 }}
                  >
                    <Card className="h-full bg-background/50 shadow-lg">
                      <CardContent className="flex h-full flex-col items-center justify-center space-y-4 p-8 text-center">
                        <p className="flex-grow italic text-muted-foreground">
                          &quot;{testimonial.quote}&quot;
                        </p>
                        <div className="flex items-center gap-3 pt-4">
                          <Avatar className="h-12 w-12 border-2 border-primary/50">
                            <AvatarFallback>
                              {testimonial.author.substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">
                              {testimonial.author}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {testimonial.company}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </MotionDiv>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="border-2" />
            <CarouselNext className="border-2" />
          </Carousel>
        )}
        {!loading && activeTestimonials.length === 0 && (
          <p className="text-center text-muted-foreground mt-8">
            No testimonials available.
          </p>
        )}
      </div>
    </section>
  );
}
