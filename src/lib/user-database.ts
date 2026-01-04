/**
 * User database management using centralized database
 * Handles user registration, login, password management, and admin operations
 * Uses bcrypt for secure password hashing
 */
import { db } from "./database";
import type { User } from "./data";
import { hashPassword, verifyPassword, isStrongPassword } from "./security";

export type { User };

// Initialize default admin user if no users exist
export async function initializeDefaultAdmin(): Promise<void> {
  const users = db.getUsers();

  // Check if admin user already exists
  const adminEmail =
    process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@edgemakers.com";
  const adminExists = users.some(
    (u) => u.email.toLowerCase() === adminEmail.toLowerCase()
  );

  if (!adminExists) {
    // Create default admin user
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "Admin@123";
    const adminName = process.env.NEXT_PUBLIC_ADMIN_NAME || "Admin";

    const hashedPassword = await hashPassword(adminPassword);

    const defaultAdmin: User = {
      id: "admin-" + Date.now(),
      email: adminEmail,
      name: adminName,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      isAdmin: true,
    };

    users.push(defaultAdmin);
    db.setUsers(users);
    console.log("Default admin user created:", adminEmail);
  }
}

// Get all users from database
export function getAllUsers(): User[] {
  // Ensure admin is initialized on first access
  initializeDefaultAdmin();
  return db.getUsers();
}

// Save users to database
function saveUsers(users: User[]): void {
  db.setUsers(users);
}

// Check if email already exists
export function emailExists(email: string): boolean {
  const users = getAllUsers();
  return users.some((user) => user.email.toLowerCase() === email.toLowerCase());
}

// Register a new user
export async function registerUser(
  email: string,
  name: string,
  password: string
): Promise<{ success: boolean; message: string; user?: User }> {
  // Validate inputs
  if (!email || !name || !password) {
    return { success: false, message: "All fields are required" };
  }

  // Validate password strength
  const passwordValidation = isStrongPassword(password);
  if (!passwordValidation.valid) {
    return {
      success: false,
      message: passwordValidation.message || "Password is not strong enough",
    };
  }

  // Check for duplicate email
  if (emailExists(email)) {
    return {
      success: false,
      message: "Email already registered. Please login instead.",
    };
  }

  // Check if this is admin email
  const adminEmail =
    process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@edgemakers.com";
  const isAdmin = email.toLowerCase() === adminEmail.toLowerCase();

  // Hash password before storing
  const hashedPassword = await hashPassword(password);

  // Create new user
  const newUser: User = {
    id: Date.now().toString(),
    email: email.trim(),
    name: name.trim(),
    password: hashedPassword,
    createdAt: new Date().toISOString(),
    isAdmin: isAdmin,
  };

  // Add to database
  const users = getAllUsers();
  users.push(newUser);
  saveUsers(users);

  return { success: true, message: "Registration successful!", user: newUser };
}

// Login user with email and password
export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; message: string; user?: User }> {
  if (!email || !password) {
    return { success: false, message: "Email and password are required" };
  }

  const users = getAllUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return {
      success: false,
      message: "No account found with this email. Please sign up.",
    };
  }

  // Verify password using bcrypt
  const isValidPassword = await verifyPassword(password, user.password);
  if (!isValidPassword) {
    return { success: false, message: "Incorrect password" };
  }

  return { success: true, message: "Login successful!", user };
}

// Verify user credentials and return user if valid (for admin login)
export async function verifyUser(
  email: string,
  password: string
): Promise<User | null> {
  if (!email || !password) return null;

  const users = getAllUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) return null;

  // Verify password using bcrypt
  const isValidPassword = await verifyPassword(password, user.password);
  if (!isValidPassword) return null;

  return user;
}

// Get user by email
export function getUserByEmail(email: string): User | null {
  const users = getAllUsers();
  return (
    users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null
  );
}

// Update user
export function updateUser(userId: string, updates: Partial<User>): boolean {
  const users = getAllUsers();
  const index = users.findIndex((u) => u.id === userId);

  if (index === -1) return false;

  users[index] = { ...users[index], ...updates };
  saveUsers(users);
  return true;
}

// Delete user
export function deleteUser(userId: string): boolean {
  const users = getAllUsers();
  const filtered = users.filter((u) => u.id !== userId);

  if (filtered.length === users.length) return false;

  saveUsers(filtered);
  return true;
}

// Toggle admin status for a user
export function toggleAdminStatus(userId: string): boolean {
  const users = getAllUsers();
  const user = users.find((u) => u.id === userId);

  if (!user) return false;

  user.isAdmin = !user.isAdmin;
  saveUsers(users);
  return true;
}

// Change password for current user
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate new password strength
    const passwordValidation = isStrongPassword(newPassword);
    if (!passwordValidation.valid) {
      return {
        success: false,
        error: passwordValidation.message || "Password is not strong enough",
      };
    }

    const users = getAllUsers();
    const user = users.find((u) => u.id === userId);

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Verify current password using bcrypt
    const isValidPassword = await verifyPassword(
      currentPassword,
      user.password
    );
    if (!isValidPassword) {
      return { success: false, error: "Current password is incorrect" };
    }

    // Hash and update password
    user.password = await hashPassword(newPassword);
    saveUsers(users);

    return { success: true };
  } catch (error) {
    console.error("Error changing password:", error);
    return {
      success: false,
      error: "An error occurred while changing password",
    };
  }
}

// Reset password for any user (admin only)
export async function resetPassword(
  userId: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate new password strength
    const passwordValidation = isStrongPassword(newPassword);
    if (!passwordValidation.valid) {
      return {
        success: false,
        error: passwordValidation.message || "Password is not strong enough",
      };
    }

    const users = getAllUsers();
    const user = users.find((u) => u.id === userId);

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Hash and update password
    user.password = await hashPassword(newPassword);
    saveUsers(users);

    return { success: true };
  } catch (error) {
    console.error("Error resetting password:", error);
    return {
      success: false,
      error: "An error occurred while resetting password",
    };
  }
}
