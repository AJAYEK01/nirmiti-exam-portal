import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession, hashPassword, verifyPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 403 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required." },
        { status: 400 }
      );
    }

    // Strong password validation
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const hasUpperOrLower = /[A-Za-z]/.test(newPassword);
    const hasDigit = /\d/.test(newPassword);
    if (!hasUpperOrLower || !hasDigit) {
      return NextResponse.json(
        { error: "New password must contain both letters and numbers." },
        { status: 400 }
      );
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: session.id },
    });

    if (!adminUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const isMatch = await verifyPassword(currentPassword, adminUser.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Current password is incorrect." },
        { status: 400 }
      );
    }

    const newHashed = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: adminUser.id },
      data: { password: newHashed },
    });

    return NextResponse.json({
      success: true,
      message: "Examiner password updated successfully.",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "Failed to update examiner password." },
      { status: 500 }
    );
  }
}
