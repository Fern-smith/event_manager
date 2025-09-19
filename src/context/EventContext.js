"use client";

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const EventContext = createContext();

export function useEvents() {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error("useEvents must be used within an EventProvider");
  }
  return context;
}

export function EventProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(false); // This was missing!

  // Fetch all events (local + Eventbrite)
  const fetchEvents = async (params = {}) => {
    setLoading(true);
    try {
      const response = await axios.get("/api/events", { params });
      if (response.data.success) {
        setEvents(response.data.events);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user bookings
  const fetchBookings = async () => {
    try {
      const response = await axios.get("/api/bookings");
      if (response.data.success) {
        setUserBookings(response.data.bookings);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  // Create event
  const createEvent = async (eventData) => {
    try {
      const response = await axios.post("/api/events", eventData);
      if (response.data.success) {
        setEvents((prev) => [...prev, response.data.event]);
        return { success: true, event: response.data.event };
      }
      return { success: false, error: response.data.error };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Failed to create event"
      };
    }
  };

  // Book event
  const bookEvent = async (eventId) => {
    try {
      const response = await axios.post("/api/bookings", { eventId });
      if (response.data.success) {
        setUserBookings((prev) => [...prev, response.data.booking]);
        return { success: true, booking: response.data.booking };
      }
      return { success: false, error: response.data.error };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Failed to book event"
      };
    }
  };

  // Cancel booking
  const cancelBooking = async (bookingId) => {
    try {
      const response = await axios.delete("/api/bookings", {
        data: { bookingId }
      });
      if (response.data.success) {
        setUserBookings((prev) => prev.filter((b) => b.id !== bookingId));
        return { success: true };
      }
      return { success: false, error: response.data.error };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Failed to cancel booking"
      };
    }
  };

  // Get user bookings
  const getUserBookings = (userId) => {
    return userBookings.filter((booking) => booking.userId === userId);
  };

  // Filter events
  const getFilteredEvents = (searchTerm, filterType, activeTab) => {
    return events.filter((event) => {
      const matchesSearch =
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === "all" || event.type === filterType;

      let matchesTab = true;
      if (activeTab === "community") {
        matchesTab = !event.isExternal;
      } else if (activeTab === "nearby") {
        matchesTab =
          event.location.includes("Falmouth") ||
          event.location.includes("Louisville");
      }

      return matchesSearch && matchesType && matchesTab;
    });
  };

  const value = {
    events,
    userBookings,
    loading, // Now properly defined
    fetchEvents,
    fetchBookings,
    createEvent,
    bookEvent,
    cancelBooking,
    getUserBookings,
    getFilteredEvents
  };

  return (
    <EventContext.Provider value={value}>{children}</EventContext.Provider>
  );
}
