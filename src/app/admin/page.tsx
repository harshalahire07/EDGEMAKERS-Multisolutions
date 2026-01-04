"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import AdminLoginDialog from "@/components/auth/admin-login-dialog";
import ContentManagement from "@/components/admin/content-management";
import ActivityLog from "@/components/admin/activity-log";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/database";
import {
  useContacts,
  useNewsletterSubscribers,
  useApplications,
} from "@/lib/database-hooks";
import {
  Contact,
  NewsletterSubscriber,
  JobApplication,
  BackupValidationResult,
} from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Download,
  Trash,
  LogOut,
  Lock,
  HardDrive,
  Search,
  ArrowUpDown,
  Filter,
  X,
  Loader2,
  Printer,
  FileDown,
  Upload,
  FileJson,
  RefreshCw,
  History,
  User,
  Key,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChangePasswordDialog } from "@/components/auth/change-password-dialog";
import { useToast } from "@/hooks/use-toast";

// Filter/Sort State Interfaces
interface ContactFilters {
  searchTerm: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  sortBy: "name" | "email" | "date" | "status";
  sortOrder: "asc" | "desc";
}

interface SubscriberFilters {
  searchTerm: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  sortBy: "email" | "date" | "status";
  sortOrder: "asc" | "desc";
}

interface ApplicationFilters {
  searchTerm: string;
  status: string;
  position: string;
  dateFrom: string;
  dateTo: string;
  sortBy: "name" | "email" | "position" | "date" | "status";
  sortOrder: "asc" | "desc";
}

// Helper Functions
function loadFiltersFromStorage<T>(key: string): T | null {
  try {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error(`Error loading filters from ${key}:`, error);
    return null;
  }
}

function saveFiltersToStorage(key: string, filters: any): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, JSON.stringify(filters));
  } catch (error) {
    console.error(`Error saving filters to ${key}:`, error);
  }
}

