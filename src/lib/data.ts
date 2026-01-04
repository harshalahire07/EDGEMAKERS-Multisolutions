import type { ImagePlaceholder } from "./placeholder-images";
import { PlaceHolderImages } from "./placeholder-images";

const getImage = (id: string): ImagePlaceholder => {
  const image = PlaceHolderImages.find((img) => img.id === id);
  if (!image) {
    // Fallback image
    return {
      id: "fallback",
      description: "Placeholder image",
      imageUrl: "https://picsum.photos/seed/fallback/600/400",
      imageHint: "placeholder",
    };
  }
  return image;
};

export const serviceCategories = [
  "All Services",
  "Facility Management",
  "Technical Services",
  "Hospitality Services",
  "Support Services",
] as const;

export type ServiceCategory = (typeof serviceCategories)[number];

export interface Service {
  id: string;
  title: string;
  description: string;
  image: ImagePlaceholder;
  icon: string;
  category: ServiceCategory;
  googleFormUrl: string;
  active?: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: ImagePlaceholder;
  order?: number;
  active?: boolean;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  company: string;
  active?: boolean;
}

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  experience?: string;
  salary?: string;
  active?: boolean;
}

// User and Submission Data Types
export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  createdAt: string;
  isAdmin: boolean;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  submittedAt: string;
  status: string;
}

export interface NewsletterSubscriber {
  id: string;
  email?: string;
  whatsapp?: string;
  subscribedAt: string;
  status: string;
}

export interface JobApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  experience: string;
  message: string;
  submittedAt: string;
  status: string;
}

export interface DataStats {
  totalContacts: number;
  totalSubscribers: number;
  totalApplications: number;
  newContacts: number;
  activeSubscribers: number;
  pendingApplications: number;
  storageUsageBytes?: number;
  storageUsagePercentage?: number;
  storageNearCapacity?: boolean;
}

export interface ExportData {
  version: string;
  appVersion: string;
  backupId: string;
  description?: string;
  services: Service[];
  team: TeamMember[];
  testimonials: Testimonial[];
  jobs: Job[];
  users: User[];
  contacts: Contact[];
  newsletter: NewsletterSubscriber[];
  applications: JobApplication[];
  activityLogs: ActivityLog[];
  exportedAt: string;
}

export interface BackupValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  metadata?: {
    version: string;
    appVersion: string;
    exportedAt: string;
    recordCounts: {
      services: number;
      team: number;
      testimonials: number;
      jobs: number;
      users: number;
      contacts: number;
      newsletter: number;
      applications: number;
    };
  };
}

// Activity Log Types
export type ActivityAction =
  | "create"
  | "update"
  | "delete"
  | "activate"
  | "deactivate"
  | "restore"
  | "export"
  | "import";

export type EntityType =
  | "service"
  | "team"
  | "testimonial"
  | "job"
  | "user"
  | "contact"
  | "newsletter"
  | "application"
  | "backup";

export interface ActivityLog {
  id: string;
  action: ActivityAction;
  entityType: EntityType;
  entityId: string;
  entityName: string;
  user: string;
  timestamp: string;
  details?: string;
  metadata?: Record<string, any>;
}

