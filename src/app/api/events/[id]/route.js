import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

// GET /api/events/[id] - Get specific event
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        organizer: {
          select: { name: true }
        },
        _count: {
          select: { bookings: true }
        }
      }
    });

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          error: "Event not found"
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      event: {
        ...event,
        organizer: event.organizer.name,
        attendees: event._count.bookings,
        isExternal: false
      }
    });
  } catch (error) {
    console.error("Get Event Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch event"
      },
      { status: 500 }
    );
  }
}

// PUT /api/events/[id] - Update event
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { name, description, date, time, location, capacity, type, image } =
      body;

    // Check if event exists and user is the organizer
    const existingEvent = await prisma.event.findUnique({
      where: { id }
    });

    if (!existingEvent) {
      return NextResponse.json(
        {
          success: false,
          error: "Event not found"
        },
        { status: 404 }
      );
    }

    if (existingEvent.organizerId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Not authorized to edit this event"
        },
        { status: 403 }
      );
    }

    // Update the event
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        name,
        description,
        date: new Date(`${date}T${time}`),
        time,
        location,
        capacity: parseInt(capacity),
        type,
        image: image || null,
        updatedAt: new Date()
      },
      include: {
        organizer: {
          select: { name: true }
        },
        _count: {
          select: { bookings: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      event: {
        ...updatedEvent,
        organizer: updatedEvent.organizer.name,
        attendees: updatedEvent._count.bookings,
        isExternal: false
      }
    });
  } catch (error) {
    console.error("Update Event Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update event"
      },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id] - Delete event
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Check if event exists and user is the organizer
    const existingEvent = await prisma.event.findUnique({
      where: { id },
      include: {
        _count: {
          select: { bookings: true }
        }
      }
    });

    if (!existingEvent) {
      return NextResponse.json(
        {
          success: false,
          error: "Event not found"
        },
        { status: 404 }
      );
    }

    if (existingEvent.organizerId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Not authorized to delete this event"
        },
        { status: 403 }
      );
    }

    // Check if event has bookings
    if (existingEvent._count.bookings > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete event with ${existingEvent._count.bookings} existing bookings. Cancel bookings first or contact attendees.`
        },
        { status: 400 }
      );
    }

    // Delete the event (Prisma will handle cascade delete of related bookings due to schema)
    await prisma.event.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: "Event deleted successfully"
    });
  } catch (error) {
    console.error("Delete Event Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete event"
      },
      { status: 500 }
    );
  }
}