function filterAndSortContacts(
  contacts: Contact[],
  filters: ContactFilters
): Contact[] {
  let filtered = [...contacts];

  // Filter by search term
  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term)
    );
  }

  // Filter by status
  if (filters.status !== "all") {
    filtered = filtered.filter((c) => c.status === filters.status);
  }

  // Filter by date range
  if (filters.dateFrom) {
    const fromDate = new Date(filters.dateFrom);
    filtered = filtered.filter((c) => new Date(c.submittedAt) >= fromDate);
  }
  if (filters.dateTo) {
    const toDate = new Date(filters.dateTo);
    toDate.setDate(toDate.getDate() + 1); // Include entire day
    filtered = filtered.filter((c) => new Date(c.submittedAt) < toDate);
  }

  // Sort
  filtered.sort((a, b) => {
    let aVal: any, bVal: any;
    switch (filters.sortBy) {
      case "name":
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
        break;
      case "email":
        aVal = a.email.toLowerCase();
        bVal = b.email.toLowerCase();
        break;
      case "date":
        aVal = new Date(a.submittedAt).getTime();
        bVal = new Date(b.submittedAt).getTime();
        break;
      case "status":
        aVal = a.status;
        bVal = b.status;
        break;
    }

    if (aVal < bVal) return filters.sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return filters.sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  return filtered;
}

function filterAndSortSubscribers(
  subscribers: NewsletterSubscriber[],
  filters: SubscriberFilters
): NewsletterSubscriber[] {
  let filtered = [...subscribers];

  // Filter by search term (email or whatsapp)
  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    filtered = filtered.filter(
      (s) =>
        (s.email && s.email.toLowerCase().includes(term)) ||
        (s.whatsapp && s.whatsapp.toLowerCase().includes(term))
    );
  }

  // Filter by status
  if (filters.status !== "all") {
    filtered = filtered.filter((s) => s.status === filters.status);
  }

  // Filter by date range
  if (filters.dateFrom) {
    const fromDate = new Date(filters.dateFrom);
    filtered = filtered.filter((s) => new Date(s.subscribedAt) >= fromDate);
  }
  if (filters.dateTo) {
    const toDate = new Date(filters.dateTo);
    toDate.setDate(toDate.getDate() + 1);
    filtered = filtered.filter((s) => new Date(s.subscribedAt) < toDate);
  }

  // Sort
  filtered.sort((a, b) => {
    let aVal: any, bVal: any;
    switch (filters.sortBy) {
      case "email":
        aVal = (a.email || a.whatsapp || "").toLowerCase();
        bVal = (b.email || b.whatsapp || "").toLowerCase();
        break;
      case "date":
        aVal = new Date(a.subscribedAt).getTime();
        bVal = new Date(b.subscribedAt).getTime();
        break;
      case "status":
        aVal = a.status;
        bVal = b.status;
        break;
    }

    if (aVal < bVal) return filters.sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return filters.sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  return filtered;
}

function filterAndSortApplications(
  applications: JobApplication[],
  filters: ApplicationFilters
): JobApplication[] {
  let filtered = [...applications];

  // Filter by search term
  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    filtered = filtered.filter(
      (a) =>
        a.name.toLowerCase().includes(term) ||
        a.email.toLowerCase().includes(term) ||
        a.position.toLowerCase().includes(term)
    );
  }

  // Filter by status
  if (filters.status !== "all") {
    filtered = filtered.filter((a) => a.status === filters.status);
  }

  // Filter by position
  if (filters.position) {
    const posTerm = filters.position.toLowerCase();
    filtered = filtered.filter((a) =>
      a.position.toLowerCase().includes(posTerm)
    );
  }

  // Filter by date range
  if (filters.dateFrom) {
    const fromDate = new Date(filters.dateFrom);
    filtered = filtered.filter((a) => new Date(a.submittedAt) >= fromDate);
  }
  if (filters.dateTo) {
    const toDate = new Date(filters.dateTo);
    toDate.setDate(toDate.getDate() + 1);
    filtered = filtered.filter((a) => new Date(a.submittedAt) < toDate);
  }

  // Sort
  filtered.sort((a, b) => {
    let aVal: any, bVal: any;
    switch (filters.sortBy) {
      case "name":
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
        break;
      case "email":
        aVal = a.email.toLowerCase();
        bVal = b.email.toLowerCase();
        break;
      case "position":
        aVal = a.position.toLowerCase();
        bVal = b.position.toLowerCase();
        break;
      case "date":
        aVal = new Date(a.submittedAt).getTime();
        bVal = new Date(b.submittedAt).getTime();
        break;
      case "status":
        aVal = a.status;
        bVal = b.status;
        break;
    }

    if (aVal < bVal) return filters.sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return filters.sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  return filtered;
}

// Skeleton components for loading states
function ContactsTableSkeleton() {
  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <div className="inline-block min-w-full align-middle">
        <table className="min-w-full table-auto text-xs sm:text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="px-2 sm:px-4 py-2 font-medium">Name</th>
              <th className="px-2 sm:px-4 py-2 font-medium">Email</th>
              <th className="px-2 sm:px-4 py-2 font-medium hidden sm:table-cell">
                Phone
              </th>
              <th className="px-2 sm:px-4 py-2 font-medium hidden md:table-cell">
                Service
              </th>
              <th className="px-2 sm:px-4 py-2 font-medium hidden lg:table-cell">
                Submitted
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-t">
                <td className="px-2 sm:px-4 py-2">
                  <Skeleton className="h-4 w-32" />
                </td>
                <td className="px-2 sm:px-4 py-2">
                  <Skeleton className="h-4 w-40" />
                </td>
                <td className="px-2 sm:px-4 py-2 hidden sm:table-cell">
                  <Skeleton className="h-4 w-28" />
                </td>
                <td className="px-2 sm:px-4 py-2 hidden md:table-cell">
                  <Skeleton className="h-4 w-36" />
                </td>
                <td className="px-2 sm:px-4 py-2 hidden lg:table-cell">
                  <Skeleton className="h-4 w-24" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SubscribersListSkeleton() {
  return (
    <ul className="space-y-2 text-sm">
      {Array.from({ length: 5 }).map((_, i) => (
        <li key={i} className="flex items-center justify-between">
          <div>
            <Skeleton className="h-4 w-48 mb-1" />
            <Skeleton className="h-3 w-32" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function ApplicationsTableSkeleton() {
  return (
    <div className="overflow-auto">
      <table className="w-full table-auto text-sm">
        <thead>
          <tr className="text-left">
            <th className="pr-4">Name</th>
            <th className="pr-4">Email</th>
            <th className="pr-4">Phone</th>
            <th className="pr-4">Position</th>
            <th className="pr-4">Submitted At</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i} className="border-t">
              <td className="py-2 pr-4">
                <Skeleton className="h-4 w-32" />
              </td>
              <td className="py-2 pr-4">
                <Skeleton className="h-4 w-40" />
              </td>
              <td className="py-2 pr-4">
                <Skeleton className="h-4 w-28" />
              </td>
              <td className="py-2 pr-4">
                <Skeleton className="h-4 w-36" />
              </td>
              <td className="py-2 pr-4">
                <Skeleton className="h-4 w-24" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminPage() {
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const { contacts, loading: contactsLoading } = useContacts();
  const { subscribers, loading: subscribersLoading } =
    useNewsletterSubscribers();
  const { applications, loading: applicationsLoading } = useApplications();
  const [stats, setStats] = useState(db.getDataStats());

  // Filter states
  const [contactFilters, setContactFilters] = useState<ContactFilters>(() => {
    const saved = loadFiltersFromStorage<ContactFilters>("contactFilters");
    return (
      saved || {
        searchTerm: "",
        status: "all",
        dateFrom: "",
        dateTo: "",
        sortBy: "date",
        sortOrder: "desc",
      }
    );
  });

  const [subscriberFilters, setSubscriberFilters] = useState<SubscriberFilters>(
    () => {
      const saved =
        loadFiltersFromStorage<SubscriberFilters>("subscriberFilters");
      return (
        saved || {
          searchTerm: "",
          status: "all",
          dateFrom: "",
          dateTo: "",
          sortBy: "date",
          sortOrder: "desc",
        }
      );
    }
  );

  const [applicationFilters, setApplicationFilters] =
    useState<ApplicationFilters>(() => {
      const saved =
        loadFiltersFromStorage<ApplicationFilters>("applicationFilters");
      return (
        saved || {
          searchTerm: "",
          status: "all",
          position: "",
          dateFrom: "",
          dateTo: "",
          sortBy: "date",
          sortOrder: "desc",
        }
      );
    });

  // Backup/Restore state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedBackup, setParsedBackup] = useState<any>(null);
  const [validationResult, setValidationResult] =
    useState<BackupValidationResult | null>(null);
  const [restoreMode, setRestoreMode] = useState<"replace" | "merge">("merge");
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [isProcessingRestore, setIsProcessingRestore] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter panel visibility
  const [showContactFilters, setShowContactFilters] = useState(false);
  const [showSubscriberFilters, setShowSubscriberFilters] = useState(false);
  const [showApplicationFilters, setShowApplicationFilters] = useState(false);

  // Memoized filtered data
  const filteredContacts = useMemo(
    () => filterAndSortContacts(contacts, contactFilters),
    [contacts, contactFilters]
  );

  const filteredSubscribers = useMemo(
    () => filterAndSortSubscribers(subscribers, subscriberFilters),
    [subscribers, subscriberFilters]
  );

  const filteredApplications = useMemo(
    () => filterAndSortApplications(applications, applicationFilters),
    [applications, applicationFilters]
  );

  useEffect(() => {
    if (contactsLoading || subscribersLoading || applicationsLoading) return;
    setStats(db.getDataStats());
  }, [
    contacts,
    subscribers,
    applications,
    contactsLoading,
    subscribersLoading,
    applicationsLoading,
  ]);

  // Persist filter changes
  useEffect(() => {
    saveFiltersToStorage("contactFilters", contactFilters);
  }, [contactFilters]);

  useEffect(() => {
    saveFiltersToStorage("subscriberFilters", subscriberFilters);
  }, [subscriberFilters]);

  useEffect(() => {
    saveFiltersToStorage("applicationFilters", applicationFilters);
  }, [applicationFilters]);

  useEffect(() => {
    // Show login dialog if not authenticated or not admin
    if (!user || !user.isAdmin) {
      setShowAdminLogin(true);
    } else {
      setShowAdminLogin(false);
    }
  }, [user]);

  const handleSignOut = () => {
    signOut();
  };

  // Filter update handlers
  const updateContactFilters = (updates: Partial<ContactFilters>) => {
    setContactFilters((prev) => ({ ...prev, ...updates }));
  };

  const updateSubscriberFilters = (updates: Partial<SubscriberFilters>) => {
    setSubscriberFilters((prev) => ({ ...prev, ...updates }));
  };

  const updateApplicationFilters = (updates: Partial<ApplicationFilters>) => {
    setApplicationFilters((prev) => ({ ...prev, ...updates }));
  };

  const resetContactFilters = () => {
    setContactFilters({
      searchTerm: "",
      status: "all",
      dateFrom: "",
      dateTo: "",
      sortBy: "date",
      sortOrder: "desc",
    });
  };

  const resetSubscriberFilters = () => {
    setSubscriberFilters({
      searchTerm: "",
      status: "all",
      dateFrom: "",
      dateTo: "",
      sortBy: "date",
      sortOrder: "desc",
    });
  };

  const resetApplicationFilters = () => {
    setApplicationFilters({
      searchTerm: "",
      status: "all",
      position: "",
      dateFrom: "",
      dateTo: "",
      sortBy: "date",
      sortOrder: "desc",
    });
  };

  // Print handler functions
  const handlePrintContact = (contact: Contact) => {
    const originalTitle = document.title;
    let printDiv: HTMLDivElement | null = null;
    let cleanupDone = false;

    const cleanup = () => {
      if (cleanupDone) return;
      cleanupDone = true;

      // Restore title
      document.title = originalTitle;

      // Remove print div
      if (printDiv && document.body.contains(printDiv)) {
        document.body.removeChild(printDiv);
      }

      // Remove listener
      window.removeEventListener("afterprint", cleanup);
    };

    try {
      document.title = "Contact - " + contact.name;

      // Create temporary print div using safe DOM methods
      printDiv = document.createElement("div");
      printDiv.className = "print-record print-only";

      // Create header
      const header = document.createElement("div");
      header.className = "print-header";
      const h1 = document.createElement("h1");
      h1.textContent = "EDGEMAKERS Multisolutions";
      const h2 = document.createElement("h2");
      h2.textContent = "Contact Submission";
      header.appendChild(h1);
      header.appendChild(h2);
      printDiv.appendChild(header);

      // Helper to create a field
      const createField = (label: string, value: string) => {
        const field = document.createElement("div");
        field.className = "record-field";
        const labelSpan = document.createElement("span");
        labelSpan.className = "record-label";
        labelSpan.textContent = label + ":";
        const valueSpan = document.createElement("span");
        valueSpan.className = "record-value";
        valueSpan.textContent = value;
        field.appendChild(labelSpan);
        field.appendChild(valueSpan);
        return field;
      };

      // Add all fields
      printDiv.appendChild(createField("Submission ID", contact.id));
      printDiv.appendChild(
        createField(
          "Submitted Date",
          new Date(contact.submittedAt).toLocaleString()
        )
      );
      printDiv.appendChild(createField("Name", contact.name));
      printDiv.appendChild(createField("Email", contact.email));
      printDiv.appendChild(createField("Phone", contact.phone));
      printDiv.appendChild(createField("Service Interested", contact.service));
      printDiv.appendChild(createField("Message", contact.message));
      printDiv.appendChild(createField("Status", contact.status));

      // Footer
      const footer = document.createElement("div");
      footer.className = "record-field";
      footer.style.marginTop = "2rem";
      footer.style.paddingTop = "1rem";
      footer.style.borderTop = "1px solid #ddd";
      const p1 = document.createElement("p");
      p1.textContent = "Printed on " + new Date().toLocaleString();
      const p2 = document.createElement("p");
      p2.textContent = "Printed by: " + (user?.name || "Admin");
      footer.appendChild(p1);
      footer.appendChild(p2);
      printDiv.appendChild(footer);

      document.body.appendChild(printDiv);

      // Register afterprint listener
      window.addEventListener("afterprint", cleanup);

      // Trigger print
      window.print();
    } catch (error) {
      console.error("Print error:", error);
      cleanup(); // Ensure cleanup on error
    }
  };

  const handlePrintApplication = (application: JobApplication) => {
    const originalTitle = document.title;
    let printDiv: HTMLDivElement | null = null;
    let cleanupDone = false;

    const cleanup = () => {
      if (cleanupDone) return;
      cleanupDone = true;

      // Restore title
      document.title = originalTitle;

      // Remove print div
      if (printDiv && document.body.contains(printDiv)) {
        document.body.removeChild(printDiv);
      }

      // Remove listener
      window.removeEventListener("afterprint", cleanup);
    };

    try {
      document.title = "Job Application - " + application.name;

      // Create temporary print div using safe DOM methods
      printDiv = document.createElement("div");
      printDiv.className = "print-record print-only";

      // Create header
      const header = document.createElement("div");
      header.className = "print-header";
      const h1 = document.createElement("h1");
      h1.textContent = "EDGEMAKERS Multisolutions";
      const h2 = document.createElement("h2");
      h2.textContent = "Job Application";
      header.appendChild(h1);
      header.appendChild(h2);
      printDiv.appendChild(header);

      // Helper to create a field
      const createField = (label: string, value: string) => {
        const field = document.createElement("div");
        field.className = "record-field";
        const labelSpan = document.createElement("span");
        labelSpan.className = "record-label";
        labelSpan.textContent = label + ":";
        const valueSpan = document.createElement("span");
        valueSpan.className = "record-value";
        valueSpan.textContent = value;
        field.appendChild(labelSpan);
        field.appendChild(valueSpan);
        return field;
      };

      // Add all fields
      printDiv.appendChild(createField("Application ID", application.id));
      printDiv.appendChild(
        createField(
          "Submitted Date",
          new Date(application.submittedAt).toLocaleString()
        )
      );
      printDiv.appendChild(createField("Applicant Name", application.name));
      printDiv.appendChild(createField("Email", application.email));
      printDiv.appendChild(createField("Phone", application.phone));
      printDiv.appendChild(
        createField("Position Applied", application.position)
      );
      printDiv.appendChild(
        createField("Experience Level", application.experience)
      );
      printDiv.appendChild(createField("Cover Letter", application.message));
      printDiv.appendChild(createField("Status", application.status));

      // Footer
      const footer = document.createElement("div");
      footer.className = "record-field";
      footer.style.marginTop = "2rem";
      footer.style.paddingTop = "1rem";
      footer.style.borderTop = "1px solid #ddd";
      const p1 = document.createElement("p");
      p1.textContent = "Printed on " + new Date().toLocaleString();
      const p2 = document.createElement("p");
      p2.textContent = "Printed by: " + (user?.name || "Admin");
      footer.appendChild(p1);
      footer.appendChild(p2);
      printDiv.appendChild(footer);

      document.body.appendChild(printDiv);

      // Register afterprint listener
      window.addEventListener("afterprint", cleanup);

      // Trigger print
      window.print();
    } catch (error) {
      console.error("Print error:", error);
      cleanup(); // Ensure cleanup on error
    }
  };

  const handleExportContactAsPDF = (contact: Contact) => {
    handlePrintContact(contact);
    // Show helpful toast
    setTimeout(() => {
      // Note: toast hook needs to be available in component
      console.log(
        'Print dialog opened. Select "Save as PDF" as the printer to export.'
      );
    }, 100);
  };

  const handleExportApplicationAsPDF = (application: JobApplication) => {
    handlePrintApplication(application);
    // Show helpful toast
    setTimeout(() => {
      console.log(
        'Print dialog opened. Select "Save as PDF" as the printer to export.'
      );
    }, 100);
  };

  // Backup/Restore handler functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith(".json")) {
      toast({
        title: "Invalid File Type",
        description: "Please select a JSON backup file (.json)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: `File size (${(file.size / 1024 / 1024).toFixed(
          2
        )}MB) exceeds maximum of 10MB`,
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);

    // Read and parse the file
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);
        setParsedBackup(data);

        // Validate the backup
        const validation = db.validateBackupFile(data);
        setValidationResult(validation);

        if (validation.isValid) {
          toast({
            title: "Backup File Validated",
            description: "The backup file is valid and ready to restore.",
          });
        } else {
          toast({
            title: "Validation Issues Found",
            description: `${validation.errors.length} error(s), ${validation.warnings.length} warning(s)`,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error parsing backup file:", error);
        toast({
          title: "Invalid Backup File",
          description:
            "Failed to parse JSON file. Please ensure it's a valid backup.",
          variant: "destructive",
        });
        setParsedBackup(null);
        setValidationResult(null);
      }
    };
    reader.readAsText(file);
  };

  const handleRestoreClick = () => {
    if (!parsedBackup || !validationResult?.isValid) {
      toast({
        title: "Cannot Restore",
        description: "Please select a valid backup file first.",
        variant: "destructive",
      });
      return;
    }
    setShowRestoreDialog(true);
  };

  const handleRestoreConfirm = () => {
    if (!parsedBackup) return;

    setIsProcessingRestore(true);
    try {
      if (restoreMode === "replace") {
        db.importAll(parsedBackup);
      } else {
        db.importAllMerge(parsedBackup);
      }

      toast({
        title: "Restore Complete",
        description: `Successfully restored data using ${restoreMode} strategy.`,
      });

      // Reset state
      setShowRestoreDialog(false);
      setSelectedFile(null);
      setParsedBackup(null);
      setValidationResult(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Restore error:", error);
      toast({
        title: "Restore Failed",
        description:
          error instanceof Error ? error.message : "Failed to restore backup",
        variant: "destructive",
      });
    } finally {
      setIsProcessingRestore(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedFile(null);
    setParsedBackup(null);
    setValidationResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Count active filters
  const activeContactFilters = [
    contactFilters.searchTerm,
    contactFilters.status !== "all",
    contactFilters.dateFrom,
    contactFilters.dateTo,
  ].filter(Boolean).length;

  const activeSubscriberFilters = [
    subscriberFilters.searchTerm,
    subscriberFilters.status !== "all",
    subscriberFilters.dateFrom,
    subscriberFilters.dateTo,
  ].filter(Boolean).length;

  const activeApplicationFilters = [
    applicationFilters.searchTerm,
    applicationFilters.status !== "all",
    applicationFilters.position,
    applicationFilters.dateFrom,
    applicationFilters.dateTo,
  ].filter(Boolean).length;

  // Show admin login dialog if not authenticated or not admin
  if (!user || !user.isAdmin) {
    return (
      <AdminLoginDialog
        open={showAdminLogin}
        onOpenChange={setShowAdminLogin}
      />
    );
  }

  // Admin is authenticated, show dashboard
  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-12 max-w-7xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="font-headline text-2xl sm:text-3xl font-bold">
            Admin Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Signed in as <strong>{user.name}</strong> ({user.email})
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => {
              db.downloadBackup();
              toast({
                title: "Backup Downloaded",
                description: "All data has been exported successfully.",
              });
            }}
            className="w-full sm:w-auto text-xs sm:text-sm"
            size="sm"
            disabled={
              contactsLoading || subscribersLoading || applicationsLoading
            }
          >
            <Download className="mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Export All
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (confirm("Clear all local data? This cannot be undone.")) {
                db.clearAll();
              }
            }}
            className="w-full sm:w-auto text-xs sm:text-sm"
            size="sm"
            disabled={
              contactsLoading || subscribersLoading || applicationsLoading
            }
          >
            <Trash className="mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Clear All
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-full sm:w-auto text-xs sm:text-sm" size="sm">
                <User className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Account</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setChangePasswordOpen(true)}>
                <Key className="mr-2 h-4 w-4" />
                Change Password
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ChangePasswordDialog
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
      />

      <div className="grid gap-4 sm:gap-5 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalContacts}</div>
            <div className="text-sm text-muted-foreground">
              Total contact form submissions
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                onClick={() => {
                  db.downloadContactsAsCSV();
                }}
                disabled={contactsLoading}
              >
                <Download className="mr-2 h-4 w-4" /> Download CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Newsletter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalSubscribers}</div>
            <div className="text-sm text-muted-foreground mb-4">
              Total subscribers
            </div>
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => {
                  db.downloadNewsletterEmailsAsCSV();
                  toast({
                    title: "Emails Downloaded",
                    description: "Newsletter emails exported successfully.",
                  });
                }}
                disabled={subscribersLoading}
                size="sm"
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" /> Emails CSV
              </Button>
              <Button
                onClick={() => {
                  db.downloadNewsletterWhatsAppAsCSV();
                  toast({
                    title: "WhatsApp Numbers Downloaded",
                    description:
                      "Newsletter WhatsApp numbers exported successfully.",
                  });
                }}
                disabled={subscribersLoading}
                size="sm"
                variant="outline"
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" /> WhatsApp CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalApplications}</div>
            <div className="text-sm text-muted-foreground">
              Total job applications
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Storage Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-3xl font-bold ${
                stats.storageNearCapacity ? "text-orange-500" : ""
              }`}
            >
              {stats.storageUsagePercentage?.toFixed(1) || 0}%
            </div>
            <div className="text-sm text-muted-foreground">
              of browser storage capacity
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              ({((stats.storageUsageBytes || 0) / 1024).toFixed(0)} KB used)
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Export data regularly to free up space
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Backup & Restore Section */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Backup & Restore
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* File Upload Section */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="backup-file" className="text-sm font-medium">
                  Select Backup File
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Choose a JSON backup file to restore
                </p>
              </div>
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  id="backup-file"
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Choose File
                </Button>
                {selectedFile && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClearSelection}
                    title="Clear selection"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {selectedFile && (
                <div className="flex items-center gap-2 text-sm">
                  <FileJson className="h-4 w-4 text-blue-500" />
                  <span className="truncate">{selectedFile.name}</span>
                  <span className="text-muted-foreground text-xs">
                    ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              )}
            </div>

            {/* Validation Results Section */}
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Validation Status</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Backup file validation results
                </p>
              </div>
              {validationResult ? (
                <div
                  className={`p-3 rounded-md border ${
                    validationResult.isValid
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <Badge
                      variant={
                        validationResult.isValid ? "default" : "destructive"
                      }
                      className="text-xs"
                    >
                      {validationResult.isValid ? "Valid" : "Invalid"}
                    </Badge>
                    <div className="flex-1 text-xs space-y-1">
                      {validationResult.errors.length > 0 && (
                        <div className="text-red-600">
                          <strong>Errors:</strong>
                          <ul className="list-disc list-inside mt-1">
                            {validationResult.errors.map((err, i) => (
                              <li key={i}>{err}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {validationResult.warnings.length > 0 && (
                        <div className="text-yellow-600">
                          <strong>Warnings:</strong>
                          <ul className="list-disc list-inside mt-1">
                            {validationResult.warnings.map((warn, i) => (
                              <li key={i}>{warn}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {validationResult.isValid &&
                        validationResult.metadata && (
                          <div className="text-green-700 mt-2">
                            <strong>Records found:</strong>
                            <div className="grid grid-cols-2 gap-1 mt-1">
                              <span>
                                Services:{" "}
                                {
                                  validationResult.metadata.recordCounts
                                    .services
                                }
                              </span>
                              <span>
                                Team:{" "}
                                {validationResult.metadata.recordCounts.team}
                              </span>
                              <span>
                                Testimonials:{" "}
                                {
                                  validationResult.metadata.recordCounts
                                    .testimonials
                                }
                              </span>
                              <span>
                                Jobs:{" "}
                                {validationResult.metadata.recordCounts.jobs}
                              </span>
                              <span>
                                Contacts:{" "}
                                {
                                  validationResult.metadata.recordCounts
                                    .contacts
                                }
                              </span>
                              <span>
                                Applications:{" "}
                                {
                                  validationResult.metadata.recordCounts
                                    .applications
                                }
                              </span>
                              <span>
                                Newsletter:{" "}
                                {
                                  validationResult.metadata.recordCounts
                                    .newsletter
                                }
                              </span>
                              <span>
                                Users:{" "}
                                {validationResult.metadata.recordCounts.users}
                              </span>
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-md border bg-muted text-muted-foreground text-xs">
                  No file selected. Upload a backup file to see validation
                  results.
                </div>
              )}
            </div>
          </div>

          {/* Restore Mode and Action */}
          {validationResult?.isValid && (
            <div className="space-y-3 pt-2 border-t">
              <div>
                <Label className="text-sm font-medium">Restore Mode</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Choose how to handle existing data
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant={restoreMode === "merge" ? "default" : "outline"}
                  onClick={() => setRestoreMode("merge")}
                  className="flex-1"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Merge (Recommended)
                </Button>
                <Button
                  variant={
                    restoreMode === "replace" ? "destructive" : "outline"
                  }
                  onClick={() => setRestoreMode("replace")}
                  className="flex-1"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Replace (Destructive)
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                {restoreMode === "merge" ? (
                  <>
                    <strong>Merge mode:</strong> Combines backup data with
                    existing data. Duplicates are updated, new records are
                    added, existing records not in backup are kept.
                  </>
                ) : (
                  <>
                    <strong className="text-destructive">Replace mode:</strong>{" "}
                    Deletes all existing data and replaces it with backup data.
                    This cannot be undone!
                  </>
                )}
              </div>
              <Button
                onClick={handleRestoreClick}
                disabled={!validationResult?.isValid || isProcessingRestore}
                className="w-full"
                variant={restoreMode === "replace" ? "destructive" : "default"}
              >
                {isProcessingRestore ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Restoring...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Restore Backup
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="submissions" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="submissions">Submissions & Data</TabsTrigger>
          <TabsTrigger value="content">Website Content</TabsTrigger>
          <TabsTrigger value="activity-log">
            <History className="mr-2 h-4 w-4" />
            Activity Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="submissions" className="space-y-6">
          <div className="grid gap-4 sm:gap-5 md:gap-6 grid-cols-1 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                    Contact Submissions
                    {activeContactFilters > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {activeContactFilters} filter
                        {activeContactFilters !== 1 && "s"}
                      </Badge>
                    )}
                  </CardTitle>
                  <Button
                    variant={showContactFilters ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowContactFilters(!showContactFilters)}
                    aria-expanded={showContactFilters}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </CardHeader>

              {showContactFilters && (
                <div className="px-6 pb-4 border-b">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-medium mb-1 block">
                        Search
                      </label>
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Name or email..."
                          value={contactFilters.searchTerm}
                          onChange={(e) =>
                            updateContactFilters({ searchTerm: e.target.value })
                          }
                          className="pl-8"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium mb-1 block">
                        Status
                      </label>
                      <Select
                        value={contactFilters.status}
                        onValueChange={(value) =>
                          updateContactFilters({ status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-xs font-medium mb-1 block">
                        Sort By
                      </label>
                      <div className="flex gap-2">
                        <Select
                          value={contactFilters.sortBy}
                          onValueChange={(value: any) =>
                            updateContactFilters({ sortBy: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="date">Date</SelectItem>
                            <SelectItem value="name">Name</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="status">Status</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            updateContactFilters({
                              sortOrder:
                                contactFilters.sortOrder === "asc"
                                  ? "desc"
                                  : "asc",
                            })
                          }
                          title={
                            contactFilters.sortOrder === "asc"
                              ? "Ascending"
                              : "Descending"
                          }
                        >
                          <ArrowUpDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium mb-1 block">
                        From Date
                      </label>
                      <Input
                        type="date"
                        value={contactFilters.dateFrom}
                        onChange={(e) =>
                          updateContactFilters({ dateFrom: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium mb-1 block">
                        To Date
                      </label>
                      <Input
                        type="date"
                        value={contactFilters.dateTo}
                        onChange={(e) =>
                          updateContactFilters({ dateTo: e.target.value })
                        }
                      />
                    </div>

                    <div className="flex items-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetContactFilters}
                        className="w-full"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reset
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <CardContent>
                {contactsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                    <span className="text-muted-foreground">
                      Loading contacts...
                    </span>
                  </div>
                ) : contacts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No contacts yet.
                  </p>
                ) : filteredContacts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No contacts match your filters. Try adjusting your search
                    criteria.
                  </p>
                ) : (
                  <>
                    {activeContactFilters > 0 && (
                      <p className="text-xs text-muted-foreground mb-3">
                        Showing {filteredContacts.length} of {contacts.length}{" "}
                        contacts
                      </p>
                    )}
                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                      <div className="inline-block min-w-full align-middle">
                        <table className="contact-table min-w-full table-auto text-xs sm:text-sm">
                          <thead>
                            <tr className="text-left border-b">
                              <th className="px-2 sm:px-4 py-2 font-medium">
                                Name
                              </th>
                              <th className="px-2 sm:px-4 py-2 font-medium">
                                Email
                              </th>
                              <th className="px-2 sm:px-4 py-2 font-medium hidden sm:table-cell">
                                Phone
                              </th>
                              <th className="px-2 sm:px-4 py-2 font-medium hidden md:table-cell">
                                Service
                              </th>
                              <th className="px-2 sm:px-4 py-2 font-medium hidden lg:table-cell">
                                Submitted
                              </th>
                              <th className="px-2 sm:px-4 py-2 font-medium text-right">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredContacts.map((c) => (
                              <tr
                                key={c.id}
                                className="border-b hover:bg-accent"
                              >
                                <td className="px-2 sm:px-4 py-2">{c.name}</td>
                                <td className="px-2 sm:px-4 py-2 break-all">
                                  {c.email}
                                </td>
                                <td className="px-2 sm:px-4 py-2 hidden sm:table-cell">
                                  {c.phone}
                                </td>
                                <td className="px-2 sm:px-4 py-2 hidden md:table-cell">
                                  {c.service}
                                </td>
                                <td className="px-2 sm:px-4 py-2 hidden lg:table-cell text-muted-foreground">
                                  {new Date(c.submittedAt).toLocaleDateString()}
                                </td>
                                <td className="px-2 sm:px-4 py-2 text-right">
                                  <div className="flex gap-1 justify-end">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handlePrintContact(c)}
                                      title="Print contact details"
                                      className="h-8 w-8 p-0"
                                    >
                                      <Printer className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleExportContactAsPDF(c)
                                      }
                                      title="Export as PDF - Opens print dialog, choose 'Save as PDF'"
                                      className="h-8 w-8 p-0"
                                    >
                                      <FileDown className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Newsletter and Applications cards will follow */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                    Newsletter
                    {activeSubscriberFilters > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {activeSubscriberFilters}
                      </Badge>
                    )}
                  </CardTitle>
                  <Button
                    variant={showSubscriberFilters ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      setShowSubscriberFilters(!showSubscriberFilters)
                    }
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              {showSubscriberFilters && (
                <div className="px-6 pb-4 border-b">
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium mb-1 block">
                        Search Email/WhatsApp
                      </label>
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Email..."
                          value={subscriberFilters.searchTerm}
                          onChange={(e) =>
                            updateSubscriberFilters({
                              searchTerm: e.target.value,
                            })
                          }
                          className="pl-8"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium mb-1 block">
                        Status
                      </label>
                      <Select
                        value={subscriberFilters.status}
                        onValueChange={(value) =>
                          updateSubscriberFilters({ status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="unsubscribed">
                            Unsubscribed
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-xs font-medium mb-1 block">
                        Sort
                      </label>
                      <div className="flex gap-2">
                        <Select
                          value={subscriberFilters.sortBy}
                          onValueChange={(value: any) =>
                            updateSubscriberFilters({ sortBy: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="date">Date</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="status">Status</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            updateSubscriberFilters({
                              sortOrder:
                                subscriberFilters.sortOrder === "asc"
                                  ? "desc"
                                  : "asc",
                            })
                          }
                        >
                          <ArrowUpDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-medium mb-1 block">
                          From
                        </label>
                        <Input
                          type="date"
                          value={subscriberFilters.dateFrom}
                          onChange={(e) =>
                            updateSubscriberFilters({
                              dateFrom: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-1 block">
                          To
                        </label>
                        <Input
                          type="date"
                          value={subscriberFilters.dateTo}
                          onChange={(e) =>
                            updateSubscriberFilters({ dateTo: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetSubscriberFilters}
                      className="w-full"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </div>
              )}

              <CardContent>
                {subscribersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                    <span className="text-muted-foreground">
                      Loading subscribers...
                    </span>
                  </div>
                ) : subscribers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No subscribers yet.
                  </p>
                ) : filteredSubscribers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No subscribers match your filters.
                  </p>
                ) : (
                  <>
                    {activeSubscriberFilters > 0 && (
                      <p className="text-xs text-muted-foreground mb-3">
                        Showing {filteredSubscribers.length} of{" "}
                        {subscribers.length} subscribers
                      </p>
                    )}
                    <ul className="space-y-2 text-sm">
                      {filteredSubscribers.map((s) => (
                        <li
                          key={s.id}
                          className="flex items-center justify-between"
                        >
                          <div>
                            {s.email && (
                              <div className="font-semibold">{s.email}</div>
                            )}
                            {s.whatsapp && (
                              <div
                                className={
                                  s.email
                                    ? "text-xs text-muted-foreground"
                                    : "font-semibold"
                                }
                              >
                                WhatsApp: {s.whatsapp}
                              </div>
                            )}
                            {!s.email && !s.whatsapp && (
                              <div className="font-semibold text-muted-foreground">
                                No contact info
                              </div>
                            )}
                            <div className="text-xs text-muted-foreground">
                              {new Date(s.subscribedAt).toLocaleString()}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    Job Applications
                    {activeApplicationFilters > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {activeApplicationFilters}
                      </Badge>
                    )}
                  </CardTitle>
                  <Button
                    variant={showApplicationFilters ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      setShowApplicationFilters(!showApplicationFilters)
                    }
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </CardHeader>

              {showApplicationFilters && (
                <div className="px-6 pb-4 border-b">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-medium mb-1 block">
                        Search
                      </label>
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Name, email, or position..."
                          value={applicationFilters.searchTerm}
                          onChange={(e) =>
                            updateApplicationFilters({
                              searchTerm: e.target.value,
                            })
                          }
                          className="pl-8"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium mb-1 block">
                        Position
                      </label>
                      <Input
                        placeholder="Filter by position..."
                        value={applicationFilters.position}
                        onChange={(e) =>
                          updateApplicationFilters({ position: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium mb-1 block">
                        Status
                      </label>
                      <Select
                        value={applicationFilters.status}
                        onValueChange={(value) =>
                          updateApplicationFilters({ status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="reviewing">Reviewing</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="hired">Hired</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-xs font-medium mb-1 block">
                        Sort By
                      </label>
                      <div className="flex gap-2">
                        <Select
                          value={applicationFilters.sortBy}
                          onValueChange={(value: any) =>
                            updateApplicationFilters({ sortBy: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="date">Date</SelectItem>
                            <SelectItem value="name">Name</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="position">Position</SelectItem>
                            <SelectItem value="status">Status</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            updateApplicationFilters({
                              sortOrder:
                                applicationFilters.sortOrder === "asc"
                                  ? "desc"
                                  : "asc",
                            })
                          }
                        >
                          <ArrowUpDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium mb-1 block">
                        From Date
                      </label>
                      <Input
                        type="date"
                        value={applicationFilters.dateFrom}
                        onChange={(e) =>
                          updateApplicationFilters({ dateFrom: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium mb-1 block">
                        To Date
                      </label>
                      <Input
                        type="date"
                        value={applicationFilters.dateTo}
                        onChange={(e) =>
                          updateApplicationFilters({ dateTo: e.target.value })
                        }
                      />
                    </div>

                    <div className="sm:col-span-2 lg:col-span-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetApplicationFilters}
                        className="w-full"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reset Filters
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <CardContent>
                {applicationsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                    <span className="text-muted-foreground">
                      Loading applications...
                    </span>
                  </div>
                ) : applications.length === 0 ? (
                  <p className="text-muted-foreground">No applications yet.</p>
                ) : filteredApplications.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No applications match your filters.
                  </p>
                ) : (
                  <>
                    {activeApplicationFilters > 0 && (
                      <p className="text-xs text-muted-foreground mb-3">
                        Showing {filteredApplications.length} of{" "}
                        {applications.length} applications
                      </p>
                    )}
                    <div className="overflow-auto">
                      <table className="w-full table-auto text-sm">
                        <thead>
                          <tr className="text-left">
                            <th className="pr-4">Name</th>
                            <th className="pr-4">Email</th>
                            <th className="pr-4">Phone</th>
                            <th className="pr-4">Position</th>
                            <th className="pr-4">Submitted At</th>
                            <th className="pr-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredApplications.map((a) => (
                            <tr key={a.id} className="border-t">
                              <td className="py-2 pr-4">{a.name}</td>
                              <td className="py-2 pr-4">{a.email}</td>
                              <td className="py-2 pr-4">{a.phone}</td>
                              <td className="py-2 pr-4">{a.position}</td>
                              <td className="py-2 pr-4">
                                {new Date(a.submittedAt).toLocaleString()}
                              </td>
                              <td className="py-2 pr-4 text-right">
                                <div className="flex gap-1 justify-end">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handlePrintApplication(a)}
                                    title="Print application details"
                                    className="h-8 w-8 p-0"
                                  >
                                    <Printer className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleExportApplicationAsPDF(a)
                                    }
                                    title="Export as PDF - Opens print dialog, choose 'Save as PDF'"
                                    className="h-8 w-8 p-0"
                                  >
                                    <FileDown className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content">
          <ContentManagement />
        </TabsContent>

        <TabsContent value="activity-log">
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              View and filter all admin actions performed on the website. Logs
              are automatically cleaned up after 30 days.
            </p>
          </div>
          <ActivityLog />
        </TabsContent>
      </Tabs>

      {/* Restore Confirmation Dialog */}
      <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Backup Restore</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  You are about to restore data from the selected backup file
                  using{" "}
                  <strong
                    className={
                      restoreMode === "replace" ? "text-destructive" : ""
                    }
                  >
                    {restoreMode}
                  </strong>{" "}
                  mode.
                </p>

                {validationResult?.metadata && (
                  <div className="bg-muted p-3 rounded-md text-sm">
                    <p className="font-semibold mb-2">Backup Details:</p>
                    <div className="space-y-1 text-xs">
                      <p>
                        <strong>File:</strong> {selectedFile?.name}
                      </p>
                      {validationResult.metadata.version && (
                        <p>
                          <strong>Format Version:</strong>{" "}
                          {validationResult.metadata.version}
                        </p>
                      )}
                      {validationResult.metadata.appVersion && (
                        <p>
                          <strong>App Version:</strong>{" "}
                          {validationResult.metadata.appVersion}
                        </p>
                      )}
                      <p className="mt-2">
                        <strong>Records to restore:</strong>
                      </p>
                      <div className="grid grid-cols-2 gap-1 ml-2">
                        <span>
                          • Services:{" "}
                          {validationResult.metadata.recordCounts.services}
                        </span>
                        <span>
                          • Team: {validationResult.metadata.recordCounts.team}
                        </span>
                        <span>
                          • Testimonials:{" "}
                          {validationResult.metadata.recordCounts.testimonials}
                        </span>
                        <span>
                          • Jobs: {validationResult.metadata.recordCounts.jobs}
                        </span>
                        <span>
                          • Contacts:{" "}
                          {validationResult.metadata.recordCounts.contacts}
                        </span>
                        <span>
                          • Applications:{" "}
                          {validationResult.metadata.recordCounts.applications}
                        </span>
                        <span>
                          • Newsletter:{" "}
                          {validationResult.metadata.recordCounts.newsletter}
                        </span>
                        <span>
                          • Users:{" "}
                          {validationResult.metadata.recordCounts.users}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div
                  className={`p-3 rounded-md text-sm ${
                    restoreMode === "replace"
                      ? "bg-destructive/10 border border-destructive/20"
                      : "bg-blue-50 border border-blue-200"
                  }`}
                >
                  {restoreMode === "merge" ? (
                    <>
                      <p className="font-semibold mb-1">Merge Strategy:</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>
                          Content (services, team, testimonials, jobs) merged by
                          ID
                        </li>
                        <li>
                          Users merged by ID (existing passwords preserved)
                        </li>
                        <li>
                          Newsletter subscribers merged by email
                          (case-insensitive)
                        </li>
                        <li>Contacts and applications appended (no merge)</li>
                        <li>Existing records not in backup are kept</li>
                      </ul>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold mb-1 text-destructive">
                        ⚠️ Warning:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>All existing data will be permanently deleted</li>
                        <li>Only data from the backup will remain</li>
                        <li>This action cannot be undone</li>
                      </ul>
                    </>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  💡 <strong>Tip:</strong> Consider exporting your current data
                  before restoring, so you have a backup if needed.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessingRestore}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRestoreConfirm}
              disabled={isProcessingRestore}
              className={
                restoreMode === "replace"
                  ? "bg-destructive hover:bg-destructive/90"
                  : ""
              }
            >
              {isProcessingRestore ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Restoring...
                </>
              ) : (
                `Confirm ${restoreMode === "replace" ? "Replace" : "Merge"}`
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