export const services: Service[] = [
  {
    id: "service-1",
    title: "House Keeping",
    description:
      "Professional and reliable house keeping services to maintain a clean and healthy environment.",
    image: getImage("service-house-keeping"),
    icon: "Home",
    category: "Facility Management",
    googleFormUrl:
      "https://docs.google.com/forms/d/e/YOUR_FORM_ID_HERE/viewform", // TODO: Replace with actual Google Form URL for House Keeping bookings
    active: true,
  },
  {
    id: "service-2",
    title: "Cash Run",
    description:
      "Secure and timely cash-in-transit services for your business needs.",
    image: getImage("service-cash-run"),
    icon: "Landmark",
    category: "Support Services",
    googleFormUrl:
      "https://docs.google.com/forms/d/e/YOUR_FORM_ID_HERE/viewform", // TODO: Replace with actual Google Form URL for Cash Run bookings
    active: true,
  },
  {
    id: "service-3",
    title: "Epoxy Flooring",
    description:
      "Durable and aesthetic epoxy flooring solutions for commercial and industrial spaces.",
    image: getImage("service-epoxy-flooring"),
    icon: "Layers",
    category: "Facility Management",
    googleFormUrl:
      "https://docs.google.com/forms/d/e/YOUR_FORM_ID_HERE/viewform", // TODO: Replace with actual Google Form URL for Epoxy Flooring bookings
    active: true,
  },
  {
    id: "service-4",
    title: "Canteen",
    description:
      "Hygienic and delicious food services for your employees and guests.",
    image: getImage("service-canteen"),
    icon: "Utensils",
    category: "Hospitality Services",
    googleFormUrl:
      "https://docs.google.com/forms/d/e/YOUR_FORM_ID_HERE/viewform", // TODO: Replace with actual Google Form URL for Canteen bookings
    active: true,
  },
  {
    id: "service-5",
    title: "Landscaping",
    description:
      "Creative and sustainable landscaping and gardening services to beautify your premises.",
    image: getImage("service-landscaping"),
    icon: "Sprout",
    category: "Facility Management",
    googleFormUrl:
      "https://docs.google.com/forms/d/e/YOUR_FORM_ID_HERE/viewform", // TODO: Replace with actual Google Form URL for Landscaping bookings
    active: true,
  },
  {
    id: "service-6",
    title: "Technical Support",
    description:
      "24/7 technical support to ensure smooth and uninterrupted operations.",
    image: getImage("service-tech-support"),
    icon: "Wrench",
    category: "Technical Services",
    googleFormUrl:
      "https://docs.google.com/forms/d/e/YOUR_FORM_ID_HERE/viewform", // TODO: Replace with actual Google Form URL for Technical Support bookings
    active: true,
  },
  {
    id: "service-7",
    title: "Pest Control",
    description:
      "Effective and environmentally friendly pest control solutions for a safe workplace.",
    image: getImage("service-pest-control"),
    icon: "Bug",
    category: "Facility Management",
    googleFormUrl:
      "https://docs.google.com/forms/d/e/YOUR_FORM_ID_HERE/viewform", // TODO: Replace with actual Google Form URL for Pest Control bookings
    active: true,
  },
  {
    id: "service-8",
    title: "Valet Parking",
    description:
      "Premium valet parking services for a convenient and upscale experience.",
    image: getImage("service-valet-parking"),
    icon: "Car",
    category: "Hospitality Services",
    googleFormUrl:
      "https://docs.google.com/forms/d/e/YOUR_FORM_ID_HERE/viewform", // TODO: Replace with actual Google Form URL for Valet Parking bookings
    active: true,
  },
  {
    id: "service-9",
    title: "Parking Attendant",
    description:
      "Efficient and courteous parking attendants to manage your parking facilities.",
    image: getImage("service-parking-attendant"),
    icon: "ParkingCircle",
    category: "Support Services",
    googleFormUrl:
      "https://docs.google.com/forms/d/e/YOUR_FORM_ID_HERE/viewform", // TODO: Replace with actual Google Form URL for Parking Attendant bookings
    active: true,
  },
  {
    id: "service-10",
    title: "BMS Operator",
    description:
      "Skilled BMS operators to manage and monitor your building management systems.",
    image: getImage("service-bms-operator"),
    icon: "Building",
    category: "Technical Services",
    googleFormUrl:
      "https://docs.google.com/forms/d/e/YOUR_FORM_ID_HERE/viewform", // TODO: Replace with actual Google Form URL for BMS Operator bookings
    active: true,
  },
];

export const teamMembers: TeamMember[] = [
  {
    id: "team-1",
    name: "Dr. Nirmala Mahesh Thorwe",
    role: "General Manager",
    bio: "Leading EDGEMAKERS with exceptional management expertise, Dr. Thorwe oversees all operational excellence and strategic initiatives across the organization.",
    image: getImage("team-jane-doe"),
    order: 1,
    active: true,
  },
  {
    id: "team-2",
    name: "Mr. Dyaneshwar Kajle",
    role: "Assistant General Manager",
    bio: "As AGM, Mr. Kajle coordinates all departmental operations and serves as the primary point of contact for client relations and service excellence.",
    image: getImage("team-john-smith"),
    order: 2,
    active: true,
  },
  {
    id: "team-3",
    name: "Mr. Rajebhau Gulave",
    role: "Operations Manager",
    bio: "Mr. Gulave manages day-to-day operations with precision, ensuring seamless service delivery and maintaining the highest standards across all projects.",
    image: getImage("team-emily-white"),
    order: 3,
    active: true,
  },
  {
    id: "team-4",
    name: "Mr. Amol Kalbande",
    role: "Admin Manager",
    bio: "Mr. Kalbande oversees administrative functions and ensures smooth coordination between departments for efficient business operations.",
    image: getImage("team-jane-doe"),
    order: 4,
    active: true,
  },
];

export const testimonials: Testimonial[] = [
  {
    id: "testimonial-1",
    quote:
      "EDGEMAKERS's expertise was a game-changer for our company. Their strategies helped us increase our efficiency by 30% in just one year.",
    author: "Alex Johnson",
    company: "CEO, Innovate Corp",
    active: true,
  },
  {
    id: "testimonial-2",
    quote:
      "The team at EDGEMAKERS is not only knowledgeable but also genuinely passionate about making a difference. Working with them was inspiring.",
    author: "Samantha Blue",
    company: "Director, Future Solutions",
    active: true,
  },
  {
    id: "testimonial-3",
    quote:
      "Thanks to EDGEMAKERS, we have a clear roadmap for our technology goals. Their AI estimator was surprisingly accurate for initial planning.",
    author: "Michael Green",
    company: "Founder, EcoGoods",
    active: true,
  },
  {
    id: "testimonial-4",
    quote:
      "A truly professional and impactful partnership. EDGEMAKERS delivered beyond our expectations on every front.",
    author: "Priya Patel",
    company: "COO, Synergy Ltd.",
    active: true,
  },
];
