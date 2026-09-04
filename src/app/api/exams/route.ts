import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();

    const exams = await prisma.exam.findMany({
      where: session?.role === "ADMIN" ? {} : { isPublished: true },
      include: {
        _count: {
          select: {
            questions: true,
            attempts: true,
          },
        },
        attempts: session
          ? {
              where: { userId: session.id },
              orderBy: { startedAt: "desc" },
              take: 1,
              select: {
                id: true,
                score: true,
                totalMarks: true,
                isPassed: true,
                submittedAt: true,
              },
            }
          : false,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ exams });
  } catch (error) {
    console.error("Fetch exams error:", error);
    return NextResponse.json(
      { error: "Failed to fetch exams" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      description,
      category,
      durationMinutes,
      totalMarks,
      passingMarks,
      positiveMarks,
      negativeMarks,
      shuffleQuestions,
      questions,
    } = body;

    if (!title || !durationMinutes) {
      return NextResponse.json(
        { error: "Title and duration are required" },
        { status: 400 }
      );
    }

    const exam = await prisma.exam.create({
      data: {
        title: title.trim(),
        description: description?.trim() || "",
        category: category?.trim() || "General",
        durationMinutes: Number(durationMinutes) || 30,
        totalMarks: Number(totalMarks) || (questions?.length ? questions.length * (Number(positiveMarks) || 2) : 100),
        passingMarks: Number(passingMarks) || 40,
        positiveMarks: Number(positiveMarks) || 2.0,
        negativeMarks: Number(negativeMarks) || 0.5,
        shuffleQuestions: Boolean(shuffleQuestions),
        isPublished: true,
        questions: questions && questions.length > 0
          ? {
              create: questions.map((q: any, idx: number) => ({
                orderIndex: idx + 1,
                text: q.text,
                options: typeof q.options === "string" ? q.options : JSON.stringify(q.options),
                correctAnswer: Number(q.correctAnswer),
                explanation: q.explanation || "",
                marks: q.marks ? Number(q.marks) : undefined,
                negativeMarks: q.negativeMarks ? Number(q.negativeMarks) : undefined,
              })),
            }
          : undefined,
      },
      include: {
        questions: true,
      },
    });

    return NextResponse.json({ success: true, exam });
  } catch (error) {
    console.error("Create exam error:", error);
    return NextResponse.json(
      { error: "Failed to create exam" },
      { status: 500 }
    );
  }
}
