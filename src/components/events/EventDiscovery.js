"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useEvents } from "@/context/EventContext";
import EventCard from "./EventCard";

export default function EventDiscovery() {
  const { getFilteredEvents } = useEvents();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  const filteredEvents = getFilteredEvents(searchTerm, filterType, activeTab);

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
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="Workshop">Workshop</option>
            <option value="Conference">Conference</option>
            <option value="Concert">Concert</option>
            <option value="Exhibition">Exhibition</option>
          </select>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mt-4">
          {["all", "community", "nearby"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                activeTab === tab
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {tab === "all"
                ? "All Events"
                : tab === "community"
                ? "My Community"
                : "Nearby Events"}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Search size={48} className="mx-auto mb-4 opacity-50" />
          <p>No events found matching your criteria</p>
        </div>
      )}
    </div>
  );
}
