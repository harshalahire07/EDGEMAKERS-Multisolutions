# Security Documentation

## Overview

EDGEMAKERS Multisolutions implements comprehensive security measures to protect user data and prevent common web vulnerabilities while maintaining a local-first architecture using localStorage.

## Security Features

### 1. Password Hashing

**Implementation**: `src/lib/security.ts`

- All passwords are hashed using bcrypt with 10 salt rounds
- Passwords are never stored in plain text
- Password verification uses constant-time comparison to prevent timing attacks

```typescript
import { hashPassword, verifyPassword } from "@/lib/security";

// Hashing a password
const hash = await hashPassword("userPassword");

// Verifying a password
const isValid = await verifyPassword("userPassword", hash);
```

### 2. Password Strength Validation

**Requirements**:

- Minimum 8 characters
- At least one lowercase letter
- At least one uppercase letter
- At least one number
- At least one special character

```typescript
import { isStrongPassword } from "@/lib/security";

const result = isStrongPassword("Password123!");
if (!result.valid) {
  console.log(result.message); // Specific error message
}
```

### 3. Input Sanitization

**Purpose**: Prevent XSS (Cross-Site Scripting) attacks

All user inputs are sanitized using DOMPurify before:

- Storing in database
- Displaying in UI
- Processing in forms

```typescript
import { sanitizeInput, sanitizeObject } from "@/lib/security";

// Sanitize single string
const clean = sanitizeInput('<script>alert("xss")</script>Hello');

// Sanitize entire object recursively
const cleanData = sanitizeObject({
  name: "<script>alert('xss')</script>John",
  email: "john@example.com",
});
```

### 4. Rate Limiting

**Implementation**: Client-side rate limiter to prevent abuse

- 5 requests per minute per email for contact forms
- 5 requests per minute per email for newsletter subscriptions
- Automatic cleanup of expired entries

```typescript
import { RateLimiter } from "@/lib/security";

const rateLimiter = new RateLimiter();

// Check if within limit
if (!rateLimiter.checkLimit("user@example.com", 5, 60000)) {
  // Rate limit exceeded
}

// Reset limit for a specific user
rateLimiter.reset("user@example.com");
```

### 5. Secure Authentication

**Features**:

- Passwords removed from localStorage (only non-sensitive user data stored)
- Async authentication with proper error handling
- Session management without exposing sensitive data

**Updated Files**:

- `src/contexts/auth-context.tsx` - Strips password before localStorage storage
- `src/components/auth/sign-in-dialog.tsx` - Async authentication flow
- `src/lib/user-database.ts` - All auth functions use bcrypt

### 6. Email Validation

**Implementation**: Regex-based email format validation

```typescript
import { isValidEmail } from "@/lib/security";

if (isValidEmail("user@example.com")) {
  // Valid email
}
```

## Protected Endpoints

While this is a localStorage-based application, the following components implement security measures:

1. **Contact Form** (`src/components/landing/contact-form.tsx`)

   - Input sanitization
   - Email validation
   - Rate limiting (5 per minute)
   - Duplicate submission prevention

2. **Newsletter** (`src/components/landing/newsletter.tsx`)

   - Input sanitization
   - Email validation
   - Rate limiting

3. **Admin Services Manager** (`src/components/admin/services-manager.tsx`)
   - Input sanitization for all form fields

## Security Best Practices

### For Developers

1. **Never Log Sensitive Data**

   ```typescript
   // ❌ Bad
   console.log("User password:", password);

   // ✅ Good
   console.log("Authentication attempted for user:", email);
   ```

2. **Always Sanitize User Input**

   ```typescript
   // ❌ Bad
   db.addContact({ ...data });

   // ✅ Good
   const sanitized = sanitizeObject(data);
   db.addContact({ ...sanitized });
   ```

3. **Use Async Auth Functions**

   ```typescript
   // ❌ Bad
   const result = loginUser(email, password); // Synchronous

   // ✅ Good
   const result = await loginUser(email, password); // Async with bcrypt
   ```

4. **Validate Before Processing**

   ```typescript
   if (!isValidEmail(email)) {
     return { error: "Invalid email" };
   }

   if (!isStrongPassword(password).valid) {
     return { error: "Weak password" };
   }
   ```

### For Production Deployment

When deploying to production, consider these additional measures:

1. **HTTPS Only**

   - Enforce HTTPS in production
   - Set `Strict-Transport-Security` header

2. **Environment Variables**

   - Store admin credentials in `.env.local`
   - Never commit `.env.local` to version control

3. **Content Security Policy**

   - Add CSP headers to prevent XSS
   - Restrict script sources

4. **Backend Migration** (Future Enhancement)
   - Consider migrating to Supabase or similar backend
   - Implement JWT tokens instead of localStorage
   - Add server-side rate limiting
   - Enable proper session management

## Vulnerability Reporting

If you discover a security vulnerability, please email: security@edgemakers.com

Do not create public GitHub issues for security vulnerabilities.

## Compliance

This implementation follows:

- OWASP Top 10 guidelines
- Basic password security standards (NIST SP 800-63B)
- Input validation best practices

## Security Checklist

- [x] Password hashing (bcrypt)
- [x] Strong password requirements
- [x] Input sanitization (DOMPurify)
- [x] Rate limiting
- [x] Email validation
- [x] Secure password storage (no plain text)
- [x] Password removed from localStorage
- [x] XSS prevention
- [ ] CSRF protection (not applicable for localStorage app)
- [ ] Backend authentication (planned for Phase 2)
- [ ] JWT tokens (planned for Phase 2)

## Updated Default Admin

The default admin password has been changed from `admin123` to `Admin@123` to meet strong password requirements.

**Access**:

- Email: `admin@edgemakers.com`
- Password: `Admin@123`

Change this immediately in production by setting environment variables:

```env
NEXT_PUBLIC_ADMIN_EMAIL=your-admin@example.com
NEXT_PUBLIC_ADMIN_PASSWORD=YourStrongPassword123!
NEXT_PUBLIC_ADMIN_NAME=Your Admin Name
```

## Testing Security

Run security tests:

```bash
npm test src/lib/__tests__/security.test.ts
```

Tests cover:

- Password hashing and verification
- Input sanitization
- Rate limiting
- Email validation
- Password strength validation
