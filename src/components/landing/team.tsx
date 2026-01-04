"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeam } from "@/lib/database-hooks";
import { MotionDiv } from "./motion-div";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
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

// Skeleton component for team member cards
function TeamMemberSkeleton() {
  return (
    <Card className="group h-full text-center transition-all duration-300">
      <CardHeader className="p-8">
        <div className="flex justify-center">
          <Skeleton className="h-32 w-32 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2 px-6 pb-6">
        <Skeleton className="h-6 w-40 mx-auto" />
        <Skeleton className="h-4 w-32 mx-auto" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
      </CardContent>
    </Card>
  );
}

export default function Team() {
  const { team: teamMembers, loading } = useTeam(); // Load team from database with real-time updates
  const activeMembers = teamMembers
    .filter((m) => m.active !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0)); // Sort by order

  return (
    <section id="team" className="w-full bg-background py-20 md:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm text-primary">
              Our Team
            </div>
            <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl">
              Meet the Experts
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Our diverse team of experts brings a wealth of experience and
              passion to every project.
            </p>
          </div>
        </div>
        <MotionDiv
          className="mx-auto mt-16 grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:max-w-none lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ amount: 0.2 }}
        >
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <MotionDiv key={i} variants={itemVariants}>
                  <TeamMemberSkeleton />
                </MotionDiv>
              ))
            : activeMembers.map((member) => (
                <MotionDiv key={member.id} variants={itemVariants}>
                  <Card className="group h-full text-center transition-all duration-300 ease-in-out hover:bg-muted/50 hover:shadow-2xl">
                    <CardHeader className="p-8">
                      <MotionDiv
                        className="flex justify-center"
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{
                          duration: 0.4,
                          delay: 0.2,
                          ease: "backOut",
                        }}
                        viewport={{ once: true, amount: 0.8 }}
                      >
                        <Avatar className="h-32 w-32 border-4 border-primary/50 transition-transform duration-300 group-hover:scale-110">
                          <AvatarImage
                            src={member.image.imageUrl}
                            alt={member.image.description}
                            data-ai-hint={member.image.imageHint}
                          />
                          <AvatarFallback>
                            {member.name.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      </MotionDiv>
                    </CardHeader>
                    <CardContent className="space-y-2 px-6 pb-6">
                      <CardTitle className="font-headline text-2xl">
                        {member.name}
                      </CardTitle>
                      <p className="font-semibold text-primary">
                        {member.role}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {member.bio}
                      </p>
                    </CardContent>
                  </Card>
                </MotionDiv>
              ))}
        </MotionDiv>
        {!loading && activeMembers.length === 0 && (
          <p className="text-center text-muted-foreground mt-8">
            No team members to display.
          </p>
        )}
      </div>
    </section>
  );
}
