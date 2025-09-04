"use client";

import {
  Calendar,
  MapPin,
  Users,
  Star,
  ExternalLink,
  Edit,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEvents } from "@/context/EventContext";
import { useState } from "react";
import { NextResponse } from "next/server";

export default function EventCard({
  event,
  showBookButton = true,
  showOrganizerActions = false,
  onCancel = null,
  onEdit = null,
  onDelete = null
}) {
  const { currentUser } = useAuth();
  const { bookEvent, getUserBookings } = useEvents();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const userBookings = getUserBookings(currentUser?.id || "");
  const isBooked = userBookings.some((b) => b.eventId === event.id);
  const spotsLeft = event.capacity - event.attendees;

  // Check if current user is the organizer of this event
  const isOrganizer =
    currentUser?.id === event.organizerId ||
    (currentUser?.name === event.organizer && !event.isExternal);

  const handleBook = async () => {
    if (!currentUser) {
      alert("Please login to book events");
      return;
    }

    if (event.isExternal) {
      window.open(event.ticketUrl, "_blank");
      return;
    }

    const result = await bookEvent(event.id, currentUser.id);

    if (result.success) {
      alert("Booking confirmed!");
    } else {
      alert(result.error);
    }
  };

  const handleDelete = async () => {
    if (event.attendees > 0) {
      alert(
        `Cannot delete event with ${event.attendees} existing bookings. Contact attendees first.`
      );
      return;
    }

    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (onDelete) {
      await onDelete(event.id);
    }
    setShowDeleteConfirm(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow relative">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="text-red-500" size={24} />
              <h3 className="font-bold text-lg">Delete Event?</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{event.name}"? This action cannot
              be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="h-48 bg-gray-200 relative">
        {event.image && (
          <img
            src={event.image}
            alt={event.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src =
                "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=200&fit=crop";
            }}
          />
        )}

        {event.isExternal && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
            <Star size={12} />
            Eventbrite
          </div>
        )}

        {isOrganizer && !event.isExternal && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-sm">
            Your Event
          </div>
        )}

        {onCancel && (
          <button
            onClick={onCancel}
            className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600 transition-colors"
          >
            Cancel Booking
          </button>
        )}

        {/* Organizer Action Buttons */}
        {showOrganizerActions && isOrganizer && !event.isExternal && (
          <div className="absolute top-2 left-2 flex gap-2">
            <button
              onClick={() => onEdit && onEdit(event)}
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
              title="Edit Event"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-colors"
              title="Delete Event"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold line-clamp-2">{event.name}</h3>
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs whitespace-nowrap ml-2">
            {event.type}
          </span>
        </div>

        <p className="text-gray-600 mb-3 text-sm line-clamp-2">
          {event.description}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar size={16} />
            <span>
              {event.date} at {event.time}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin size={16} />
            <span className="line-clamp-1">{event.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users size={16} />
            <span>
              {event.isExternal ? (
                `${event.attendees} interested`
              ) : (
                <>
                  {event.attendees}/{event.capacity} attending
                  {spotsLeft > 0 && (
                    <span className="text-green-600 ml-1">
                      ({spotsLeft} spots left)
                    </span>
                  )}
                </>
              )}
            </span>
          </div>
          {event.price && (
            <div className="text-lg font-bold text-green-600">
              {event.price}
            </div>
          )}
        </div>

        {showBookButton && !showOrganizerActions && (
          <div className="flex gap-2">
            {event.isExternal ? (
              <button
                onClick={handleBook}
                className="flex-1 bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink size={16} />
                View on Eventbrite
              </button>
            ) : (
              <button
                onClick={handleBook}
                disabled={isBooked || spotsLeft === 0}
                className={`flex-1 py-2 px-4 rounded transition-colors ${
                  isBooked
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : spotsLeft === 0
                    ? "bg-red-300 text-red-700 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                {isBooked
                  ? "Already Booked"
                  : spotsLeft === 0
                  ? "Event Full"
                  : "Book Event"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
