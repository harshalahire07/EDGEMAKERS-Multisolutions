# Testing Documentation

## Overview

EDGEMAKERS Multisolutions uses Vitest and React Testing Library for unit and integration testing.

## Setup

### Installation

Testing dependencies are already installed:

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event @vitejs/plugin-react
```

### Configuration

**vitest.config.ts**:

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/lib/__tests__/setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test src/lib/__tests__/security.test.ts
```

## Test Structure

### Directory Layout

```
src/
  lib/
    __tests__/
      setup.ts              # Test setup and mocks
      security.test.ts      # Security utilities tests
      database.test.ts      # Database operations tests
  components/
    __tests__/
      contact-form.test.tsx # Component integration tests
```

### Test Setup

**src/lib/**tests**/setup.ts**:

- Mocks localStorage
- Imports testing-library matchers
- Resets state before each test

## Writing Tests

### Unit Tests Example

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { hashPassword, verifyPassword } from "../security";

describe("Password Hashing", () => {
  it("should hash passwords", async () => {
    const password = "TestPassword123!";
    const hash = await hashPassword(password);

    expect(hash).toBeDefined();
    expect(hash).not.toBe(password);
  });

  it("should verify correct password", async () => {
    const password = "TestPassword123!";
    const hash = await hashPassword(password);
    const isValid = await verifyPassword(password, hash);

    expect(isValid).toBe(true);
  });
});
```

### Component Tests Example

```typescript
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ContactForm from "../contact-form";

describe("ContactForm", () => {
  it("should submit form with valid data", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByLabelText(/name/i), "John Doe");
    await user.type(screen.getByLabelText(/email/i), "john@example.com");
    await user.type(screen.getByLabelText(/phone/i), "1234567890");

    const submitButton = screen.getByRole("button", { name: /submit/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/message sent/i)).toBeInTheDocument();
    });
  });
});
```

## Test Coverage

### Current Test Files

1. **security.test.ts** - Security utilities
   - Password hashing
   - Password verification
   - Input sanitization
   - Object sanitization
   - Rate limiting
   - Email validation
   - Password strength validation

### Planned Test Files

2. **database.test.ts** - Database operations

   - CRUD operations
   - Real-time sync
   - Event emitter
   - Duplicate detection

3. **contact-form.test.tsx** - Contact form
   - Form validation
   - Submission flow
   - Rate limiting
   - Error handling

## Testing Best Practices

### 1. Test Behavior, Not Implementation

```typescript
// ❌ Bad - Testing implementation details
expect(component.state.isLoading).toBe(true);

// ✅ Good - Testing user-visible behavior
expect(screen.getByText(/loading/i)).toBeInTheDocument();
```

### 2. Use Meaningful Test Names

```typescript
// ❌ Bad
it("test1", () => { ... });

// ✅ Good
it("should display error message when email is invalid", () => { ... });
```

### 3. Arrange-Act-Assert Pattern

```typescript
it("should validate strong password", () => {
  // Arrange
  const password = "StrongPass123!";

  // Act
  const result = isStrongPassword(password);

  // Assert
  expect(result.valid).toBe(true);
});
```

### 4. Clean Up After Tests

```typescript
import { beforeEach, afterEach } from "vitest";

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  // Clean up any remaining state
});
```

### 5. Mock External Dependencies

```typescript
import { vi } from "vitest";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
  };
})();

global.localStorage = localStorageMock as any;
```

## Common Testing Patterns

### Testing Async Functions

```typescript
it("should handle async authentication", async () => {
  const result = await loginUser("test@example.com", "password");
  expect(result.success).toBe(true);
});
```

### Testing Error Cases

```typescript
it("should reject weak passwords", () => {
  const result = isStrongPassword("weak");
  expect(result.valid).toBe(false);
  expect(result.message).toContain("at least 8 characters");
});
```

### Testing Rate Limiting

```typescript
it("should block requests exceeding limit", () => {
  const rateLimiter = new RateLimiter();
  const email = "test@example.com";

  rateLimiter.checkLimit(email, 2, 60000);
  rateLimiter.checkLimit(email, 2, 60000);

  expect(rateLimiter.checkLimit(email, 2, 60000)).toBe(false);
});
```

### Testing Forms

```typescript
it("should validate email format", async () => {
  const user = userEvent.setup();
  render(<ContactForm />);

  const emailInput = screen.getByLabelText(/email/i);
  await user.type(emailInput, "invalid-email");
  await user.tab(); // Trigger validation

  expect(screen.getByText(/valid email/i)).toBeInTheDocument();
});
```

## Continuous Integration

Add to your CI/CD pipeline:

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm ci
      - run: npm test
```

## Coverage Goals

Target coverage levels:

- **Unit Tests**: >80% coverage
- **Integration Tests**: Critical user flows
- **Security Tests**: 100% coverage for security utilities

Check coverage:

```bash
npm test -- --coverage
```

## Debugging Tests

### Visual Studio Code

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Vitest Tests",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["test", "--", "--run"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

### Console Logging

```typescript
import { screen, debug } from "@testing-library/react";

// Print DOM tree
debug();

// Print specific element
debug(screen.getByRole("button"));
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Next Steps

1. Write integration tests for database operations
2. Add component tests for all forms
3. Set up E2E testing with Playwright
4. Configure coverage thresholds
5. Add visual regression testing
