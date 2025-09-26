"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useEvents } from "@/context/EventContext";
import EventCard from "@/components/events/EventCard";
import LocationSelector from "@/components/ui/LocationSelector";

export default function EventDiscovery() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [selectedLocation, activeTab, searchTerm, filterType]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = {
        q: searchTerm,
        type: filterType,
        tab: activeTab,
        location: selectedLocation
      };

      const response = await fetch(
        "/api/events?" + new URLSearchParams(params)
      );
      const result = await response.json();

      if (result.success) {
        setEvents(result.events);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = (location) => {
    setSelectedLocation(location);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search events..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="Workshop">Workshop</option>
            <option value="Conference">Conference</option>
            <option value="Concert">Concert</option>
            <option value="Exhibition">Exhibition</option>
          </select>

          {/* ADDED: LocationSelector component */}
          <LocationSelector
            currentLocation={selectedLocation}
            onLocationChange={handleLocationChange}
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mt-4">
          {["all", "community", "nearby"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg capitalize transition-colors font-medium ${
                activeTab === tab
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-black"
              }`}
            >
              {tab === "all"
                ? "All Events"
                : tab === "community"
                ? "My Community"
                : `Near ${selectedLocation}`}
            </button>
          ))}
        </div>

        {/* Location Info */}
        <div className="mt-2 text-sm text-black">
          {activeTab === "all" &&
            `Showing events worldwide and near ${selectedLocation}`}
          {activeTab === "nearby" &&
            `Showing events within 25 miles of ${selectedLocation}`}
          {activeTab === "community" && "Showing local community events"}
        </div>
      </div>

      {/*  Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <div className="text-black">Searching for events...</div>
        </div>
      )}

      {/*  Events Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {/* No Events Found */}
      {!loading && events.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Search size={48} className="mx-auto mb-4 opacity-50" />
          <p className={"text-black"}>No events found for {selectedLocation}</p>
          <p className="text-sm mt-2 text-gray-600">
            Try selecting a different city or adjusting your search terms
          </p>
        </div>
      )}
    </div>
  );
}
