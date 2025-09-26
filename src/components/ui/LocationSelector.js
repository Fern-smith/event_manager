"use client";

import { useState } from "react";
import { MapPin, Search } from "lucide-react";

export default function LocationSelector({
  onLocationChange,
  currentLocation
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [customLocation, setCustomLocation] = useState("");

  const popularCities = [
    "New York, NY",
    "Los Angeles, CA",
    "Chicago, IL",
    "Cincinnati, OH",
    "Louisville, KY",
    "Houston, TX",
    "Phoenix, AZ",
    "Philadelphia, PA",
    "San Antonio, TX",
    "San Diego, CA",
    "Dallas, TX",
    "Austin, TX",
    "San Francisco, CA",
    "Seattle, WA",
    "Boston, MA",
    "Miami, FL",
    "Denver, CO",
    "Atlanta, GA",
    "Las Vegas, NV",
    "Portland, OR",
    "Nashville, TN",
    "Orlando, FL"
  ];

  const handleCitySelect = (city) => {
    onLocationChange(city);
    setIsOpen(false);
  };

  const handleCustomLocation = () => {
    if (customLocation.trim()) {
      onLocationChange(customLocation.trim());
      setCustomLocation("");
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors text-black"
      >
        <MapPin size={16} />
        <span className="text-sm font-medium">{currentLocation}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto focus:ring-2 focus:ring-blue-500 text-black">
          <div className="p-3 border-b">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter city, state (e.g., Austin, TX)"
                className="flex-1 px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCustomLocation()}
              />
              <button
                onClick={handleCustomLocation}
                className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                <Search size={16} />
              </button>
            </div>
          </div>
          <div className="p-2">
            <p className="text-xs text-gray-600 mb-2 px-2"> Popular Cities </p>
            {popularCities.map((city) => (
              <button
                key={city}
                onClick={() => handleCitySelect(city)}
                className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 transition-colors ${
                  currentLocation === city ? "bg-blue-50 text-blue-600" : ""
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
