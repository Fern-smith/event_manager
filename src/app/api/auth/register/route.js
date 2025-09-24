import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

//Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    //Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        {
          success: false,
          error: "All fields are required"
        },
        { status: 400 }
      );
    }

    //validate email format
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email format"
        },
        { status: 400 }
      );
    }

    //Validate password strength (minimum 6 characters)
    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must be at least 6 characters long"
        },
        { status: 400 }
      );
    }

    //Validate role
    const validRoles = ["ATTENDEE", "ORGANIZER"];
    const upperRole = role.toUpperCase();
    if (!validRoles.includes(upperRole)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid role. Must be 'attendee' or 'organizer'"
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() } // Normalize email to lowercase
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "An account with this email already exists"
        },
        { status: 409 } // 409 Conflict is more appropriate for duplicates
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with normalized email
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: upperRole
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
        //Don't return password hash
      }
    });

    return NextResponse.json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Registration Error:", error);

    // Handle Prisma-specific errors
    if (error.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          error: "This email is already registered"
        },
        { status: 409 }
      );
    }
    // Generic error response
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create user. Please try again later."
      },
      { status: 500 }
    );
  } finally {
    //Disconnect Prisma Client to prevent connection leaks
    await prisma.$disconnect();
  }
}
