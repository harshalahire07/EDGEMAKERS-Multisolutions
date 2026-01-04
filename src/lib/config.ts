// Centralized configuration for the application
// All environment variables and constants should be defined here

export const config = {
  // Application
  app: {
    name: "EDGEMAKERS Multisolutions",
    description: "Innovating Business Solutions for Tomorrow",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },

  // Admin
  admin: {
    email: process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@edgemakers.com",
    password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "Admin@123",
    name: process.env.NEXT_PUBLIC_ADMIN_NAME || "Admin",
  },

  // Security
  security: {
    passwordMinLength: 8,
    bcryptSaltRounds: 10,
    rateLimitWindow: 60 * 1000, // 1 minute in milliseconds
    rateLimitMaxRequests: 5,
  },

  // Database
  database: {
    localStorageKey: "edgemakers_db",
    userStorageKey: "edgemakers_user",
  },

  // Features
  features: {
    enableRegistration: true,
    enableNewsletter: true,
    enableContactForm: true,
  },
} as const;

export type Config = typeof config;
