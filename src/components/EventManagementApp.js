"use client";

import { useState } from "react";
import Header from "@/src/components/ui/Header";
import EventDiscovery from "@/src/components/events/EventDiscovery";
import CreateEventForm from "@/src/components/events/CreateEventForm";
import MyEvents from "@/src/components/dashboard/MyEvents";
import { useAuth } from "@/src/context/AuthContext";
import AuthForm from "@/src/components/auth/authForm";
import MyBookings from "@/src/components/dashboard/MyBookings";

export default function EventManagementApp() {
  const { currentUser } = useAuth();
  const [currentView, setCurrentView] = useState("discover");
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentView={currentView} setCurrentView={setCurrentView} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!currentUser ? (
          <AuthForm
            isLogin={showLogin}
            onSwitch={() => setShowLogin(!showLogin)}
          />
        ) : (
          <>
            {currentView === "discover" && <EventDiscovery />}
            {currentView === "create" && currentUser.role === "organizer" && (
              <CreateEventForm setCurrentView={setCurrentView} />
            )}
            {currentView === "bookings" && (
              <MyBookings setCurrentView={setCurrentView} />
            )}
            {currentView === "my-events" &&
              currentUser.role === "organizer" && (
                <MyEvents setCurrentView={setCurrentView} />
              )}
          </>
        )}
      </main>
    </div>
  );
}
