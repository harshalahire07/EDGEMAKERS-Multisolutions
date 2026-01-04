import ContactForm from "@/components/landing/contact-form";
import Hero from "@/components/landing/hero";
import Newsletter from "@/components/landing/newsletter";
import Services from "@/components/landing/services";
import Team from "@/components/landing/team";
import Testimonials from "@/components/landing/testimonials";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EDGEMAKERS Multisolutions | Innovative Business Solutions",
  description:
    "Transform your business with cutting-edge solutions from EDGEMAKERS Multisolutions. Expert IT consulting, web development, mobile apps, cloud services, and digital transformation.",
  keywords:
    "business solutions, IT consulting, web development, mobile apps, cloud services, digital transformation, EDGEMAKERS",
  openGraph: {
    title: "EDGEMAKERS Multisolutions | Innovative Business Solutions",
    description:
      "Transform your business with cutting-edge solutions. Expert IT consulting, web development, and digital transformation services.",
    type: "website",
  },
};

export default function Home() {
  return (
    <div className="flex flex-col overflow-x-hidden">
      <Hero />
      <Services />
      <Team />
      <Testimonials />
      <ContactForm />
      <Newsletter />
    </div>
  );
}
