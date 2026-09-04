import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { role } = await req.json();
    const targetEmail = role === "ADMIN" ? "admin@exam.com" : "student@exam.com";

    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: `Default ${role} user not found. Please run seed script.` },
        { status: 404 }
      );
    }

    const userSession = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as "STUDENT" | "ADMIN",
    };

    const token = signToken(userSession);

    const response = NextResponse.json({
      success: true,
      user: userSession,
    });

    response.cookies.set("exam_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Quick login error:", error);
    return NextResponse.json(
      { error: "Quick login failed." },
      { status: 500 }
    );
  }
}
