"use client";

import { useEffect, useState } from "react";

export default function HomePage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        console.log("Fetching events...");
        const response = await fetch("/api/events");
        console.log("Response status:", response.status);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Events data:", data);

        if (data.success) {
          setEvents(data.events);
        } else {
          setError(data.error);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) return <div className="p-8">Loading events...</div>;
  if (error) return <div className="p-8">Error: {error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Event Management App</h1>
      <p>Found {events.length} events</p>
      <div className="mt-4">
        {events.map((event) => (
          <div key={event.id} className="border p-4 mb-2">
            <h3 className="font-semibold">{event.name}</h3>
            <p>{event.description}</p>
            <p>
              Date: {event.date} at {event.time}
            </p>
            <p>Location: {event.location}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
