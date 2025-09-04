"use client";

import { Calendar, Plus, User, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Header({ currentView, setCurrentView }) {
  const { currentUser, logout } = useAuth();

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Calendar className="text-blue-500 mr-2" size={24} />
            <span className="text-xl font-bold">IEventHub</span>
          </div>

          <div className="flex items-center gap-4">
            {currentUser ? (
              <>
                <button
                  onClick={() => setCurrentView("discover")}
                  className={`px-4 py-2 rounded transition-colors ${
                    currentView === "discover"
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-gray-100"
                  }`}
                >
                  Discover
                </button>

                <button
                  onClick={() => setCurrentView("bookings")}
                  className={`px-4 py-2 rounded transition-colors ${
                    currentView === "bookings"
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-gray-100"
                  }`}
                >
                  My Bookings
                </button>

                {currentUser.role === "organizer" && (
                  <>
                    <button
                      onClick={() => setCurrentView("my-events")}
                      className={`px-4 py-2 rounded transition-colors ${
                        currentView === "my-events"
                          ? "bg-blue-100 text-blue-600"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      My Events
                    </button>

                    <button
                      onClick={() => setCurrentView("create")}
                      className={`px-4 py-2 rounded transition-colors ${
                        currentView === "create"
                          ? "bg-blue-100 text-blue-600"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <Plus size={16} className="inline mr-1" />
                      Create
                    </button>
                  </>
                )}

                <div className="flex items-center gap-2 ml-4">
                  <User size={20} />
                  <span>{currentUser.name}</span>
                  <button
                    onClick={logout}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <User size={20} />
                <span>Guest</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
