export const EVENT_TYPES = [
  "Workshop",
  "Conference",
  "Concert",
  "Exhibition",
  "Meetup",
  "Seminar",
  "Festival",
  "Sports",
  "Food & Drink",
  "Arts & Culture"
];

export const USER_ROLES = {
  ATTENDEE: "attendee",
  ORGANIZER: "organizer",
  ADMIN: "admin"
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    LOGOUT: "/api/auth/logout"
  },
  EVENTS: {
    BASE: "/api/events",
    CREATE: "/api/events",
    BOOK: "/api/events/book"
  }
};

export const ROUTES = {
  HOME: "/",
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  DASHBOARD: "/dashboard",
  EVENTS: "/events",
  CREATE_EVENT: "/events/create",
  MY_BOOKINGS: "/dashboard/bookings",
  MY_EVENTS: "/dashboard/my-events"
};
