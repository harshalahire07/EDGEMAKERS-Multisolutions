# Authentication System Documentation

## Overview

The EDGEMAKERS website now has a complete user authentication system with:

- **User Registration (Sign Up)** - New users can create accounts
- **User Login** - Existing users authenticate with email/password
- **Duplicate Prevention** - Email addresses are unique
- **Password Protection** - Minimum 6 characters required
- **Admin Detection** - Admin users automatically redirect to admin panel
- **User Database** - All users stored in localStorage (can be migrated to real database)

## Key Features

### 1. Sign Up Flow

- Users click "Login" button in header
- Toggle to "Create Account" mode
- Enter: Email, Name, Password (min. 6 characters)
- System checks for duplicate email
- Account created and user automatically logged in
- If admin email used, redirects to admin panel

### 2. Login Flow

- Users click "Login" button in header
- Enter: Email and Password
- System validates credentials against database
- Shows error if email not found or password incorrect
- Successful login redirects admin to admin panel, regular users stay on page

### 3. Admin System

- Admin email: `admin@edgemakers.com` (set in `.env.local`)
- Any user who registers with admin email becomes admin
- Admins automatically redirect to `/admin` on login
- Admin panel has "Users" tab to view all registered users

### 4. Security Features

- Passwords required (minimum 6 characters)
- Email validation
- Duplicate email prevention
- Admin users cannot be deleted from Users Manager

## Technical Implementation

### Files Created/Modified

1. **`src/lib/user-database.ts`** - New File

   - User database management functions
   - CRUD operations for users
   - Email uniqueness validation
   - Password authentication
   - Note: Uses localStorage (migrate to real DB for production)

2. **`src/components/auth/sign-in-dialog.tsx`** - Modified

   - Added password field
   - Added sign-up/login toggle
   - Integrated with user database
   - Admin detection and redirect
   - Form validation with error messages

3. **`src/components/admin/users-manager.tsx`** - New File

   - View all registered users
   - User details (name, email, type, registration date)
   - Delete users (except admins)
   - Statistics (total, admins, regular users)

4. **`src/components/admin/content-management.tsx`** - Modified
   - Added "Users" tab
   - Integrated UsersManager component

## Database Schema

### User Object

```typescript
{
  id: string; // Unique identifier (timestamp)
  email: string; // User's email (unique)
  name: string; // User's full name
  password: string; // Plain text (HASH IN PRODUCTION!)
  createdAt: string; // ISO timestamp
  isAdmin: boolean; // Admin flag
}
```

### Storage Key

- `edgemakers_users_db` - Array of User objects in localStorage

## Functions Available

### Registration

```typescript
registerUser(email: string, name: string, password: string)
// Returns: { success: boolean, message: string, user?: User }
```

### Login

```typescript
loginUser(email: string, password: string)
// Returns: { success: boolean, message: string, user?: User }
```

### Check Email

```typescript
emailExists(email: string)
// Returns: boolean
```

### Get Users

```typescript
getAllUsers()
// Returns: User[]

getUserByEmail(email: string)
// Returns: User | null
```

### User Management

```typescript
updateUser(userId: string, updates: Partial<User>)
// Returns: boolean

deleteUser(userId: string)
// Returns: boolean
```

## User Experience

### For Regular Users:

1. Click "Login" in header
2. First time: Toggle to "Create Account"
   - Enter email, name, password
   - Click "Create Account"
   - Automatically logged in
3. Returning: Enter email and password
   - Click "Sign In"
   - Logged in successfully
4. Can now inquire about services

### For Admins:

1. Register with admin email (`admin@edgemakers.com`)
2. Login redirects to admin panel
3. Access Users tab to manage accounts
4. Cannot delete own admin account

## Security Considerations

### Current (Development)

- Passwords stored in **plain text** in localStorage
- localStorage accessible via browser DevTools
- No server-side validation
- No rate limiting

### Production Requirements

⚠️ **Before going live, you MUST:**

1. **Hash Passwords**
   - Use bcrypt, argon2, or similar
   - Never store plain text passwords
2. **Use Real Database**

   - Firebase Authentication
   - Supabase Auth
   - PostgreSQL + JWT
   - MongoDB + Passport.js

3. **Add Security Features**

   - HTTPS only
   - Rate limiting
   - CAPTCHA on sign-up
   - Email verification
   - Password reset flow
   - Session management
   - CSRF protection

4. **Update Admin Detection**
   - Use database role field
   - Don't rely on email match
   - Implement proper authorization

## Testing Instructions

1. **Test Sign Up**

   ```
   - Click "Login" button
   - Toggle to "Create Account"
   - Email: test@example.com
   - Name: Test User
   - Password: test123
   - Submit → Should see success message
   ```

2. **Test Duplicate Prevention**

   ```
   - Try signing up again with test@example.com
   - Should see error: "Email already registered"
   ```

3. **Test Login**

   ```
   - Click "Login" button
   - Email: test@example.com
   - Password: test123
   - Submit → Should login successfully
   ```

4. **Test Wrong Password**

   ```
   - Email: test@example.com
   - Password: wrongpass
   - Submit → Should see "Incorrect password"
   ```

5. **Test Admin Login**

   ```
   - Create account with admin@edgemakers.com
   - Should auto-redirect to /admin
   ```

6. **Test Users Manager**
   ```
   - Login as admin
   - Go to Website Content tab
   - Click Users sub-tab
   - Should see all registered users
   - Try deleting non-admin user
   ```

## Migration Path to Production Database

When ready to move to production:

1. Choose your database (recommended: Supabase or Firebase)
2. Create users table with schema
3. Update `user-database.ts` functions to use API calls
4. Add password hashing (bcrypt)
5. Implement JWT tokens
6. Add email verification
7. Set up password reset
8. Remove localStorage references

Example Supabase migration:

```typescript
// Instead of localStorage
const { data, error } = await supabase
  .from("users")
  .insert([{ email, name, password: hashedPassword }]);
```

## Environment Variables

Current `.env.local`:

```
NEXT_PUBLIC_ADMIN_EMAIL=admin@edgemakers.com
NEXT_PUBLIC_ADMIN_NAME=Admin
NEXT_PUBLIC_ADMIN_PASSWORD=admin123
```

## Support

For issues:

1. Check browser console for errors
2. Verify localStorage has `edgemakers_users_db` key
3. Test in incognito mode (fresh localStorage)
4. Clear localStorage and retry: `localStorage.clear()`
