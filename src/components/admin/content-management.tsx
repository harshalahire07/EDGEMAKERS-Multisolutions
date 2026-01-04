"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  MessageSquare,
  FileText,
  UserCog,
} from "lucide-react";
import ServicesManager from "./services-manager";
import TeamManager from "./team-manager";
import TestimonialsManager from "./testimonials-manager";
import JobsManager from "./jobs-manager";
import UsersManager from "./users-manager";

export default function ContentManagement() {
  const [activeTab, setActiveTab] = useState("services");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
          <LayoutDashboard className="h-5 w-5" />
          Website Content Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5 gap-2 h-auto">
            <TabsTrigger
              value="services"
              className="flex items-center gap-2 text-xs sm:text-sm py-2"
            >
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Services</span>
            </TabsTrigger>
            <TabsTrigger
              value="team"
              className="flex items-center gap-2 text-xs sm:text-sm py-2"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Team</span>
            </TabsTrigger>
            <TabsTrigger
              value="testimonials"
              className="flex items-center gap-2 text-xs sm:text-sm py-2"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Testimonials</span>
            </TabsTrigger>
            <TabsTrigger
              value="jobs"
              className="flex items-center gap-2 text-xs sm:text-sm py-2"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Job Listings</span>
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="flex items-center gap-2 text-xs sm:text-sm py-2"
            >
              <UserCog className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="mt-6">
            <ServicesManager />
          </TabsContent>

          <TabsContent value="team" className="mt-6">
            <TeamManager />
          </TabsContent>

          <TabsContent value="testimonials" className="mt-6">
            <TestimonialsManager />
          </TabsContent>

          <TabsContent value="jobs" className="mt-6">
            <JobsManager />
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <UsersManager />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
