// Centralized Local Database System
// This manages all application data with real-time synchronization

import {
  Service,
  TeamMember,
  Testimonial,
  Job,
  User,
  Contact,
  NewsletterSubscriber,
  JobApplication,
  DataStats,
  ExportData,
  BackupValidationResult,
  ActivityLog,
  ActivityAction,
  EntityType,
} from "./data";

// Database Keys
const DB_KEYS = {
  SERVICES: "edgemakers_db_services",
  TEAM: "edgemakers_db_team",
  TESTIMONIALS: "edgemakers_db_testimonials",
  JOBS: "edgemakers_db_jobs",
  USERS: "edgemakers_db_users",
  CONTACTS: "edgemakers_db_contacts",
  NEWSLETTER: "edgemakers_db_newsletter",
  APPLICATIONS: "edgemakers_db_applications",
  ACTIVITY_LOGS: "edgemakers_db_activity_logs",
  SETTINGS: "edgemakers_db_settings",
} as const;

// Backup constants
const BACKUP_FORMAT_VERSION = "1.0.0";
// Import version dynamically from package.json via environment variable or fallback
const APP_VERSION =
  process.env.NEXT_PUBLIC_APP_VERSION ||
  process.env.npm_package_version ||
  "0.1.0";

// Legacy key mappings for one-time migration
// Map legacy keys (from storage.ts) to new centralized keys
const LEGACY_KEY_MAPPINGS = [
  { legacy: "edgemakers_contacts", new: DB_KEYS.CONTACTS }, // `edgemakers_contacts` -> `edgemakers_db_contacts`
  { legacy: "edgemakers_newsletter", new: DB_KEYS.NEWSLETTER }, // `edgemakers_newsletter` -> `edgemakers_db_newsletter`
  { legacy: "edgemakers_job_applications", new: DB_KEYS.APPLICATIONS }, // `edgemakers_job_applications` -> `edgemakers_db_applications`
  { legacy: "edgemakers_user", new: DB_KEYS.USERS }, // `edgemakers_user` -> `edgemakers_db_users`
] as const;

// Event system for real-time updates
type DatabaseEventType =
  | "services"
  | "team"
  | "testimonials"
  | "jobs"
  | "users"
  | "contacts"
  | "newsletter"
  | "applications"
  | "activityLogs"
  | "settings"
  | "storageWarning";

type DatabaseListener = () => void;

class DatabaseEventEmitter {
  private listeners: Map<DatabaseEventType, Set<DatabaseListener>> = new Map();

  subscribe(event: DatabaseEventType, listener: DatabaseListener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(listener);
    };
  }

  emit(event: DatabaseEventType) {
    this.listeners.get(event)?.forEach((listener) => listener());
  }
}

export const dbEvents = new DatabaseEventEmitter();

// One-time migration from legacy storage keys
function migrateLegacyKeys(): void {
  if (typeof window === "undefined") return;

  try {
    LEGACY_KEY_MAPPINGS.forEach(({ legacy, new: newKey }) => {
      try {
        // Check if legacy key exists
        const legacyData = localStorage.getItem(legacy);
        if (!legacyData) return;

        // Check if new key is empty or missing
        const newData = localStorage.getItem(newKey);
        if (newData && newData !== "[]" && newData !== "{}") return;

        // Migrate: parse legacy data and copy to new key
        const parsedData = JSON.parse(legacyData);
        localStorage.setItem(newKey, JSON.stringify(parsedData));

        // Remove legacy key after successful migration
        localStorage.removeItem(legacy);

        console.log(`Migrated ${legacy} -> ${newKey}`);
      } catch (error) {
        console.warn(`Failed to migrate ${legacy}:`, error);
      }
    });
  } catch (error) {
    console.warn("Legacy key migration encountered an error:", error);
  }
}

// Custom error class for storage quota issues
export class StorageQuotaError extends Error {
  public storageInfo: {
    usagePercentage: number;
    usageBytes: number;
    quotaBytes: number;
  };

  constructor(
    message: string,
    storageInfo: {
      usagePercentage: number;
      usageBytes: number;
      quotaBytes: number;
    }
  ) {
    const formattedMessage = `Storage quota exceeded. Using ${storageInfo.usagePercentage.toFixed(
      1
    )}% (${storageInfo.usageBytes} bytes of ${
      storageInfo.quotaBytes
    } bytes). ${message}`;
    super(formattedMessage);
    this.name = "StorageQuotaError";
    this.storageInfo = storageInfo;
  }
}

// Generic database operations
class Database {
  // Storage monitoring cache and throttle
  private lastStorageCheckTime: number = 0;
  private cachedStorageSize: number = 0;
  private lastWarningTime: number = 0;
  private readonly STORAGE_CHECK_COOLDOWN = 10000; // 10 seconds
  private readonly WARNING_COOLDOWN = 60000; // 60 seconds

