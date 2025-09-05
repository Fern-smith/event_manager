"use client";

import "./globals.css";
import { SessionProvider } from "next-auth/react";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>EventHub - Event Management Platform</title>
        <meta
          name="description"
          content="Discover and manage events in your community"
        />
      </head>
      <body className="font-sans antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
