"use client";

import { useEffect } from "react";
import { db } from "@/lib/database";
import { services, teamMembers, testimonials } from "@/lib/data";
import { initializeDefaultAdmin } from "@/lib/user-database";

// This component initializes the database with default data on first load
export default function DatabaseInitializer() {
  useEffect(() => {
    // Initialize database with default data from data.ts
    db.initialize({
      services: services,
      team: teamMembers,
      testimonials: testimonials,
      jobs: [], // No default jobs
    });

    // Initialize default admin user if it doesn't exist
    initializeDefaultAdmin();
  }, []);

  // This component doesn't render anything
  return null;
}