  private getItem<T>(key: string, defaultValue: T): T {
    if (typeof window === "undefined") return defaultValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading ${key}:`, error);
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    if (typeof window === "undefined") return;

    // Check if storage is near capacity before writing (with throttling)
    const now = Date.now();
    if (
      this.isStorageNearCapacity() &&
      now - this.lastWarningTime > this.WARNING_COOLDOWN
    ) {
      dbEvents.emit("storageWarning");
      this.lastWarningTime = now;
    }

    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error: any) {
      // Check if this is a quota exceeded error (Chrome, Firefox, Safari)
      const isQuotaError =
        error.name === "QuotaExceededError" ||
        error.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
        error.code === 22 ||
        error.code === 1014;

      if (isQuotaError) {
        console.warn("Storage quota exceeded, attempting cleanup...");

        // Calculate size of data being written
        const bytesNeeded = JSON.stringify(value).length * 2;

        // Attempt automatic cleanup
        const cleanupSuccessful = this.cleanupOldData(bytesNeeded);

        if (cleanupSuccessful) {
          try {
            // Retry the write after cleanup
            localStorage.setItem(key, JSON.stringify(value));
            console.log("Successfully saved data after cleanup");
            return;
          } catch (retryError) {
            console.error("Failed to save data even after cleanup");
          }
        }

        // If we get here, cleanup failed or retry failed
        const storageSize = this.getStorageSize();
        const storagePercentage = this.getStorageUsagePercentage();
        const quotaBytes = 5 * 1024 * 1024; // 5MB

        // Dispatch window event for StorageMonitor
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("storage:quotaError", {
              detail: {
                usageBytes: storageSize,
                usagePercentage: storagePercentage,
                quotaBytes: quotaBytes,
              },
            })
          );
        }

        throw new StorageQuotaError(
          "Failed to save data even after cleanup. Please export your data and clear old entries.",
          {
            usagePercentage: storagePercentage,
            usageBytes: storageSize,
            quotaBytes: quotaBytes,
          }
        );
      }

      // Re-throw other errors
      console.error(`Error writing ${key}:`, error);
      throw error;
    }
  }

  // Storage Utility Methods
  getStorageSize(): number {
    if (typeof window === "undefined") return 0;

    // Use cached value if within cooldown period
    const now = Date.now();
    if (
      this.cachedStorageSize > 0 &&
      now - this.lastStorageCheckTime < this.STORAGE_CHECK_COOLDOWN
    ) {
      return this.cachedStorageSize;
    }

    try {
      let totalSize = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          if (value) {
            // Each character is 2 bytes in UTF-16
            totalSize += (key.length + value.length) * 2;
          }
        }
      }

      // Cache the result
      this.cachedStorageSize = totalSize;
      this.lastStorageCheckTime = now;

      return totalSize;
    } catch (error) {
      console.error("Error calculating storage size:", error);
      return 0;
    }
  }

  getStorageUsagePercentage(): number {
    try {
      const quotaBytes = 5 * 1024 * 1024; // 5MB conservative limit
      const usageBytes = this.getStorageSize();
      const percentage = (usageBytes / quotaBytes) * 100;
      return Math.round(percentage * 100) / 100; // Round to 2 decimal places
    } catch (error) {
      console.error("Error calculating storage percentage:", error);
      return 0;
    }
  }

  isStorageNearCapacity(): boolean {
    try {
      return this.getStorageUsagePercentage() > 80;
    } catch (error) {
      console.error("Error checking storage capacity:", error);
      return false;
    }
  }

  cleanupOldData(bytesNeeded: number): boolean {
    try {
      console.log(`Attempting to free up space. Need: ${bytesNeeded} bytes`);

      const sizeBefore = this.getStorageSize();

      // Get all submission data
      const contacts = this.getContacts();
      const subscribers = this.getNewsletterSubscribers();
      const applications = this.getApplications();

      // Sort by timestamp (oldest first)
      const sortedContacts = [...contacts].sort(
        (a, b) =>
          new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
      );
      const sortedSubscribers = [...subscribers].sort(
        (a, b) =>
          new Date(a.subscribedAt).getTime() -
          new Date(b.subscribedAt).getTime()
      );
      const sortedApplications = [...applications].sort(
        (a, b) =>
          new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
      );

      // Calculate 20% of each collection
      const contactsToRemove = Math.ceil(sortedContacts.length * 0.2);
      const subscribersToRemove = Math.ceil(sortedSubscribers.length * 0.2);
      const applicationsToRemove = Math.ceil(sortedApplications.length * 0.2);

      // Remove oldest entries
      const newContacts = sortedContacts.slice(contactsToRemove);
      const newSubscribers = sortedSubscribers.slice(subscribersToRemove);
      const newApplications = sortedApplications.slice(applicationsToRemove);

      console.log(
        `Cleanup: Removing ${contactsToRemove} contacts, ${subscribersToRemove} subscribers, ${applicationsToRemove} applications`
      );

      // Save cleaned data with individual try-catch to prevent partial failures
      if (typeof window !== "undefined") {
        // Try to save contacts
        try {
          localStorage.setItem(DB_KEYS.CONTACTS, JSON.stringify(newContacts));
          dbEvents.emit("contacts");
          console.log("Cleaned contacts saved successfully");
        } catch (error) {
          console.error("Failed to save cleaned contacts:", error);
        }

        // Try to save subscribers
        try {
          localStorage.setItem(
            DB_KEYS.NEWSLETTER,
            JSON.stringify(newSubscribers)
          );
          dbEvents.emit("newsletter");
          console.log("Cleaned subscribers saved successfully");
        } catch (error) {
          console.error("Failed to save cleaned subscribers:", error);
        }

        // Try to save applications
        try {
          localStorage.setItem(
            DB_KEYS.APPLICATIONS,
            JSON.stringify(newApplications)
          );
          dbEvents.emit("applications");
          console.log("Cleaned applications saved successfully");
        } catch (error) {
          console.error("Failed to save cleaned applications:", error);
        }
      }

      const sizeAfter = this.getStorageSize();
      const freedBytes = sizeBefore - sizeAfter;

      console.log(
        `Cleanup completed. Freed ${freedBytes} bytes (needed ${bytesNeeded})`
      );

      return freedBytes >= bytesNeeded * 0.5; // Success if freed at least 50% of needed space
    } catch (error) {
      console.error("Error during cleanup:", error);
      return false;
    }
  }

  // Services
  getServices(): Service[] {
    return this.getItem<Service[]>(DB_KEYS.SERVICES, []);
  }

  setServices(services: Service[]): void {
    this.setItem(DB_KEYS.SERVICES, services);
    dbEvents.emit("services");
  }

  addService(service: Omit<Service, "id">): void {
    const services = this.getServices();
    const newService: Service = {
      ...service,
      id: `service-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    };
    services.push(newService);
    this.setServices(services);
    this.logActivity("create", "service", newService.id, newService.title);
  }

  updateService(id: string, updates: Partial<Service>): void {
    const services = this.getServices();
    const index = services.findIndex((s) => s.id === id);
    if (index !== -1) {
      const serviceName = services[index].title;
      services[index] = { ...services[index], ...updates };
      this.setServices(services);
      this.logActivity("update", "service", id, serviceName, "Service updated");
    }
  }

  deleteService(id: string): void {
    const services = this.getServices();
    const service = services.find((s) => s.id === id);
    const serviceName = service?.title || "Unknown Service";
    const filtered = services.filter((s) => s.id !== id);
    this.setServices(filtered);
    this.logActivity("delete", "service", id, serviceName);
  }

  // Team Members
  getTeam(): TeamMember[] {
    return this.getItem<TeamMember[]>(DB_KEYS.TEAM, []);
  }

  setTeam(team: TeamMember[]): void {
    this.setItem(DB_KEYS.TEAM, team);
    dbEvents.emit("team");
  }

  addTeamMember(member: Omit<TeamMember, "id">): void {
    const team = this.getTeam();
    const newMember: TeamMember = {
      ...member,
      id: `team-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    };
    team.push(newMember);
    this.setTeam(team);
    this.logActivity("create", "team", newMember.id, newMember.name);
  }

  updateTeamMember(id: string, updates: Partial<TeamMember>): void {
    const team = this.getTeam();
    const index = team.findIndex((m) => m.id === id);
    if (index !== -1) {
      const memberName = team[index].name;
      team[index] = { ...team[index], ...updates };
      this.setTeam(team);
      this.logActivity("update", "team", id, memberName, "Team member updated");
    }
  }

  deleteTeamMember(id: string): void {
    const team = this.getTeam();
    const member = team.find((m) => m.id === id);
    const memberName = member?.name || "Unknown Member";
    const filtered = team.filter((m) => m.id !== id);
    this.setTeam(filtered);
    this.logActivity("delete", "team", id, memberName);
  }

  // Testimonials
  getTestimonials(): Testimonial[] {
    return this.getItem<Testimonial[]>(DB_KEYS.TESTIMONIALS, []);
  }

  setTestimonials(testimonials: Testimonial[]): void {
    this.setItem(DB_KEYS.TESTIMONIALS, testimonials);
    dbEvents.emit("testimonials");
  }

  addTestimonial(testimonial: Omit<Testimonial, "id">): void {
    const testimonials = this.getTestimonials();
    const newTestimonial: Testimonial = {
      ...testimonial,
      id: `testimonial-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 11)}`,
    };
    testimonials.push(newTestimonial);
    this.setTestimonials(testimonials);
    this.logActivity(
      "create",
      "testimonial",
      newTestimonial.id,
      newTestimonial.author
    );
  }

  updateTestimonial(id: string, updates: Partial<Testimonial>): void {
    const testimonials = this.getTestimonials();
    const index = testimonials.findIndex((t) => t.id === id);
    if (index !== -1) {
      const testimonialAuthor = testimonials[index].author;
      testimonials[index] = { ...testimonials[index], ...updates };
      this.setTestimonials(testimonials);
      this.logActivity(
        "update",
        "testimonial",
        id,
        testimonialAuthor,
        "Testimonial updated"
      );
    }
  }

  deleteTestimonial(id: string): void {
    const testimonials = this.getTestimonials();
    const testimonial = testimonials.find((t) => t.id === id);
    const testimonialAuthor = testimonial?.author || "Unknown Author";
    const filtered = testimonials.filter((t) => t.id !== id);
    this.setTestimonials(filtered);
    this.logActivity("delete", "testimonial", id, testimonialAuthor);
  }

  // Jobs
  getJobs(): Job[] {
    return this.getItem<Job[]>(DB_KEYS.JOBS, []);
  }

  setJobs(jobs: Job[]): void {
    this.setItem(DB_KEYS.JOBS, jobs);
    dbEvents.emit("jobs");
  }

  addJob(job: Omit<Job, "id">): void {
    const jobs = this.getJobs();
    const newJob: Job = {
      ...job,
      id: `job-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    };
    jobs.push(newJob);
    this.setJobs(jobs);
    this.logActivity("create", "job", newJob.id, newJob.title);
  }

  updateJob(id: string, updates: Partial<Job>): void {
    const jobs = this.getJobs();
    const index = jobs.findIndex((j) => j.id === id);
    if (index !== -1) {
      const jobTitle = jobs[index].title;
      jobs[index] = { ...jobs[index], ...updates };
      this.setJobs(jobs);
      this.logActivity("update", "job", id, jobTitle, "Job updated");
    }
  }

  deleteJob(id: string): void {
    const jobs = this.getJobs();
    const job = jobs.find((j) => j.id === id);
    const jobTitle = job?.title || "Unknown Job";
    const filtered = jobs.filter((j) => j.id !== id);
    this.setJobs(filtered);
    this.logActivity("delete", "job", id, jobTitle);
  }

  // Users
  getUsers(): User[] {
    return this.getItem<User[]>(DB_KEYS.USERS, []);
  }

  setUsers(users: User[]): void {
    this.setItem(DB_KEYS.USERS, users);
    dbEvents.emit("users");
  }

  // Contacts
  getContacts(): Contact[] {
    return this.getItem<Contact[]>(DB_KEYS.CONTACTS, []);
  }

  addContact(contact: Contact): void {
    const contacts = this.getContacts();
    contacts.push(contact);
    this.setItem(DB_KEYS.CONTACTS, contacts);
    dbEvents.emit("contacts");
    this.logActivity(
      "create",
      "contact",
      contact.id,
      contact.name || contact.email
    );
  }

  // Newsletter
  getNewsletterSubscribers(): NewsletterSubscriber[] {
    return this.getItem<NewsletterSubscriber[]>(DB_KEYS.NEWSLETTER, []);
  }

  addNewsletterSubscriber(subscriber: NewsletterSubscriber): void {
    const subscribers = this.getNewsletterSubscribers();
    subscribers.push(subscriber);
    this.setItem(DB_KEYS.NEWSLETTER, subscribers);
    dbEvents.emit("newsletter");
    this.logActivity(
      "create",
      "newsletter",
      subscriber.id,
      subscriber.email || subscriber.whatsapp || "Subscriber"
    );
  }

  // Job Applications
  getApplications(): JobApplication[] {
    return this.getItem<JobApplication[]>(DB_KEYS.APPLICATIONS, []);
  }

  addApplication(application: JobApplication): void {
    const applications = this.getApplications();
    applications.push(application);
    this.setItem(DB_KEYS.APPLICATIONS, applications);
    dbEvents.emit("applications");
    this.logActivity(
      "create",
      "application",
      application.id,
      application.name,
      `Position: ${application.position}`
    );
  }

  // Activity Log Methods
  getActivityLogs(): ActivityLog[] {
    return this.getItem<ActivityLog[]>(DB_KEYS.ACTIVITY_LOGS, []);
  }

  addActivityLog(log: Omit<ActivityLog, "id" | "timestamp">): void {
    try {
      const logs = this.getActivityLogs();
      const newLog: ActivityLog = {
        ...log,
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        timestamp: new Date().toISOString(),
      };
      logs.push(newLog);
      this.setItem(DB_KEYS.ACTIVITY_LOGS, logs);
      dbEvents.emit("activityLogs");
      this.cleanupOldActivityLogs();
    } catch (error) {
      console.error("Failed to add activity log:", error);
      // Fail gracefully - don't throw to avoid breaking CRUD operations
    }
  }

  cleanupOldActivityLogs(daysToKeep: number = 30): number {
    try {
      const logs = this.getActivityLogs();
      const cutoffDate = new Date(
        Date.now() - daysToKeep * 24 * 60 * 60 * 1000
      );
      const filteredLogs = logs.filter(
        (log) => new Date(log.timestamp) >= cutoffDate
      );

      if (filteredLogs.length < logs.length) {
        this.setItem(DB_KEYS.ACTIVITY_LOGS, filteredLogs);
        dbEvents.emit("activityLogs");
        return logs.length - filteredLogs.length;
      }

      return 0;
    } catch (error) {
      console.error("Failed to cleanup activity logs:", error);
      return 0;
    }
  }

  private getCurrentUser(): string {
    try {
      const userStr = localStorage.getItem("edgemakers_user");
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.email || user.name || "Admin";
      }
    } catch (error) {
      console.error("Failed to get current user:", error);
    }
    return "System";
  }

  private logActivity(
    action: ActivityAction,
    entityType: EntityType,
    entityId: string,
    entityName: string,
    details?: string
  ): void {
    try {
      const user = this.getCurrentUser();
      this.addActivityLog({
        action,
        entityType,
        entityId,
        entityName,
        user,
        details,
      });
    } catch (error) {
      console.error("Failed to log activity:", error);
      // Fail gracefully
    }
  }

  // Validation Utilities
  private getMinutesSince(isoTimestamp: string): number {
    try {
      const timestamp = new Date(isoTimestamp);
      const now = new Date();
      const diffMs = now.getTime() - timestamp.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return diffMinutes;
    } catch (error) {
      return Infinity; // Return Infinity on error to prevent false positives
    }
  }

  isDuplicateNewsletterEmail(email: string): boolean {
    try {
      const subscribers = this.getNewsletterSubscribers();
      const normalizedEmail = email.trim().toLowerCase();
      return subscribers.some(
        (sub) => sub.email && sub.email.trim().toLowerCase() === normalizedEmail
      );
    } catch (error) {
      return false;
    }
  }

  isRecentContactSubmission(
    email: string,
    minutesThreshold: number = 5
  ): { isDuplicate: boolean; lastSubmission?: Contact } {
    try {
      const contacts = this.getContacts();
      const matchingContacts = contacts.filter(
        (c) => c.email.toLowerCase() === email.toLowerCase()
      );

      if (matchingContacts.length === 0) {
        return { isDuplicate: false };
      }

      // Find the most recent submission
      const lastSubmission = matchingContacts.sort(
        (a, b) =>
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      )[0];

      const minutesSince = this.getMinutesSince(lastSubmission.submittedAt);

      if (minutesSince < minutesThreshold) {
        return { isDuplicate: true, lastSubmission };
      }

      return { isDuplicate: false, lastSubmission };
    } catch (error) {
      return { isDuplicate: false };
    }
  }

  isRecentJobApplication(
    email: string,
    position: string,
    minutesThreshold: number = 5
  ): { isDuplicate: boolean; lastApplication?: JobApplication } {
    try {
      const applications = this.getApplications();
      const matchingApplications = applications.filter(
        (app) =>
          app.email.toLowerCase() === email.toLowerCase() &&
          app.position.toLowerCase() === position.toLowerCase()
      );

      if (matchingApplications.length === 0) {
        return { isDuplicate: false };
      }

      // Find the most recent application
      const lastApplication = matchingApplications.sort(
        (a, b) =>
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      )[0];

      const minutesSince = this.getMinutesSince(lastApplication.submittedAt);

      if (minutesSince < minutesThreshold) {
        return { isDuplicate: true, lastApplication };
      }

      return { isDuplicate: false, lastApplication };
    } catch (error) {
      return { isDuplicate: false };
    }
  }

  // Initialize database with default data if empty
  initialize(defaultData: {
    services?: Service[];
    team?: TeamMember[];
    testimonials?: Testimonial[];
    jobs?: Job[];
  }): void {
    if (typeof window === "undefined") return;

    // Initialize services if empty
    if (this.getServices().length === 0 && defaultData.services) {
      this.setServices(defaultData.services);
    }

    // Initialize team if empty
    if (this.getTeam().length === 0 && defaultData.team) {
      this.setTeam(defaultData.team);
    }

    // Initialize testimonials if empty
    if (this.getTestimonials().length === 0 && defaultData.testimonials) {
      this.setTestimonials(defaultData.testimonials);
    }

    // Initialize jobs if empty
    if (this.getJobs().length === 0 && defaultData.jobs) {
      this.setJobs(defaultData.jobs);
    }
  }

  // Clear all data (for testing/reset)
  clearAll(): void {
    if (typeof window === "undefined") return;

    this.logActivity("delete", "backup", "clear-all", "Clear All Data");

    // Remove all current DB_KEYS
    Object.values(DB_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });

    // Also remove legacy keys to ensure complete cleanup
    LEGACY_KEY_MAPPINGS.forEach(({ legacy }) => {
      localStorage.removeItem(legacy);
    });

    // Emit all events to trigger re-renders
    dbEvents.emit("services");
    dbEvents.emit("team");
    dbEvents.emit("testimonials");
    dbEvents.emit("jobs");
    dbEvents.emit("users");
    dbEvents.emit("contacts");
    dbEvents.emit("newsletter");
    dbEvents.emit("applications");
    dbEvents.emit("activityLogs");
  }

  // Export all data
  exportAll(): ExportData {
    return {
      version: BACKUP_FORMAT_VERSION,
      appVersion: APP_VERSION,
      backupId:
        "backup-" + Date.now() + "-" + Math.random().toString(36).slice(2, 11),
      services: this.getServices(),
      team: this.getTeam(),
      testimonials: this.getTestimonials(),
      jobs: this.getJobs(),
      users: this.getUsers(),
      contacts: this.getContacts(),
      newsletter: this.getNewsletterSubscribers(),
      applications: this.getApplications(),
      activityLogs: this.getActivityLogs(),
      exportedAt: new Date().toISOString(),
    };
  }

  // Validate backup file
  validateBackupFile(data: any): BackupValidationResult {
    try {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Check if data is an object
      if (!data || typeof data !== "object" || Array.isArray(data)) {
        return {
          isValid: false,
          errors: ["Invalid backup file format"],
          warnings: [],
        };
      }

      // Validate required fields exist
      const requiredFields = [
        "services",
        "team",
        "testimonials",
        "jobs",
        "users",
        "contacts",
        "newsletter",
        "applications",
        "exportedAt",
      ];

      for (const field of requiredFields) {
        if (!(field in data)) {
          errors.push(`Missing required field: ${field}`);
        }
      }

      // Check version compatibility with semantic versioning
      if (data.version) {
        // Parse semantic versions
        const parseVersion = (
          version: string
        ): { major: number; minor: number; patch: number } | null => {
          const match = version.match(/^(\d+)\.(\d+)\.(\d+)/);
          if (!match) return null;
          return {
            major: parseInt(match[1], 10),
            minor: parseInt(match[2], 10),
            patch: parseInt(match[3], 10),
          };
        };

        const backupVersion = parseVersion(data.version);
        const currentVersion = parseVersion(BACKUP_FORMAT_VERSION);

        if (backupVersion && currentVersion) {
          if (backupVersion.major !== currentVersion.major) {
            // Major version mismatch is an error
            errors.push(
              `Incompatible backup format version: ${data.version} (current: ${BACKUP_FORMAT_VERSION}). Major version mismatch.`
            );
          } else if (
            backupVersion.minor !== currentVersion.minor ||
            backupVersion.patch !== currentVersion.patch
          ) {
            // Minor/patch mismatch is a warning
            warnings.push(
              `Backup version (${data.version}) differs from current version (${BACKUP_FORMAT_VERSION})`
            );
          }
        } else {
          // Could not parse version
          warnings.push(`Unable to parse version information: ${data.version}`);
        }
      } else {
        warnings.push(
          "Backup does not include version information (limited compatibility)"
        );
      }

      // Validate data types
      const arrayFields = [
        "services",
        "team",
        "testimonials",
        "jobs",
        "users",
        "contacts",
        "newsletter",
        "applications",
      ];

      for (const field of arrayFields) {
        if (data[field] && !Array.isArray(data[field])) {
          errors.push(`Invalid data type for ${field}: expected array`);
        }
      }

      // Validate array contents (basic structure check)
      if (Array.isArray(data.services)) {
        data.services.forEach((item: any, index: number) => {
          if (!item.id || !item.title) {
            errors.push(`Invalid service structure at index ${index}`);
          }
        });
      }

      // Count records
      const recordCounts = {
        services: Array.isArray(data.services) ? data.services.length : 0,
        team: Array.isArray(data.team) ? data.team.length : 0,
        testimonials: Array.isArray(data.testimonials)
          ? data.testimonials.length
          : 0,
        jobs: Array.isArray(data.jobs) ? data.jobs.length : 0,
        users: Array.isArray(data.users) ? data.users.length : 0,
        contacts: Array.isArray(data.contacts) ? data.contacts.length : 0,
        newsletter: Array.isArray(data.newsletter) ? data.newsletter.length : 0,
        applications: Array.isArray(data.applications)
          ? data.applications.length
          : 0,
      };

      if (errors.length > 0) {
        return { isValid: false, errors, warnings };
      }

      return {
        isValid: true,
        errors: [],
        warnings,
        metadata: {
          version: data.version || "unknown",
          appVersion: data.appVersion || "unknown",
          exportedAt: data.exportedAt,
          recordCounts,
        },
      };
    } catch (error) {
      return {
        isValid: false,
        errors: ["Invalid backup file format"],
        warnings: [],
      };
    }
  }

  // Import data (Replace strategy: overwrites all existing data with backup data)
  // Explicitly clears collections that are missing from backup to ensure true replace
  // Use importAllMerge() to merge instead of replace
  importAll(data: Partial<ExportData>): void {
    // Replace or clear services
    if (data.services) {
      this.setServices(data.services);
    } else {
      this.setServices([]);
    }

    // Replace or clear team
    if (data.team) {
      this.setTeam(data.team);
    } else {
      this.setTeam([]);
    }

    // Replace or clear testimonials
    if (data.testimonials) {
      this.setTestimonials(data.testimonials);
    } else {
      this.setTestimonials([]);
    }

    // Replace or clear jobs
    if (data.jobs) {
      this.setJobs(data.jobs);
    } else {
      this.setJobs([]);
    }

    // Replace or clear users
    if (data.users) {
      this.setUsers(data.users);
    } else {
      this.setUsers([]);
    }

    // Replace or clear contacts
    if (data.contacts) {
      this.setItem(DB_KEYS.CONTACTS, data.contacts);
      dbEvents.emit("contacts");
    } else {
      this.setItem(DB_KEYS.CONTACTS, []);
      dbEvents.emit("contacts");
    }

    // Replace or clear newsletter
    if (data.newsletter) {
      this.setItem(DB_KEYS.NEWSLETTER, data.newsletter);
      dbEvents.emit("newsletter");
    } else {
      this.setItem(DB_KEYS.NEWSLETTER, []);
      dbEvents.emit("newsletter");
    }

    // Replace or clear applications
    if (data.applications) {
      this.setItem(DB_KEYS.APPLICATIONS, data.applications);
      dbEvents.emit("applications");
    } else {
      this.setItem(DB_KEYS.APPLICATIONS, []);
      dbEvents.emit("applications");
    }

    // Replace or clear activity logs
    if (data.activityLogs) {
      this.setItem(DB_KEYS.ACTIVITY_LOGS, data.activityLogs);
      dbEvents.emit("activityLogs");
    } else {
      this.setItem(DB_KEYS.ACTIVITY_LOGS, []);
      dbEvents.emit("activityLogs");
    }

    this.logActivity("import", "backup", "restore", "Full Restore");
  }

  // Import data with merge strategy (combines backup with existing data)
  importAllMerge(data: Partial<ExportData>): void {
    // Helper function to merge arrays by id
    // Preserves backup order, appending existing-only items at the end
    const mergeById = <T extends { id: string }>(
      existing: T[],
      backup: T[]
    ): T[] => {
      const map = new Map<string, T>();
      // Seed map with backup items first
      backup.forEach((item) => map.set(item.id, item));
      // Overlay existing items (keeps any not present in backup)
      existing.forEach((item) => {
        if (!map.has(item.id)) {
          map.set(item.id, item);
        }
      });

      // Return items in backup order, appending existing-only items at end
      const result: T[] = [];
      const backupIds = new Set(backup.map((item) => item.id));

      // Add backup items in order
      backup.forEach((item) => {
        result.push(map.get(item.id)!);
      });

      // Append existing-only items
      existing.forEach((item) => {
        if (!backupIds.has(item.id)) {
          result.push(item);
        }
      });

      return result;
    };

    // Merge services
    if (data.services) {
      const existing = this.getServices();
      const merged = mergeById(existing, data.services);
      this.setServices(merged);
    }

    // Merge team
    if (data.team) {
      const existing = this.getTeam();
      const merged = mergeById(existing, data.team);
      this.setTeam(merged);
    }

    // Merge testimonials
    if (data.testimonials) {
      const existing = this.getTestimonials();
      const merged = mergeById(existing, data.testimonials);
      this.setTestimonials(merged);
    }

    // Merge jobs
    if (data.jobs) {
      const existing = this.getJobs();
      const merged = mergeById(existing, data.jobs);
      this.setJobs(merged);
    }

    // Merge users (preserve passwords from existing users)
    if (data.users) {
      const existing = this.getUsers();
      const existingMap = new Map(existing.map((u) => [u.id, u]));
      const merged = mergeById(existing, data.users).map((user) => {
        const existingUser = existingMap.get(user.id);
        // Preserve password if it exists in the existing user
        if (existingUser && existingUser.password) {
          return { ...user, password: existingUser.password };
        }
        return user;
      });
      this.setUsers(merged);
    }

    // Contacts: de-duplicate by id before saving
    if (data.contacts) {
      const existing = this.getContacts();
      const contactMap = new Map<string, Contact>();
      // Insert existing first
      existing.forEach((contact) => contactMap.set(contact.id, contact));
      // Insert backup entries (may override existing with same id)
      data.contacts.forEach((contact) => contactMap.set(contact.id, contact));
      const merged = Array.from(contactMap.values());
      this.setItem(DB_KEYS.CONTACTS, merged);
      dbEvents.emit("contacts");
    }

    // Newsletter: merge by email or whatsapp (case-insensitive)
    if (data.newsletter) {
      const existing = this.getNewsletterSubscribers();
      const contactMap = new Map<string, NewsletterSubscriber>();
      existing.forEach((sub) => {
        const key = (sub.email || sub.whatsapp || sub.id).toLowerCase();
        contactMap.set(key, sub);
      });
      data.newsletter.forEach((sub) => {
        const key = (sub.email || sub.whatsapp || sub.id).toLowerCase();
        const existingSub = contactMap.get(key);
        // Keep most recent subscription
        if (
          !existingSub ||
          new Date(sub.subscribedAt) > new Date(existingSub.subscribedAt)
        ) {
          contactMap.set(key, sub);
        }
      });
      const merged = Array.from(contactMap.values());
      this.setItem(DB_KEYS.NEWSLETTER, merged);
      dbEvents.emit("newsletter");
    }

    // Applications: de-duplicate by id before saving
    if (data.applications) {
      const existing = this.getApplications();
      const applicationMap = new Map<string, JobApplication>();
      // Insert existing first
      existing.forEach((app) => applicationMap.set(app.id, app));
      // Insert backup entries (may override existing with same id)
      data.applications.forEach((app) => applicationMap.set(app.id, app));
      const merged = Array.from(applicationMap.values());
      this.setItem(DB_KEYS.APPLICATIONS, merged);
      dbEvents.emit("applications");
    }

    // Activity Logs: merge by id, keeping newer entries
    if (data.activityLogs) {
      const existing = this.getActivityLogs();
      const logMap = new Map<string, ActivityLog>();
      // Insert existing first
      existing.forEach((log) => logMap.set(log.id, log));
      // Insert backup entries (may override existing with same id, keeping newer)
      data.activityLogs.forEach((log) => {
        const existingLog = logMap.get(log.id);
        if (
          !existingLog ||
          new Date(log.timestamp) > new Date(existingLog.timestamp)
        ) {
          logMap.set(log.id, log);
        }
      });
      const merged = Array.from(logMap.values());
      this.setItem(DB_KEYS.ACTIVITY_LOGS, merged);
      dbEvents.emit("activityLogs");
    }

    this.logActivity("import", "backup", "merge", "Merge Restore");
  }

  // Export utilities - JSON
  exportContactsAsJSON(): string {
    try {
      const contacts = this.getContacts();
      return JSON.stringify(contacts, null, 2);
    } catch (error) {
      console.error("Error exporting contacts as JSON:", error);
      return "[]";
    }
  }

  exportNewsletterAsJSON(): string {
    try {
      const subscribers = this.getNewsletterSubscribers();
      return JSON.stringify(subscribers, null, 2);
    } catch (error) {
      console.error("Error exporting newsletter as JSON:", error);
      return "[]";
    }
  }

  exportJobApplicationsAsJSON(): string {
    try {
      const applications = this.getApplications();
      return JSON.stringify(applications, null, 2);
    } catch (error) {
      console.error("Error exporting job applications as JSON:", error);
      return "[]";
    }
  }

  // Export utilities - CSV
  exportContactsAsCSV(): string {
    try {
      const contacts = this.getContacts();
      if (contacts.length === 0) return "";

      // Helper function to escape and quote CSV fields
      const escapeCSVField = (value: any): string => {
        // Convert to string
        const stringValue = String(value ?? "");
        // Escape double quotes by doubling them
        const escaped = stringValue.replace(/"/g, '""');
        // Wrap in double quotes
        return `"${escaped}"`;
      };

      // CSV Headers
      const headers = [
        "ID",
        "Name",
        "Email",
        "Phone",
        "Service",
        "Message",
        "Submitted At",
        "Status",
      ];
      const csvRows = [headers.join(",")];

      // CSV Data Rows
      contacts.forEach((contact: Contact) => {
        const row = [
          escapeCSVField(contact.id || ""),
          escapeCSVField(contact.name || ""),
          escapeCSVField(contact.email || ""),
          escapeCSVField(contact.phone || ""),
          escapeCSVField(contact.service || ""),
          escapeCSVField(contact.message || ""),
          escapeCSVField(contact.submittedAt || ""),
          escapeCSVField(contact.status || "new"),
        ];
        csvRows.push(row.join(","));
      });

      return csvRows.join("\n");
    } catch (error) {
      console.error("Error exporting contacts as CSV:", error);
      return "";
    }
  }

  exportNewsletterEmailsAsCSV(): string {
    try {
      const subscribers = this.getNewsletterSubscribers();
      if (subscribers.length === 0) return "";

      const escapeCSVField = (value: any): string => {
        const stringValue = String(value ?? "");
        const escaped = stringValue.replace(/"/g, '""');
        return `"${escaped}"`;
      };

      const headers = ["Email", "Subscribed At", "Status"];
      const csvRows = [headers.join(",")];

      subscribers.forEach((s) => {
        const row = [
          escapeCSVField(s.email || ""),
          escapeCSVField(s.subscribedAt || ""),
          escapeCSVField(s.status || ""),
        ];
        csvRows.push(row.join(","));
      });

      return csvRows.join("\n");
    } catch (error) {
      console.error("Error exporting newsletter emails as CSV:", error);
      return "";
    }
  }

  exportNewsletterWhatsAppAsCSV(): string {
    try {
      const subscribers = this.getNewsletterSubscribers();
      const filtered = subscribers.filter(
        (s) => s.whatsapp && String(s.whatsapp).trim()
      );
      if (filtered.length === 0) return "";

      const escapeCSVField = (value: any): string => {
        const stringValue = String(value ?? "");
        const escaped = stringValue.replace(/"/g, '""');
        return `"${escaped}"`;
      };

      const headers = ["WhatsApp Number", "Email", "Subscribed At", "Status"];
      const csvRows = [headers.join(",")];

      filtered.forEach((s) => {
        const row = [
          escapeCSVField(s.whatsapp || ""),
          escapeCSVField(s.email || ""),
          escapeCSVField(s.subscribedAt || ""),
          escapeCSVField(s.status || ""),
        ];
        csvRows.push(row.join(","));
      });

      return csvRows.join("\n");
    } catch (error) {
      console.error("Error exporting newsletter WhatsApp as CSV:", error);
      return "";
    }
  }

  // Download utilities
  downloadContactsAsCSV(): void {
    if (typeof window === "undefined") return;

    try {
      const csvData = this.exportContactsAsCSV();
      if (!csvData) {
        console.warn("No contacts to download");
        return;
      }

      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      const date = new Date().toISOString().split("T")[0];
      link.href = url;
      link.download = `edgemakers-contacts-${date}.csv`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading contacts CSV:", error);
    }
  }

  downloadNewsletterEmailsAsCSV(): void {
    if (typeof window === "undefined") return;

    try {
      const csvData = this.exportNewsletterEmailsAsCSV();
      if (!csvData) {
        console.warn("No newsletter emails to download");
        return;
      }

      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      const date = new Date().toISOString().split("T")[0];
      link.href = url;
      link.download = `edgemakers-newsletter-emails-${date}.csv`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading newsletter emails CSV:", error);
    }
  }

  downloadNewsletterWhatsAppAsCSV(): void {
    if (typeof window === "undefined") return;

    try {
      const csvData = this.exportNewsletterWhatsAppAsCSV();
      if (!csvData) {
        console.warn("No newsletter WhatsApp numbers to download");
        return;
      }

      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      const date = new Date().toISOString().split("T")[0];
      link.href = url;
      link.download = `edgemakers-newsletter-whatsapp-${date}.csv`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading newsletter WhatsApp CSV:", error);
    }
  }

  downloadDataAsJSON(filename: string, data: any): void {
    if (typeof window === "undefined") return;

    try {
      const jsonData = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonData], {
        type: "application/json;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading JSON data:", error);
    }
  }

  // Download backup with enhanced naming
  downloadBackup(description?: string): void {
    const data = this.exportAll();
    if (description) {
      (data as any).description = description;
    }
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .replace(/T/, "_")
      .split(".")[0];
    const filename = `edgemakers-backup-${timestamp}.json`;
    this.downloadDataAsJSON(filename, data);
  }

  // Statistics
  getDataStats(): DataStats {
    try {
      const contacts = this.getContacts();
      const subscribers = this.getNewsletterSubscribers();
      const applications = this.getApplications();

      return {
        totalContacts: contacts.length,
        totalSubscribers: subscribers.length,
        totalApplications: applications.length,
        newContacts: contacts.filter((c: Contact) => c.status === "new").length,
        activeSubscribers: subscribers.filter(
          (s: NewsletterSubscriber) => s.status === "active"
        ).length,
        pendingApplications: applications.filter(
          (a: JobApplication) => a.status === "pending"
        ).length,
        storageUsageBytes: this.getStorageSize(),
        storageUsagePercentage: this.getStorageUsagePercentage(),
        storageNearCapacity: this.isStorageNearCapacity(),
      };
    } catch (error) {
      console.error("Error getting data stats:", error);
      return {
        totalContacts: 0,
        totalSubscribers: 0,
        totalApplications: 0,
        newContacts: 0,
        activeSubscribers: 0,
        pendingApplications: 0,
        storageUsageBytes: 0,
        storageUsagePercentage: 0,
        storageNearCapacity: false,
      };
    }
  }
}

// Singleton instance
export const db = new Database();

// Run one-time migration at module load
if (typeof window !== "undefined") {
  migrateLegacyKeys();
}

// Cross-tab synchronization - Listen for localStorage changes from other tabs
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    // When localStorage changes in another tab, emit the corresponding event
    if (event.key === DB_KEYS.SERVICES) {
      dbEvents.emit("services");
    } else if (event.key === DB_KEYS.TEAM) {
      dbEvents.emit("team");
    } else if (event.key === DB_KEYS.TESTIMONIALS) {
      dbEvents.emit("testimonials");
    } else if (event.key === DB_KEYS.JOBS) {
      dbEvents.emit("jobs");
    } else if (event.key === DB_KEYS.USERS) {
      dbEvents.emit("users");
    } else if (event.key === DB_KEYS.CONTACTS) {
      dbEvents.emit("contacts");
    } else if (event.key === DB_KEYS.NEWSLETTER) {
      dbEvents.emit("newsletter");
    } else if (event.key === DB_KEYS.APPLICATIONS) {
      dbEvents.emit("applications");
    } else if (event.key === DB_KEYS.ACTIVITY_LOGS) {
      dbEvents.emit("activityLogs");
    }
  });
}
