"use client";

import { createContext, useContext, useState, useEffect } from "react";

const EventContext = createContext();

export function useEvents() {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error("useEvents must be used within an EventProvider");
  }
  return context;
}

// Mock external events data
const mockExternalEvents = [
  {
    id: "ext-1",
    name: "Jazz Festival Downtown",
    description:
      "Annual jazz festival featuring local and international artists",
    date: "2025-09-15",
    time: "18:00",
    location: "Downtown Park, Louisville KY",
    price: "$45",
    capacity: 2000,
    attendees: 1200,
    type: "Concert",
    isExternal: true,
    ticketUrl: "https://ticketmaster.com/jazz-festival",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"
  },
  {
    id: "ext-2",
    name: "Tech Conference 2025",
    description: "Leading technology conference with industry experts",
    date: "2025-09-20",
    time: "09:00",
    location: "Convention Center, Louisville KY",
    price: "$299",
    capacity: 500,
    attendees: 350,
    type: "Conference",
    isExternal: true,
    ticketUrl: "https://eventbrite.com/tech-conf",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400"
  }
];

export function EventProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [userBookings, setUserBookings] = useState([]);

  // Initialize with sample events
  useEffect(() => {
    const sampleEvents = [
      {
        id: "1",
        name: "Community Garden Workshop",
        description:
          "Learn organic gardening techniques and sustainable practices",
        date: "2025-09-10",
        time: "10:00",
        location: "Community Center, Falmouth KY",
        capacity: 30,
        attendees: 15,
        type: "Workshop",
        organizer: "Garden Club",
        isExternal: false,
        image:
          "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400"
      },
      {
        id: "2",
        name: "Local Art Exhibition",
        description: "Showcase of local artists and their latest works",
        date: "2025-09-12",
        time: "14:00",
        location: "Art Gallery, Falmouth KY",
        capacity: 50,
        attendees: 25,
        type: "Exhibition",
        organizer: "Art Society",
        isExternal: false,
        image:
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"
      }
    ];
    setEvents(sampleEvents);
  }, []);

  const createEvent = (eventData, organizerName) => {
    const newEvent = {
      ...eventData,
      id: Date.now().toString(),
      attendees: 0,
      organizer: organizerName,
      isExternal: false
    };
    setEvents((prev) => [...prev, newEvent]);
    return newEvent;
  };

  const bookEvent = (eventId, userId) => {
    const allEvents = [...events, ...mockExternalEvents];
    const event = allEvents.find((e) => e.id === eventId);

    if (!event) return { success: false, error: "Event not found" };

    if (event.isExternal) {
      // For external events, just open the ticket URL
      window.open(event.ticketUrl, "_blank");
      return { success: true, external: true };
    }

    if (event.attendees >= event.capacity) {
      return { success: false, error: "Event is full" };
    }

    // Update event attendees
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId ? { ...e, attendees: e.attendees + 1 } : e
      )
    );

    // Add to user bookings
    const booking = {
      id: Date.now().toString(),
      eventId,
      userId,
      event,
      bookedAt: new Date().toISOString()
    };
    setUserBookings((prev) => [...prev, booking]);

    return { success: true, booking };
  };

  const cancelBooking = (bookingId) => {
    const booking = userBookings.find((b) => b.id === bookingId);
    if (!booking) return { success: false, error: "Booking not found" };

    // Update event attendees
    setEvents((prev) =>
      prev.map((e) =>
        e.id === booking.eventId ? { ...e, attendees: e.attendees - 1 } : e
      )
    );

    // Remove from bookings
    setUserBookings((prev) => prev.filter((b) => b.id !== bookingId));

    return { success: true };
  };

  const getAllEvents = () => {
    return [...events, ...mockExternalEvents];
  };

  const getFilteredEvents = (searchTerm, filterType, activeTab) => {
    let allEvents = [];

    switch (activeTab) {
      case "all":
        allEvents = [...events, ...mockExternalEvents];
        break;
      case "community":
        allEvents = events.filter((e) => !e.isExternal);
        break;
      case "nearby":
        allEvents = events.filter((e) => e.location.includes("Falmouth"));
        break;
      default:
        allEvents = [...events, ...mockExternalEvents];
    }

    return allEvents.filter((event) => {
      const matchesSearch =
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === "all" || event.type === filterType;
      return matchesSearch && matchesType;
    });
  };

  const getUserBookings = (userId) => {
    return userBookings.filter((booking) => booking.userId === userId);
  };

  const getUserEvents = (organizerName) => {
    return events.filter((event) => event.organizer === organizerName);
  };

  const value = {
    events,
    userBookings,
    createEvent,
    bookEvent,
    cancelBooking,
    getAllEvents,
    getFilteredEvents,
    getUserBookings,
    getUserEvents
  };

  return (
    <EventContext.Provider value={value}>{children}</EventContext.Provider>
  );
}
