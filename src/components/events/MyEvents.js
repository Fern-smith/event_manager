"use client";

import { Calendar, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import EventCard from "@/components/events/EventCard";
import EditEventForm from "@/components/events/EditEventForm";

export default function MyEvents({ setCurrentView }) {
  const { currentUser } = useAuth();
  const [myEvents, setMyEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyEvents();
  }, [currentUser]);

  const loadMyEvents = async () => {
    if (!currentUser) return;

    try {
      const response = await fetch("/api/events");
      const result = await response.json();

      if (result.success) {
        // Filter only events created by current user (local events only)
        const userEvents = result.events.filter(
          (event) =>
            !event.isExternal &&
            (event.organizerId === currentUser.id ||
              event.organizer === currentUser.name)
        );
        setMyEvents(userEvents);
      }
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
  };

  const handleSaveEdit = (updatedEvent) => {
    setMyEvents((prev) =>
      prev.map((event) => (event.id === updatedEvent.id ? updatedEvent : event))
    );
    setEditingEvent(null);
    // Refresh events to get latest data
    loadMyEvents();
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE"
      });

      const result = await response.json();

      if (result.success) {
        setMyEvents((prev) => prev.filter((event) => event.id !== eventId));
        alert("Event deleted successfully!");
      } else {
        alert(result.error || "Failed to delete event");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete event");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">Loading your events...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {editingEvent && (
        <EditEventForm
          event={editingEvent}
          onSave={handleSaveEdit}
          onCancel={() => setEditingEvent(null)}
        />
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Events ({myEvents.length})</h2>
        <button
          onClick={() => setCurrentView("create")}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
        >
          <Plus size={16} />
          Create Event
        </button>
      </div>

      {myEvents.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> Hover over your events to see edit and delete
            buttons in the top-left corner.
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            showBookButton={false}
            showOrganizerActions={true}
            onEdit={handleEditEvent}
            onDelete={handleDeleteEvent}
          />
        ))}
      </div>

      {myEvents.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Calendar size={48} className="mx-auto mb-4 opacity-50" />
          <p>You haven't created any events yet</p>
          <button
            onClick={() => setCurrentView("create")}
            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2 mx-auto"
          >
            <Plus size={16} />
            Create Your First Event
          </button>
        </div>
      )}
    </div>
  );
}
