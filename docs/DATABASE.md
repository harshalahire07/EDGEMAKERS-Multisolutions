# 🗄️ Centralized Database System Documentation

## Overview

The EDGEMAKERS website now uses a **centralized local database** system with **real-time synchronization** between admin panel and website. Any changes made in the admin panel are **immediately reflected** on the website without requiring a page refresh.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Centralized Database                      │
│                  (localStorage wrapper)                       │
│  ┌───────────┬───────────┬──────────────┬─────────────────┐ │
│  │ Services  │   Team    │ Testimonials │  Jobs & Users   │ │
│  └───────────┴───────────┴──────────────┴─────────────────┘ │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │  Event Emitter       │
        │  (Real-time Updates) │
        └──────────┬──────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
┌───▼────┐    ┌───▼────┐    ┌───▼────┐
│Website │    │ Admin  │    │ React  │
│Pages   │    │ Panel  │    │ Hooks  │
└────────┘    └────────┘    └────────┘
```

## Key Features

### ✅ Real-Time Synchronization

- Admin changes services → Website services update instantly
- Admin adds team member → Team section updates immediately
- Admin updates testimonials → Carousel reflects changes
- Admin creates job → Careers page shows new job

### ✅ Unified Data Storage

All data stored in one place:

- `edgemakers_db_services` - All services
- `edgemakers_db_team` - Team members
- `edgemakers_db_testimonials` - Client testimonials
- `edgemakers_db_jobs` - Job openings
- `edgemakers_db_users` - User accounts
- `edgemakers_db_contacts` - Contact form submissions
- `edgemakers_db_newsletter` - Newsletter subscribers
- `edgemakers_db_applications` - Job applications

### ✅ Smart Filtering

- Only **active** items shown on website
- Admin can toggle active/inactive status
- Team members sorted by display order
- Jobs filtered by active status

## File Structure

```
src/
├── lib/
│   ├── database.ts          # Core database system
│   ├── database-hooks.ts     # React hooks for data access
│   ├── user-database.ts      # User authentication
│   └── data.ts              # Type definitions
├── components/
│   ├── database-initializer.tsx  # Initialize DB on load
│   ├── landing/
│   │   ├── services.tsx     # Uses useServices() hook
│   │   ├── team.tsx         # Uses useTeam() hook
│   │   ├── testimonials.tsx # Uses useTestimonials() hook
│   │   ├── contact-form.tsx # Saves to DB
│   │   └── newsletter.tsx   # Saves to DB
│   └── admin/
│       ├── services-manager.tsx    # CRUD for services
│       ├── team-manager.tsx        # CRUD for team
│       ├── testimonials-manager.tsx # CRUD for testimonials
│       ├── jobs-manager.tsx        # CRUD for jobs
│       └── users-manager.tsx       # View/delete users
```

## How It Works

### 1. Database Initialization

When the app loads, `DatabaseInitializer` checks if database is empty. If empty, it loads default data from `data.ts`.

```typescript
// In layout.tsx
<DatabaseInitializer />;

// Loads default data on first visit
db.initialize({
  services: defaultServices,
  team: defaultTeamMembers,
  testimonials: defaultTestimonials,
  jobs: [],
});
```

### 2. Real-Time Updates with Event System

**Event Emitter Pattern:**

```typescript
// When admin updates data
db.setServices(updatedServices);
// ↓ Automatically emits event
dbEvents.emit("services");
// ↓ All subscribed components re-render
```

### 3. React Hooks for Data Access

Components use custom hooks to access data and subscribe to changes:

```typescript
// In Services component
const services = useServices(); // Auto-updates when admin changes data

// In Team component
const team = useTeam(); // Auto-updates when admin changes data

// In Testimonials component
const testimonials = useTestimonials(); // Auto-updates when admin changes data
```

### 4. Admin Panel CRUD Operations

Admin can manage all content:

```typescript
// Add service
db.addService(newService);
// → Emits 'services' event
// → Website services update immediately

// Update team member
db.updateTeamMember(id, { name: "New Name" });
// → Emits 'team' event
// → Website team section updates immediately

// Delete testimonial
db.deleteTestimonial(id);
// → Emits 'testimonials' event
// → Carousel updates immediately
```

## Database API

### Core Database Methods

#### Services

```typescript
db.getServices(); // Get all services
db.setServices(services); // Set all services
db.addService(service); // Add new service
db.updateService(id, updates); // Update service
db.deleteService(id); // Delete service
```

#### Team

```typescript
db.getTeam(); // Get all team members
db.setTeam(team); // Set all team members
db.addTeamMember(member); // Add new member
db.updateTeamMember(id, updates); // Update member
db.deleteTeamMember(id); // Delete member
```

#### Testimonials

```typescript
db.getTestimonials(); // Get all testimonials
db.setTestimonials(testimonials); // Set all testimonials
db.addTestimonial(testimonial); // Add new testimonial
db.updateTestimonial(id, updates); // Update testimonial
db.deleteTestimonial(id); // Delete testimonial
```

#### Jobs

```typescript
db.getJobs(); // Get all jobs
db.setJobs(jobs); // Set all jobs
db.addJob(job); // Add new job
db.updateJob(id, updates); // Update job
db.deleteJob(id); // Delete job
```

#### Submissions

```typescript
db.getContacts(); // Get contact submissions
db.addContact(contact); // Add contact submission
db.getNewsletterSubscribers(); // Get newsletter subscribers
db.addNewsletterSubscriber(subscriber); // Add newsletter subscriber
db.getApplications(); // Get job applications
db.addApplication(application); // Add job application
```

#### Utility

```typescript
db.initialize(defaultData); // Initialize with default data
db.clearAll(); // Clear all data
db.exportAll(); // Export all data as JSON
db.importAll(data); // Import data from JSON
```

### React Hooks

```typescript
const services = useServices(); // Subscribe to services
const team = useTeam(); // Subscribe to team
const testimonials = useTestimonials(); // Subscribe to testimonials
const jobs = useJobs(); // Subscribe to jobs
const users = useUsers(); // Subscribe to users
const contacts = useContacts(); // Subscribe to contacts
const subscribers = useNewsletterSubscribers(); // Subscribe to newsletter
const applications = useApplications(); // Subscribe to applications
```

## Data Flow Example

### Admin Updates Service

```
1. Admin opens Services Manager
2. Admin clicks "Edit" on "Housekeeping"
3. Admin changes description
4. Admin clicks "Save"
   ↓
