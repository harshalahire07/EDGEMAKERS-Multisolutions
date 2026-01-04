import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import EscalationMatrix from "@/components/landing/escalation-matrix";
import {
  Award,
  Building2,
  Eye,
  Heart,
  Shield,
  Target,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us - EDGEMAKERS Multisolutions",
  description:
    "Learn about EDGEMAKERS Multisolutions - Your trusted partner in facility management and human resource solutions.",
};

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden py-24 md:py-32 bg-gradient-to-br from-emerald-50/40 via-green-50/30 to-teal-50/40">
        <div className="absolute inset-0 bg-grid-green-200/[0.25] bg-[10px_10px] [mask-image:linear-gradient(0deg,transparent,#F5FAF7,transparent)]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
        <div className="container relative px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-block rounded-lg bg-muted px-3 py-1 text-sm text-primary">
              About Us
            </div>
            <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl mb-6">
              Empowering Businesses with{" "}
              <span className="text-primary">Excellence</span>
            </h1>
            <p className="text-muted-foreground md:text-xl/relaxed mb-8">
              EDGEMAKERS Multisolutions is a leading facility management and
              human resource solutions provider, committed to delivering
              exceptional services that drive business success.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="w-full bg-secondary/30 py-20 md:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-2">
            <Card className="border-2 border-primary/20 bg-background/50">
              <CardContent className="p-8">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h2 className="font-headline text-3xl font-bold mb-4">
                  Our Mission
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  To provide world-class facility management and human resource
                  solutions that enable our clients to focus on their core
                  business while we handle their operational needs with
                  precision, reliability, and innovation.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20 bg-background/50">
              <CardContent className="p-8">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Eye className="h-8 w-8 text-primary" />
                </div>
                <h2 className="font-headline text-3xl font-bold mb-4">
                  Our Vision
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  To be the most trusted and preferred partner for facility
                  management and workforce solutions, setting industry standards
                  through excellence, innovation, and unwavering commitment to
                  client satisfaction.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="w-full bg-background py-20 md:py-32">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <div className="mb-4 inline-block rounded-lg bg-muted px-3 py-1 text-sm text-primary">
              Core Values
            </div>
            <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl mb-4">
              What Drives Us
            </h2>
            <p className="text-muted-foreground md:text-xl/relaxed">
              Our values are the foundation of everything we do and guide our
              commitment to excellence.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Shield,
                title: "Integrity",
                description:
                  "We operate with honesty and transparency in all our dealings.",
              },
              {
                icon: Award,
                title: "Excellence",
                description:
                  "We strive for the highest standards in service delivery.",
              },
              {
                icon: Users,
                title: "People First",
                description:
                  "We value our employees and treat them with respect and dignity.",
              },
              {
                icon: Heart,
                title: "Commitment",
                description:
                  "We are dedicated to exceeding client expectations consistently.",
              },
            ].map((value, index) => {
              const Icon = value.icon;
              return (
                <Card
                  key={index}
                  className="group border-2 border-transparent bg-secondary/30 transition-all duration-300 hover:border-primary/50 hover:-translate-y-2"
                >
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-7 w-7 text-primary group-hover:text-primary-foreground" />
                    </div>
                    <h3 className="font-headline text-xl font-bold mb-2">
                      {value.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="w-full bg-secondary/30 py-20 md:py-32">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <div className="mb-4 inline-block rounded-lg bg-muted px-3 py-1 text-sm text-primary">
              Why Us
            </div>
            <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl mb-4">
              Why Choose EDGEMAKERS
            </h2>
            <p className="text-muted-foreground md:text-xl/relaxed">
              We stand out in the industry through our commitment to quality and
              innovation.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Experienced Team",
                description:
                  "Our professionals bring years of industry expertise and dedication.",
              },
              {
                title: "Tailored Solutions",
                description:
                  "We customize our services to meet your specific business needs.",
              },
              {
                title: "24/7 Support",
                description:
                  "Round-the-clock assistance to ensure uninterrupted operations.",
              },
              {
                title: "Cost-Effective",
                description:
                  "Quality services at competitive prices for maximum value.",
              },
              {
                title: "Technology-Driven",
                description:
                  "We leverage modern tools and systems for optimal efficiency.",
              },
              {
                title: "Compliance Focused",
                description:
                  "Strict adherence to industry regulations and safety standards.",
              },
            ].map((item, index) => (
              <Card
                key={index}
                className="border-2 border-primary/20 bg-background/50"
              >
                <CardContent className="p-6">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                    <h3 className="font-headline text-lg font-bold">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full bg-secondary/30 py-20">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl mb-4">
              Ready to Partner with Us?
            </h2>
            <p className="text-muted-foreground mb-8 md:text-lg">
              Let's discuss how we can help transform your business operations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/#contact">Get In Touch</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/#services">View Services</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Escalation Matrix Section */}
      <EscalationMatrix />
    </div>
  );
}
