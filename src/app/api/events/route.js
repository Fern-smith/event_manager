import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { EventbriteService } from "@/lib/eventbrite";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// My Change

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const type = searchParams.get("type") || "all";
    const tab = searchParams.get("tab") || "all";
    const location = searchParams.get("location") || "Louisville, KY";

    // Fetch local events
    const localEvents = await prisma.event.findMany({
      where: {
        AND: [
          query
            ? {
                OR: [
                  { name: { contains: query, mode: "insensitive" } },
                  { description: { contains: query, mode: "insensitive" } }
                ]
              }
            : {},
          type !== "all" ? { type } : {}
        ]
      },
      include: {
        organizer: { select: { name: true } },
        _count: { select: { bookings: true } }
      },
      orderBy: { date: "asc" }
    });

    const transformedLocalEvents = localEvents.map((event) => ({
      ...event,
      attendees: event._count.bookings,
      organizer: event.organizer.name,
      isExternal: false
    }));

    let externalEvents = [];

    // Fetch Eventbrite events (skip for community tab)
    if (tab !== "community") {
      const eventbriteParams = {
        q: query,
        "location.address": location
      };

      const eventbriteResult = await EventbriteService.searchEvents(
        eventbriteParams
      );
      if (eventbriteResult.success) {
        externalEvents = eventbriteResult.events;
      }
    }

    // Combine events based on tab
    let allEvents = [];
    switch (tab) {
      case "community":
        allEvents = transformedLocalEvents;
        break;
      case "nearby":
        allEvents = [
          ...transformedLocalEvents,
          ...externalEvents.filter(
            (event) =>
              event.location.includes("Louisville") ||
              event.location.includes("Kentucky")
          )
        ];
        break;
      default:
        allEvents = [...transformedLocalEvents, ...externalEvents];
    }

    return NextResponse.json({
      success: true,
      events: allEvents.slice(0, 50)
    });
  } catch (error) {
    console.error("Events API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch events"
      },
      { status: 500 }
    );
  }
}

// Keep your existing POST function unchanged
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, date, time, location, capacity, type, image } =
      body;

    const event = await prisma.event.create({
      data: {
        name,
        description,
        date: new Date(`${date}T${time}`),
        time,
        location,
        capacity: parseInt(capacity),
        type,
        image: image || null,
        organizerId: session.user.id
      },
      include: {
        organizer: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      event: {
        ...event,
        organizer: event.organizer.name,
        attendees: 0,
        isExternal: false
      }
    });
  } catch (error) {
    console.error("Create Event Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create event"
      },
      { status: 500 }
    );
  }
}
