import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null });
  }

  try {
    // Fetch full user profile including candidate fields from DB
    const dbUser = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        schoolName: true,
        className: true,
        medium: true,
        parentMobile: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json({ user: session });
    }

    return NextResponse.json({ user: dbUser });
  } catch {
    // Fallback to JWT session if DB lookup fails
    return NextResponse.json({ user: session });
  }
}
