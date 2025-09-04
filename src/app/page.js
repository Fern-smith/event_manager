"use client";

import { AuthProvider } from "@/context/AuthContext";
import { EventProvider } from "@/context/EventContext";
import EventManagementApp from "@/components/EventManagementApp";

export default function HomePage() {
  return (
    <AuthProvider>
      <EventProvider>
        <EventManagementApp />
      </EventProvider>
    </AuthProvider>
  );
}
