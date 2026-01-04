"use client";

import { useEffect, useState } from "react";
import { db, dbEvents } from "./database";
import {
  Service,
  TeamMember,
  Testimonial,
  Job,
  User,
  Contact,
  NewsletterSubscriber,
  JobApplication,
  ActivityLog,
} from "./data";

// Hook to use services from database with real-time updates
export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load initial data
    setServices(db.getServices());
    setLoading(false);

    // Subscribe to changes
    const unsubscribe = dbEvents.subscribe("services", () => {
      setServices(db.getServices());
    });

    return unsubscribe;
  }, []);

  return { services, loading };
}

// Hook to use team members from database with real-time updates
export function useTeam() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTeam(db.getTeam());
    setLoading(false);

    const unsubscribe = dbEvents.subscribe("team", () => {
      setTeam(db.getTeam());
    });

    return unsubscribe;
  }, []);

  return { team, loading };
}

// Hook to use testimonials from database with real-time updates
export function useTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTestimonials(db.getTestimonials());
    setLoading(false);

    const unsubscribe = dbEvents.subscribe("testimonials", () => {
      setTestimonials(db.getTestimonials());
    });

    return unsubscribe;
  }, []);

  return { testimonials, loading };
}

// Hook to use jobs from database with real-time updates
export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setJobs(db.getJobs());
    setLoading(false);

    const unsubscribe = dbEvents.subscribe("jobs", () => {
      setJobs(db.getJobs());
    });

    return unsubscribe;
  }, []);

  return { jobs, loading };
}

// Hook to use users from database with real-time updates
export function useUsers(): { users: User[]; loading: boolean } {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUsers(db.getUsers());
    setLoading(false);

    const unsubscribe = dbEvents.subscribe("users", () => {
      setUsers(db.getUsers());
    });

    return unsubscribe;
  }, []);

  return { users, loading };
}

// Hook to use contacts from database with real-time updates
export function useContacts(): { contacts: Contact[]; loading: boolean } {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setContacts(db.getContacts());
    setLoading(false);

    const unsubscribe = dbEvents.subscribe("contacts", () => {
      setContacts(db.getContacts());
    });

    return unsubscribe;
  }, []);

  return { contacts, loading };
}

// Hook to use newsletter subscribers from database with real-time updates
export function useNewsletterSubscribers(): {
  subscribers: NewsletterSubscriber[];
  loading: boolean;
} {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSubscribers(db.getNewsletterSubscribers());
    setLoading(false);

    const unsubscribe = dbEvents.subscribe("newsletter", () => {
      setSubscribers(db.getNewsletterSubscribers());
    });

    return unsubscribe;
  }, []);

  return { subscribers, loading };
}

// Hook to use job applications from database with real-time updates
export function useApplications(): {
  applications: JobApplication[];
  loading: boolean;
} {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setApplications(db.getApplications());
    setLoading(false);

    const unsubscribe = dbEvents.subscribe("applications", () => {
      setApplications(db.getApplications());
    });

    return unsubscribe;
  }, []);

  return { applications, loading };
}

// Hook to use activity logs from database with real-time updates
export function useActivityLogs(): {
  activityLogs: ActivityLog[];
  loading: boolean;
} {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setActivityLogs(db.getActivityLogs());
    setLoading(false);

    const unsubscribe = dbEvents.subscribe("activityLogs", () => {
      setActivityLogs(db.getActivityLogs());
    });

    return unsubscribe;
  }, []);

  return { activityLogs, loading };
}
