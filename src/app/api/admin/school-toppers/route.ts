import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const attempts = await prisma.attempt.findMany({
      where: { submittedAt: { not: null } },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            schoolName: true,
            className: true,
            rollNumber: true,
            medium: true,
            parentMobile: true,
          },
        },
        exam: {
          select: {
            title: true,
            totalMarks: true,
          },
        },
      },
      orderBy: [
        { score: "desc" },
        { timeTakenSeconds: "asc" },
        { submittedAt: "asc" },
      ],
    });

    // Group by School
    const schoolGroups = new Map<string, any[]>();

    attempts.forEach((att) => {
      const school = att.user.schoolName?.trim() || "Unspecified School";
      if (!schoolGroups.has(school)) {
        schoolGroups.set(school, []);
      }

      schoolGroups.get(school)!.push({
        attemptId: att.id,
        studentId: att.user.id,
        name: att.user.name,
        schoolName: school,
        className: att.user.className || "N/A",
        rollNumber: att.user.rollNumber || "N/A",
        medium: att.user.medium || "ENGLISH",
        parentMobile: att.user.parentMobile || "N/A",
        score: att.score,
        totalMarks: att.totalMarks || 25,
        timeTakenSeconds: att.timeTakenSeconds || 0,
        cheatWarnings: att.cheatWarnings,
        submittedAt: att.submittedAt,
      });
    });

    const schoolsData: any[] = [];
    const allFinalists: any[] = [];

    schoolGroups.forEach((candidates, schoolName) => {
      // Sort within school: 1. Score DESC, 2. Time Taken ASC, 3. SubmittedAt ASC
      candidates.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (a.timeTakenSeconds !== b.timeTakenSeconds) {
          return a.timeTakenSeconds - b.timeTakenSeconds;
        }
        return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
      });

      // Tag ranks and select top 2
      const rankedCandidates = candidates.map((cand, index) => {
        const rank = index + 1;
        const isFinalist = rank <= 2;
        const item = {
          ...cand,
          rankInSchool: rank,
          isFinalist,
        };

        if (isFinalist) {
          allFinalists.push(item);
        }
        return item;
      });

      schoolsData.push({
        schoolName,
        totalCandidates: candidates.length,
        topTwo: rankedCandidates.slice(0, 2),
        allCandidates: rankedCandidates,
      });
    });

    // Sort schools alphabetically
    schoolsData.sort((a, b) => a.schoolName.localeCompare(b.schoolName));

    return NextResponse.json({
      totalSchools: schoolsData.length,
      totalSubmissions: attempts.length,
      schools: schoolsData,
      allFinalists,
    });
  } catch (error) {
    console.error("Fetch school toppers error:", error);
    return NextResponse.json(
      { error: "Failed to generate school toppers report" },
      { status: 500 }
    );
  }
}
