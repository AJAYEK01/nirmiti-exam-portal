import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { signToken, getSession } from "@/lib/auth";
import { getEffectiveExamWindow } from "@/lib/portal-setting";

export async function POST(req: NextRequest) {
  try {
    // Enforce examination window on the server (Sept 9, 2026, 10:00 AM - 10:00 PM IST)
    const session = await getSession();
    if (session?.role !== "ADMIN") {
      const windowInfo = await getEffectiveExamWindow();
      if (!windowInfo.isOpen) {
        return NextResponse.json(
          {
            error:
              windowInfo.status === "UPCOMING"
                ? `Registration will open on ${windowInfo.startDateStr}. Please return on September 9 at 10:00 AM IST.`
                : `The examination portal closed on ${windowInfo.endDateStr}. Registrations are closed.`,
            windowStatus: windowInfo.status,
          },
          { status: 403 }
        );
      }
    }

    const { name, schoolName, className, medium, parentMobile } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: "Candidate full name is required." }, { status: 400 });
    }

    if (!schoolName?.trim()) {
      return NextResponse.json({ error: "School name is required." }, { status: 400 });
    }

    if (!className?.trim()) {
      return NextResponse.json({ error: "Class / Standard is required." }, { status: 400 });
    }

    const cleanMobile = parentMobile ? parentMobile.trim() : "";
    const candidateSlug = name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 10);
    const uniqueTag = `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const cleanEmail = cleanMobile
      ? `student_${cleanMobile}@exam.portal`
      : `candidate_${candidateSlug}_${uniqueTag}@exam.portal`;

    // Create user for this candidate attempt
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        password: "candidate-token-access",
        role: "STUDENT",
        schoolName: schoolName.trim(),
        className: className.trim(),
        medium: medium === "MALAYALAM" ? "MALAYALAM" : "ENGLISH",
        parentMobile: cleanMobile || null,
      },
    });

    // Find Master Exam
    let exam = await prisma.exam.findFirst({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
    });

    if (!exam) {
      return NextResponse.json({ error: "No published exam available." }, { status: 404 });
    }

    const userSession = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: "STUDENT" as const,
    };

    const token = signToken(userSession);

    const response = NextResponse.json({
      success: true,
      examId: exam.id,
      user: {
        id: user.id,
        name: user.name,
        schoolName: user.schoolName,
        className: user.className,
        medium: user.medium,
        parentMobile: user.parentMobile,
      },
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
    console.error("Register candidate error:", error);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
