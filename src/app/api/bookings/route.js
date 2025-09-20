import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET /api/bookings - Get user bookings
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        event: {
          include: {
            organizer: {
              select: { name: true }
            },
            _count: {
              select: { bookings: true }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    const transformedBookings = bookings.map((booking) => ({
      id: booking.id,
      userId: booking.userId,
      eventId: booking.eventId,
      createdAt: booking.createdAt,
      event: {
        ...booking.event,
        organizer: booking.event.organizer.name,
        attendees: booking.event._count.bookings,
        isExternal: false
      }
    }));

    return NextResponse.json({
      success: true,
      bookings: transformedBookings
    });
  } catch (error) {
    console.error("Bookings GET Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch bookings"
      },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create booking
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId } = await request.json();

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
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

    // Check if event is full
    if (event._count.bookings >= event.capacity) {
      return NextResponse.json(
        {
          success: false,
          error: "Event is full"
        },
        { status: 400 }
      );
    }

    // Check if user already booked this event
    const existingBooking = await prisma.booking.findUnique({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId
        }
      }
    });

    if (existingBooking) {
      return NextResponse.json(
        {
          success: false,
          error: "You have already booked this event"
        },
        { status: 400 }
      );
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId: session.user.id,
        eventId
      },
      include: {
        event: {
          include: {
            organizer: {
              select: { name: true }
            },
            _count: {
              select: { bookings: true }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        userId: booking.userId,
        eventId: booking.eventId,
        createdAt: booking.createdAt,
        event: {
          ...booking.event,
          organizer: booking.event.organizer.name,
          attendees: booking.event._count.bookings,
          isExternal: false
        }
      }
    });
  } catch (error) {
    console.error("Bookings POST Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create booking"
      },
      { status: 500 }
    );
  }
}

// DELETE /api/bookings - Cancel booking
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId } = await request.json();

    // Check if booking exists and belongs to user
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId: session.user.id
      }
    });

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          error: "Booking not found"
        },
        { status: 404 }
      );
    }

    // Delete booking
    await prisma.booking.delete({
      where: { id: bookingId }
    });

    return NextResponse.json({
      success: true,
      message: "Booking cancelled successfully"
    });
  } catch (error) {
    console.error("Bookings DELETE Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to cancel booking"
      },
      { status: 500 }
    );
  }
}
