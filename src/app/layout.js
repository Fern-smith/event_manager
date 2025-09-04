import React from "react";
import "./global.css";

export const metadata = {
  title: "IEventHub - Event Management Platform",
  description: "Discover and manage events in your community"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
