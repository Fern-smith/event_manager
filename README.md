
# IEventHub - Event Management Application

## 1. Overview

IEventHub is a comprehensive event management platform that connects event organizers with attendees. The platform enables users to discover, create, and manage events while integrating external sources like Eventbrite to provide a centralized hub for all event-related activities. 

### Key Features
- User authentication with role-based access (Attendee/Organizer)
- Event discovery with search and filter capabilities
- Integration with Eventbrite API for external events
- Location-based event filtering 
- Event creation and management for organizers
- Booking system for attendees
- Password reset functionality
- Real-time event capacity tracking

### Tech Stack
- **Frontend:** Next.js, React, Tailwind CSS  
- **Backend:** Next.js API Routes, NextAuth.js  
- **Database:** PostgreSQL with Prisma ORM  
- **External API:** Eventbrite API V3  
- **Authentication:** NextAuth.js with JWT  
- **Deployment:** Vercel  

---

## 2. Objective

The primary objective of IEventHub is to create a unified platform that:  

1. **Simplifies Event Discovery** – Aggregates local community events and external events from Eventbrite into one searchable platform  
2. **Empowers Organizers** – Provides tools for event creators to manage their events, track attendance, and engage with their audience  
3. **Enhances User Experience** – Offers location-based filtering, real-time availability, and seamless booking workflows  
4. **Bridges Communities** – Connects local event organizers with nearby attendees while also exposing users to broader event ecosystems  
5. **Ensures Security** – Implements secure authentication, password reset, and role-based access control  

---

## 3. Data Source and API

### 3.1 Database (PostgreSQL)
Primary data storage for:  
- User accounts and authentication  
- Locally created events  
- Booking records  
- User roles and permissions  

### 3.2 Eventbrite API V3
**Endpoint:** `https://www.eventbriteapi.com/v3`  

**Key Integration Points:**  
- Event Search: `/events/search`  
  - Parameters: location, date range, keywords, sorting  
  - Returns: Event details including name, description, venue, pricing, organizer  

**Data Transformation**  
```json
{
  "id": "eventbrite-{eventId}",
  "name": "string",
  "description": "string",
  "date": "ISO date string",
  "time": "HH:MM",
  "location": "Venue, City, State",
  "capacity": 100,
  "attendees": 50,
  "type": "mapped category",
  "image": "URL",
  "price": "formatted price string",
  "isExternal": true,
  "ticketUrl": "Eventbrite link"
}
```

**Location Handling:**  
- Default search radius: 30 miles  
- Supports major US cities  
- Falls back to **New York, NY** if location unavailable  

---

## 4. Database Schema

### 4.1 Entity Relationship Diagram  

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│    User      │         │    Event     │         │   Booking    │
├──────────────┤         ├──────────────┤         ├──────────────┤
│ id (PK)      │────┐    │ id (PK)      │────┐    │ id (PK)      │
│ email        │    │    │ name         │    │    │ userId (FK)  │
│ name         │    │    │ description  │    │    │ eventId (FK) │
│ password     │    │    │ date         │    │    │ createdAt    │
│ role         │    │    │ time         │    │    │ updatedAt    │
│ resetToken   │    │    │ location     │    │    └──────────────┘
│ resetExpiry  │    │    │ capacity     │    │
│ createdAt    │    │    │ type         │    │
│ updatedAt    │    │    │ image        │    │
└──────────────┘    │    │ price        │    │
                    │    │ isExternal   │    │
                    └───>│ organizerId  │<───┘
                         │ createdAt    │
                         │ updatedAt    │
                         └──────────────┘
```

### 4.2 Schema Details  

#### User Table  
```prisma
model User {
  id               String    @id @default(cuid())
  email            String    @unique
  name             String
  password         String
  role             Role      @default(ATTENDEE)
  resetToken       String?
  resetTokenExpiry DateTime?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  
  eventsCreated Event[]   @relation("EventOrganizer")
  bookings      Booking[]
}

enum Role {
  ATTENDEE
  ORGANIZER
  ADMIN
}
```

#### Event Table  
```prisma
model Event {
  id          String   @id @default(cuid())
  name        String
  description String
  date        DateTime
  time        String
  location    String
  capacity    Int
  type        String
  image       String?
  price       Decimal? @db.Decimal(10, 2)
  isExternal  Boolean  @default(false)
  externalId  String?
  ticketUrl   String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  organizerId String
  organizer   User      @relation("EventOrganizer")
  bookings    Booking[]
}
```

#### Booking Table  
```prisma
model Booking {
  id        String   @id @default(cuid())
  userId    String
  eventId   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  user  User  @relation(fields: [userId])
  event Event @relation(fields: [eventId])
  
  @@unique([userId, eventId])
}
```

---

## 5. Key Functionality

### 5.1 Authentication & Authorization
- **User Registration**
  - Email/Password validation  
  - Password requirements: 8+ characters, uppercase, lowercase, number  
  - Role selection (Attendee/Organizer)  
  - Automatic login after registration  

- **User Login**
  - Email/password authentication via NextAuth  
  - JWT-based session management  
  - 30-day session expiration  

- **Password Reset**
  1. User requests reset via email  
  2. System generates secure token (1-hour expiration)  
  3. User receives reset link  
  4. Password update with validation  

### 5.2 Event Discovery
- Search & filter by name, type, and location  
- Tabs for **All Events**, **My Community**, **Nearby**  
- Grid layout event cards with real-time availability indicators  

### 5.3 Event Creation (Organizers)
- Create event form (name, description, date, time, location, capacity)  
- Edit/delete events (only if no bookings exist)  
- Real-time attendee count  

### 5.4 Booking System (Attendees)
- One-click booking for local events  
- Redirect to Eventbrite for external events  
- View/cancel bookings  
- Track upcoming & past events  

### 5.5 User Dashboard
- **Attendee Dashboard**: My Bookings, Event Discovery  
- **Organizer Dashboard**: My Events, Create Event, Edit/Delete  

---

## 6. User Flow

### 6.1 Attendee Flow  
```
Landing Page → Register/Login (Attendee) → Event Discovery → Book Event → My Bookings
```

### 6.2 Organizer Flow  
```
Landing Page → Register/Login (Organizer) → Organizer Dashboard → Create Event → Manage Events → Event Published
```

### 6.3 Password Reset Flow  
```
Login → Forgot Password → Email Reset Link → Reset Form → Success → Redirect to Login
```

---

## 7. Mock Up / Wireframe

### Screenshot  
![Screenshot](/docs/event-app-ss.png)
