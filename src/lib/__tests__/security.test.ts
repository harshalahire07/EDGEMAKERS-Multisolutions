import { describe, it, expect, beforeEach } from "vitest";
import {
  hashPassword,
  verifyPassword,
  sanitizeInput,
  sanitizeObject,
  RateLimiter,
  isValidEmail,
  isStrongPassword,
} from "../security";

describe("Security Utilities", () => {
  describe("Password Hashing", () => {
    it("should hash passwords", async () => {
      const password = "TestPassword123!";
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it("should verify correct password", async () => {
      const password = "TestPassword123!";
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it("should reject incorrect password", async () => {
      const password = "TestPassword123!";
      const wrongPassword = "WrongPassword123!";
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(wrongPassword, hash);

      expect(isValid).toBe(false);
    });
  });

  describe("Input Sanitization", () => {
    it("should remove HTML tags from input", () => {
      const malicious = '<script>alert("XSS")</script>Hello';
      const sanitized = sanitizeInput(malicious);

      expect(sanitized).not.toContain("<script>");
      expect(sanitized).not.toContain("</script>");
    });

    it("should handle empty strings", () => {
      expect(sanitizeInput("")).toBe("");
    });

    it("should sanitize object properties recursively", () => {
      const obj = {
        name: '<script>alert("XSS")</script>John',
        email: "test@example.com",
        nested: {
          value: "<b>Bold</b>",
        },
      };

      const sanitized = sanitizeObject(obj);

      expect(sanitized.name).not.toContain("<script>");
      expect(sanitized.email).toBe("test@example.com");
      expect(sanitized.nested.value).not.toContain("<b>");
    });
  });

  describe("Rate Limiting", () => {
    let rateLimiter: RateLimiter;

    beforeEach(() => {
      rateLimiter = new RateLimiter();
    });

    it("should allow requests within limit", () => {
      const identifier = "test@example.com";
      const maxRequests = 3;
      const windowMs = 60000;

      expect(rateLimiter.checkLimit(identifier, maxRequests, windowMs)).toBe(
        true
      );
      expect(rateLimiter.checkLimit(identifier, maxRequests, windowMs)).toBe(
        true
      );
      expect(rateLimiter.checkLimit(identifier, maxRequests, windowMs)).toBe(
        true
      );
    });

    it("should block requests exceeding limit", () => {
      const identifier = "test@example.com";
      const maxRequests = 2;
      const windowMs = 60000;

      rateLimiter.checkLimit(identifier, maxRequests, windowMs);
      rateLimiter.checkLimit(identifier, maxRequests, windowMs);

      expect(rateLimiter.checkLimit(identifier, maxRequests, windowMs)).toBe(
        false
      );
    });

    it("should reset limit for specific identifier", () => {
      const identifier = "test@example.com";
      const maxRequests = 2;
      const windowMs = 60000;

      rateLimiter.checkLimit(identifier, maxRequests, windowMs);
      rateLimiter.checkLimit(identifier, maxRequests, windowMs);
      rateLimiter.reset(identifier);

      expect(rateLimiter.checkLimit(identifier, maxRequests, windowMs)).toBe(
        true
      );
    });
  });

  describe("Email Validation", () => {
    it("should validate correct email formats", () => {
      expect(isValidEmail("test@example.com")).toBe(true);
      expect(isValidEmail("user.name+tag@example.co.uk")).toBe(true);
    });

    it("should reject invalid email formats", () => {
      expect(isValidEmail("invalid")).toBe(false);
      expect(isValidEmail("@example.com")).toBe(false);
      expect(isValidEmail("test@")).toBe(false);
      expect(isValidEmail("test @example.com")).toBe(false);
    });
  });

  describe("Password Strength Validation", () => {
    it("should accept strong passwords", () => {
      const result = isStrongPassword("StrongPass123!");
      expect(result.valid).toBe(true);
      expect(result.message).toBeUndefined();
    });

    it("should reject short passwords", () => {
      const result = isStrongPassword("Short1!");
      expect(result.valid).toBe(false);
      expect(result.message).toContain("at least 8 characters");
    });

    it("should require lowercase letters", () => {
      const result = isStrongPassword("PASSWORD123!");
      expect(result.valid).toBe(false);
      expect(result.message).toContain("lowercase");
    });

    it("should require uppercase letters", () => {
      const result = isStrongPassword("password123!");
      expect(result.valid).toBe(false);
      expect(result.message).toContain("uppercase");
    });

    it("should require numbers", () => {
      const result = isStrongPassword("Password!");
      expect(result.valid).toBe(false);
      expect(result.message).toContain("number");
    });

    it("should require special characters", () => {
      const result = isStrongPassword("Password123");
      expect(result.valid).toBe(false);
      expect(result.message).toContain("special character");
    });
  });
});
