"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, Mail, Phone } from "lucide-react";
import { MotionDiv } from "./motion-div";

interface TeamMember {
  name: string;
  role: string;
  phone: string;
  email?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
};

export default function EscalationMatrix() {
  const hierarchy: TeamMember[] = [
    {
      name: "Dr. Nirmala Mahesh Thorwe",
      role: "General Manager",
      phone: "+91 88059 76107",
      email: "",
    },
    {
      name: "Mr. Dyaneshwar Kajle",
      role: "Assistant General Manager",
      phone: "+91 92720 05595",
      email: "dkajale1182@gmail.com",
    },
  ];

  const departments: TeamMember[] = [
    {
      name: "Mr. Rajebhau Gulave",
      role: "Operations Manager",
      phone: "+91 97658 01089",
      email: "rajebhaugulve@gmail.com",
    },
    {
      name: "Mr. Amol Kalbande",
      role: "Admin Manager",
      phone: "+91 88301 40377",
      email: "amolk2289@gmail.com",
    },
  ];

  return (
    <section className="w-full py-16 sm:py-20 md:py-24">
      <div className="container px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Escalation Matrix
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Our HK Department leadership is always available to ensure your
            concerns are addressed promptly and effectively.
          </p>
        </MotionDiv>

        <MotionDiv
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-6"
        >
          {/* Top Level - General Manager */}
          <MotionDiv variants={itemVariants} className="flex justify-center">
            <Card className="w-full max-w-md border-2 border-primary/20 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="font-bold text-xl mb-1">
                    {hierarchy[0].name}
                  </h3>
                  <p className="text-primary font-semibold">
                    {hierarchy[0].role}
                  </p>
                </div>
              </CardContent>
            </Card>
          </MotionDiv>

          {/* Arrow pointing UP for escalation */}
          <div className="flex justify-center">
            <ArrowUp className="h-8 w-8 text-muted-foreground" />
          </div>

          {/* Second Level - AGM */}
          <MotionDiv variants={itemVariants} className="flex justify-center">
            <Card className="w-full max-w-md border-2 border-primary/20 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="font-bold text-xl mb-1">
                    {hierarchy[1].name}
                  </h3>
                  <p className="text-primary font-semibold">
                    {hierarchy[1].role}
                  </p>
                </div>
              </CardContent>
            </Card>
          </MotionDiv>

          {/* Arrow pointing UP for escalation */}
          <div className="flex justify-center">
            <ArrowUp className="h-8 w-8 text-muted-foreground" />
          </div>

          {/* Third Level - Department Managers */}
          <MotionDiv
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
          >
            {departments.map((member, index) => (
              <Card
                key={index}
                className="border-2 border-primary/20 shadow-lg hover:shadow-xl transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className="font-bold text-lg mb-1">{member.name}</h3>
                    <p className="text-primary font-semibold mb-4">
                      {member.role}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-primary" />
                        <a
                          href={`tel:${member.phone.replace(/\s/g, "")}`}
                          className="hover:text-primary transition-colors"
                        >
                          {member.phone}
                        </a>
                      </div>
                      {member.email && (
                        <div className="flex items-center justify-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-primary" />
                          <a
                            href={`mailto:${member.email}`}
                            className="hover:text-primary transition-colors"
                          >
                            {member.email}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </MotionDiv>

          {/* Information Box */}
          <MotionDiv
            variants={itemVariants}
            className="mt-8 max-w-2xl mx-auto text-center"
          >
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">
                  For any concerns or escalations, please contact the
                  appropriate manager. Issues will be escalated through the
                  chain of command to ensure prompt resolution.
                </p>
              </CardContent>
            </Card>
          </MotionDiv>
        </MotionDiv>
      </div>
    </section>
  );
}
