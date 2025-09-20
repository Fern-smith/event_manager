import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { EventProvider } from "@/context/EventContext";
import ClientSessionProvider from "@/components/ClientSessionProvider";

const inter = Inter({
  subset: ["latin"],
  weight: "400",
  preload: false
});

export const metadata = {
  title: "IEventHub - Event Management Platform",
  description: "Discover and manage events in your community"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className}main`}>
        <ClientSessionProvider>
          <AuthProvider>
            <EventProvider>{children}</EventProvider>
          </AuthProvider>
        </ClientSessionProvider>
      </body>
    </html>
  );
}
