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

    const { name, schoolName, className, rollNumber, medium, parentMobile } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: "Candidate full name is required." }, { status: 400 });
    }

    if (!schoolName?.trim()) {
      return NextResponse.json({ error: "School name is required." }, { status: 400 });
    }

    if (!className?.trim()) {
      return NextResponse.json({ error: "Class / Standard is required." }, { status: 400 });
    }

    if (!rollNumber?.trim()) {
      return NextResponse.json({ error: "Roll Number is required." }, { status: 400 });
    }

    const trimmedName = name.trim();
    const trimmedSchool = schoolName.trim();
    const trimmedClass = className.trim();
    const trimmedRoll = rollNumber.trim();
    const isMalayalam = medium === "MALAYALAM";

    // Helper to normalize strings: remove all whitespace, dots, commas, hyphens, brackets
    const normalize = (str: string) =>
      str.toLowerCase().replace(/[\s\.\-_,\(\)\[\]']/g, "");

    const normInputName = normalize(trimmedName);
    const normInputSchool = normalize(trimmedSchool);

    // Also check if browser sent exam_completed cookie
    const completedCookie = req.cookies.get("exam_completed")?.value;
    if (completedCookie) {
      return NextResponse.json(
        {
          error: isMalayalam
            ? "ഈ ഉപകരണത്തിൽ നിന്ന് ഇതിനകം പരീക്ഷ സമർപ്പിച്ചതാണ്. ഒരു വിദ്യാർത്ഥിക്ക് ഒരു തവണ മാത്രമേ പരീക്ഷ എഴുതാൻ സാധിക്കൂ."
            : "An examination has already been completed and submitted from this device. Multiple attempts are strictly prohibited.",
          alreadySubmitted: true,
          attemptId: completedCookie,
        },
        { status: 400 }
      );
    }

    // Strict Malpractice Check: A student cannot enter the exam twice.
    // Query existing student candidates to check normalized names & schools
    const existingCandidates = await prisma.user.findMany({
      where: {
        role: "STUDENT",
      },
      include: {
        attempts: {
          orderBy: { startedAt: "desc" },
        },
      },
    });

    for (const cand of existingCandidates) {
      const candNormName = normalize(cand.name);
      const candNormSchool = normalize(cand.schoolName || "");

      // Match if school matches (or is identical) and name is matching/fuzzy match
      const schoolMatches =
        candNormSchool === normInputSchool ||
        candNormSchool.includes(normInputSchool) ||
        normInputSchool.includes(candNormSchool);

      const nameMatches =
        candNormName === normInputName ||
        (normInputName.length >= 3 && candNormName.includes(normInputName)) ||
        (candNormName.length >= 3 && normInputName.includes(candNormName));

      if (schoolMatches && nameMatches) {
        for (const att of cand.attempts) {
          // If already submitted, reject with strict notice
          if (att.submittedAt) {
            return NextResponse.json(
              {
                error: isMalayalam
                  ? `നിങ്ങൾ (${cand.name}, ${cand.schoolName}) ഇതിനകം പരീക്ഷ എഴുതി സമർപ്പിച്ചതാണ്. ഒരു വിദ്യാർത്ഥിക്ക് ഒരു തവണ മാത്രമേ പരീക്ഷ എഴുതാൻ സാധിക്കൂ.`
                  : `Candidate (${cand.name}, ${cand.schoolName}) has already submitted this examination. Multiple attempts are strictly prohibited.`,
                alreadySubmitted: true,
                attemptId: att.id,
              },
              { status: 400 }
            );
          }

          // If attempt was started, check time elapsed
          const elapsed = (Date.now() - new Date(att.startedAt).getTime()) / 1000;
          // If 8 minutes (480 seconds) have passed, this attempt has expired! Auto-close it now.
          if (elapsed >= 480) {
            await prisma.attempt.update({
              where: { id: att.id },
              data: {
                submittedAt: new Date(new Date(att.startedAt).getTime() + 480000),
                timeTakenSeconds: 480,
              },
            }).catch(() => {});

            return NextResponse.json(
              {
                error: isMalayalam
                  ? `നിങ്ങളുടെ (${cand.name}) മുൻ പരീക്ഷാ സമയം (8 മിനിറ്റ്) അവസാനിച്ചു. പുനഃപരീക്ഷ അനുവദനീയമല്ല.`
                  : `Your (${cand.name}) previous examination time limit (8 minutes) has already expired. Multiple attempts are strictly prohibited.`,
                alreadySubmitted: true,
                attemptId: att.id,
              },
              { status: 400 }
            );
          }

          // Active attempt still within 8 minutes: Resume their ongoing attempt seamlessly
          const token = signToken({
            id: cand.id,
            name: cand.name,
            email: cand.email,
            role: "STUDENT",
          });

          const res = NextResponse.json({
            success: true,
            resumed: true,
            examId: att.examId,
            user: {
              id: cand.id,
              name: cand.name,
              schoolName: cand.schoolName,
              className: cand.className,
              rollNumber: cand.rollNumber,
              medium: cand.medium,
              parentMobile: cand.parentMobile,
            },
          });

          res.cookies.set("exam_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60,
            path: "/",
          });

          return res;
        }
      }
    }

    const cleanMobile = parentMobile ? parentMobile.trim() : "";
    const candidateSlug = trimmedName.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 10);
    const uniqueTag = `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const cleanEmail = cleanMobile
      ? `student_${cleanMobile}_${uniqueTag}@exam.portal`
      : `candidate_${candidateSlug}_${uniqueTag}@exam.portal`;

    // Create user for this candidate attempt
    const user = await prisma.user.create({
      data: {
        name: trimmedName,
        email: cleanEmail,
        password: "candidate-token-access",
        role: "STUDENT",
        schoolName: trimmedSchool,
        className: trimmedClass,
        rollNumber: trimmedRoll,
        medium: isMalayalam ? "MALAYALAM" : "ENGLISH",
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
        rollNumber: user.rollNumber,
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
