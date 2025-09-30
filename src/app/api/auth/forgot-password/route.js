import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    // Always return success even if user not found (security best practice)
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account exists, a reset link will be sent"
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Save token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    });

    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;
    console.log("Password reset link:", resetUrl);

    return NextResponse.json({
      success: true,
      message: "If an account exists, a reset link will be sent",
      // Remove this in production - only for testing
      devResetUrl: process.env.NODE_ENV === "development" ? resetUrl : undefined
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process request" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}