5. ServicesManager calls: db.updateService(id, updates)
   ↓
6. Database updates localStorage
   ↓
7. Database emits: dbEvents.emit('services')
   ↓
8. Services component's useServices() hook detects event
   ↓
9. Services component re-renders with new data
   ↓
10. Website shows updated description (NO PAGE REFRESH!)
```

## Type Safety

All data types are strongly typed:

```typescript
interface Service {
  id: string;
  title: string;
  description: string;
  image: ImagePlaceholder;
  icon: string;
  category: ServiceCategory;
  googleFormUrl: string;
  active?: boolean;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: ImagePlaceholder;
  order?: number;
  active?: boolean;
}

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  company: string;
  active?: boolean;
}

interface Job {
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
```

## Admin Content Management

### Services Manager

- ✅ Add new services
- ✅ Edit existing services
- ✅ Delete services
- ✅ Toggle active/inactive
- ✅ Set category
- ✅ Add Google Form URLs
- ✅ Upload service images

### Team Manager

- ✅ Add new team members
- ✅ Edit member details
- ✅ Delete members
- ✅ Set display order
- ✅ Toggle active/inactive
- ✅ Upload member photos

### Testimonials Manager

- ✅ Add new testimonials
- ✅ Edit testimonials
- ✅ Delete testimonials
- ✅ Toggle active/inactive

### Jobs Manager

- ✅ Create job openings
- ✅ Edit job details
- ✅ Delete jobs
- ✅ Toggle active/inactive
- ✅ Set requirements
- ✅ Set location, type, department

### Users Manager

- ✅ View all registered users
- ✅ See admin vs regular users
- ✅ Delete users (except admins)
- ✅ View registration dates

## Testing the Real-Time System

1. **Open two browser windows**

   - Window 1: http://localhost:9002 (homepage)
   - Window 2: http://localhost:9002/admin (admin panel)

2. **Test Service Updates**

   - Admin: Edit a service description
   - Homepage: See description update immediately

3. **Test Team Updates**

   - Admin: Add a new team member
   - Homepage: Scroll to team section - new member appears

4. **Test Testimonials**

   - Admin: Edit a testimonial
   - Homepage: Carousel updates with new content

5. **Test Jobs**
   - Admin: Create a job opening
   - Careers: Navigate to /careers - new job appears

## Data Persistence

- **Current**: localStorage (client-side only)
- **Production Ready**: Migrate to server-side database

### Migration Path

```typescript
// Current (localStorage)
db.getServices() → localStorage

// Future (API)
db.getServices() → fetch('/api/services')

// Future (Supabase)
db.getServices() → supabase.from('services').select()

// Future (Firebase)
db.getServices() → collection('services').get()
```

## Performance

- **Instant Updates**: Event-driven, no polling
- **Memory Efficient**: Only subscribed components re-render
- **No Network Calls**: All data local (fast!)
- **Small Bundle**: Event system adds ~2KB

## Browser Support

Works in all modern browsers with localStorage:

- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

## Troubleshooting

### Changes not reflecting?

1. Check browser console for errors
2. Verify localStorage has data: `localStorage.getItem('edgemakers_db_services')`
3. Clear cache and reload
4. Check if item is marked as `active: true`

### Data lost on refresh?

- localStorage persists across sessions
- Only cleared if user clears browser data
- Export data regularly: `db.exportAll()`

### Admin changes not showing?

1. Verify you saved the changes
2. Check the active toggle is ON
3. Look for success toast notification
4. Refresh homepage if needed

## Security Notes

⚠️ **Current Limitations:**

- localStorage is accessible via DevTools
- No server-side validation
- Anyone can modify localStorage directly

🔒 **Production Requirements:**

- Move to server-side database
- Add API authentication
- Validate all inputs server-side
- Add role-based access control
- Implement audit logging

## Export/Import Data

### Export All Data

```typescript
const data = db.exportAll();
console.log(JSON.stringify(data, null, 2));
// Copy and save to file
```

### Import Data

```typescript
const importedData = {
  services: [...],
  team: [...],
  testimonials: [...],
  jobs: [...]
};
db.importAll(importedData);
```

## Future Enhancements

- [ ] Add data versioning
- [ ] Implement undo/redo
- [ ] Add bulk operations
- [ ] Export to CSV/Excel
- [ ] Import from CSV/Excel
- [ ] Add search/filter in admin
- [ ] Add data analytics
- [ ] Implement caching layer
- [ ] Add offline support
- [ ] Migrate to IndexedDB for larger datasets

---

🎉 **Your website now has a fully functional, real-time database system!**
