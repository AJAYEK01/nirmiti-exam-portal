import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const [totalExams, totalAttempts, totalStudents, attempts] =
      await Promise.all([
        prisma.exam.count(),
        prisma.attempt.count({ where: { submittedAt: { not: null } } }),
        prisma.user.count({ where: { role: "STUDENT" } }),
        prisma.attempt.findMany({
          where: { submittedAt: { not: null } },
          include: {
            user: { select: { name: true, email: true } },
            exam: { select: { title: true, totalMarks: true } },
          },
          orderBy: { submittedAt: "desc" },
          take: 20,
        }),
      ]);

    const passedAttempts = attempts.filter((a) => a.isPassed).length;
    const passRate =
      attempts.length > 0
        ? Math.round((passedAttempts / attempts.length) * 100)
        : 0;

    const totalScoreSum = attempts.reduce((acc, curr) => acc + curr.score, 0);
    const avgScore =
      attempts.length > 0
        ? Math.round((totalScoreSum / attempts.length) * 10) / 10
        : 0;

    return NextResponse.json({
      stats: {
        totalExams,
        totalAttempts,
        totalStudents,
        passRate,
        avgScore,
      },
      recentSubmissions: attempts.map((a) => ({
        id: a.id,
        candidateName: a.user.name,
        candidateEmail: a.user.email,
        examTitle: a.exam.title,
        score: a.score,
        totalMarks: a.totalMarks,
        isPassed: a.isPassed,
        cheatWarnings: a.cheatWarnings,
        submittedAt: a.submittedAt,
      })),
    });
  } catch (error) {
    console.error("Fetch admin stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
