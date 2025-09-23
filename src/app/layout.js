import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { EventProvider } from "@/context/EventContext";
import ClientSessionProvider from "@/components/ClientSessionProvider";

export const metadata = {
  title: "IEventHub - Event Management Platform",
  description: "Discover and manage events in your community"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <ClientSessionProvider>
          <AuthProvider>
            <EventProvider>{children}</EventProvider>
          </AuthProvider>
        </ClientSessionProvider>
      </body>
    </html>
  );
}
