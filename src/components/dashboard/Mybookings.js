"use client";

import { Calendar } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEvents } from "@/context/EventContext";
import EventCard from "@/components/events/EventCard";

export default function MyBookings({ setCurrentView }) {
  const { currentUser } = useAuth();
  const { getUserBookings, cancelBooking } = useEvents();

  const userBookings = getUserBookings(currentUser?.id || "");

  const upcomingBookings = userBookings.filter(
    (booking) => new Date(booking.event.date) >= new Date()
  );
  const pastBookings = userBookings.filter(
    (booking) => new Date(booking.event.date) < new Date()
  );

  const handleCancelBooking = async (bookingId) => {
    const result = await cancelBooking(bookingId);
    if (result.success) {
      alert("Booking cancelled successfully");
    } else {
      alert(result.error);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">My Bookings</h2>

      {/* Upcoming Events */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Upcoming Events ({upcomingBookings.length})
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingBookings.map((booking) => (
            <EventCard
              key={booking.id}
              event={booking.event}
              showBookButton={false}
              onCancel={
                !booking.event.isExternal
                  ? () => handleCancelBooking(booking.id)
                  : null
              }
            />
          ))}
        </div>
      </div>

      {/* Past Events */}
      {pastBookings.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Past Events ({pastBookings.length})
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastBookings.map((booking) => (
              <div key={booking.id} className="opacity-75">
                <EventCard event={booking.event} showBookButton={false} />
              </div>
            ))}
          </div>
        </div>
      )}

      {userBookings.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Calendar size={48} className="mx-auto mb-4 opacity-50" />
          <p>No bookings yet</p>
          <button
            onClick={() => setCurrentView("discover")}
            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Discover Events
          </button>
        </div>
      )}
    </div>
  );
}
