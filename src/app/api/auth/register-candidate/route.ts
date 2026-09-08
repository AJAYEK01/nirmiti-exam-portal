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

    const { name, schoolName, className, division, rollNumber, medium, parentMobile } = await req.json();

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

    // Helper to parse standard (8, 9, 10) and division (A, B, C...)
    const parseClassAndDiv = (classStr: string, explicitDiv?: string) => {
      const norm = normalize(classStr);
      let standard = "";
      if (norm.includes("10") || norm.includes("ten")) standard = "10";
      else if (norm.includes("9") || norm.includes("nine")) standard = "9";
      else if (norm.includes("8") || norm.includes("eight")) standard = "8";

      let div = explicitDiv ? normalize(explicitDiv) : "";
      if (!div) {
        const match = classStr.match(/div\s*([a-z0-9]+)/i) || classStr.match(/-\s*([a-z0-9]+)$/i);
        if (match) div = normalize(match[1]);
      }
      return { standard, div, norm };
    };

    // Helper to clean roll number (normalizes "05" and "5" to "5", preserves alphanumeric)
    const cleanRoll = (r: string) => {
      const digits = r.replace(/\D/g, "");
      if (digits && !isNaN(parseInt(digits, 10))) {
        return String(parseInt(digits, 10));
      }
      return normalize(r);
    };

    const normInputName = normalize(trimmedName);
    const normInputSchool = normalize(trimmedSchool);
    const normInputRoll = cleanRoll(trimmedRoll);
    const inputClassInfo = parseClassAndDiv(trimmedClass, division);

    // Strict High School Eligibility Check (Classes 8, 9, 10 only)
    if (!["8", "9", "10"].includes(inputClassInfo.standard)) {
      return NextResponse.json(
        {
          error: isMalayalam
            ? "ഈ പരീക്ഷ 8, 9, 10 ഹൈസ്കൂൾ വിദ്യാർത്ഥികൾക്ക് മാത്രമായി നിജപ്പെടുത്തിയിരിക്കുന്നു."
            : "This competition is open strictly to High School students (Classes 8, 9, and 10 only). Higher secondary and other classes are not eligible.",
        },
        { status: 400 }
      );
    }
    // Query existing student candidates to verify identity by School + Class (8, 9, 10) + Division + Roll Number
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
      const candNormRoll = cleanRoll(cand.rollNumber || "");
      const candClassInfo = parseClassAndDiv(cand.className || "");

      // 1. School check: must match school
      const schoolMatches =
        candNormSchool === normInputSchool ||
        candNormSchool.includes(normInputSchool) ||
        normInputSchool.includes(candNormSchool);

      if (!schoolMatches) continue;

      // 2. Class / Standard (8, 9, or 10) check:
      // If candidates are in different classes (e.g. Class 8 vs Class 9 or Class 10), they are DIFFERENT students!
      // In the same school, Class 8 Roll 5 and Class 10 Roll 5, or Class 8 Yadhu and Class 10 Yadhu,
      // are completely different students. Never block!
      if (inputClassInfo.standard && candClassInfo.standard && inputClassInfo.standard !== candClassInfo.standard) {
        continue;
      }

      // 3. Division check:
      // If both specify different divisions (e.g. Div A vs Div B), they are in different classrooms.
      // Div A Roll 5 and Div B Roll 5 are different students. Never block!
      if (inputClassInfo.div && candClassInfo.div && inputClassInfo.div !== candClassInfo.div) {
        continue;
      }

      // 4. Roll Number check:
      // Within the same school, same class standard, and same division:
      // Each student has a unique roll number.
      // If candidate A has Roll 1 and candidate B has Roll 2:
      // Even if both share the exact same first name (e.g. "Yadhu"), they are TWO DIFFERENT STUDENTS!
      // Never block students with different roll numbers!
      if (candNormRoll && normInputRoll && candNormRoll !== normInputRoll) {
        continue;
      }

      // 5. Name check:
      // "Yadhu", "Yadhu A", and "Yadhu A R" are distinct individuals.
      const exactNameMatches = candNormName === normInputName;
      const rollMatches = candNormRoll !== "" && normInputRoll !== "" && candNormRoll === normInputRoll;

      // Only treat as duplicate candidate attempt if:
      // - The SAME roll number is submitted in the same classroom (rollMatches), OR
      // - Both exact full name AND roll number match, OR
      // - Exact full name matches in the same classroom when roll numbers are empty
      const isDuplicateStudent = rollMatches || (exactNameMatches && (!candNormRoll || !normInputRoll));

      if (isDuplicateStudent) {
        for (const att of cand.attempts) {
          // If already submitted, reject with strict notice
          if (att.submittedAt) {
            return NextResponse.json(
              {
                error: isMalayalam
                  ? `വിദ്യാർത്ഥി (${cand.name}, റോൾ നമ്പർ: ${cand.rollNumber || "N/A"}) ഇതിനകം പരീക്ഷ എഴുതി സമർപ്പിച്ചതാണ്. ഒരു വിദ്യാർത്ഥിക്ക് ഒരു തവണ മാത്രമേ പരീക്ഷ എഴുതാൻ സാധിക്കൂ.`
                  : `Candidate (${cand.name}, Roll No: ${cand.rollNumber || "N/A"}) has already submitted this examination. Multiple attempts are strictly prohibited.`,
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
