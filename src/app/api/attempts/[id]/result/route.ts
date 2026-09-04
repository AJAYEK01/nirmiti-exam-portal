import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const attempt = await prisma.attempt.findUnique({
      where: { id: params.id },
      include: {
        exam: {
          include: {
            questions: {
              orderBy: { orderIndex: "asc" },
            },
          },
        },
        answers: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    const answerMap = new Map<string, any>();
    attempt.answers.forEach((ans) => answerMap.set(ans.questionId, ans));

    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;

    const questionsReview = attempt.exam.questions.map((q) => {
      const userAns = answerMap.get(q.id);
      const selected = userAns?.selectedOption ?? null;
      let parsedOptions: string[] = [];
      try {
        parsedOptions = JSON.parse(q.options);
      } catch {
        parsedOptions = [];
      }

      let status: "correct" | "incorrect" | "unattempted" = "unattempted";
      if (selected === null || selected === undefined) {
        unattemptedCount++;
        status = "unattempted";
      } else if (selected === q.correctAnswer) {
        correctCount++;
        status = "correct";
      } else {
        incorrectCount++;
        status = "incorrect";
      }

      return {
        id: q.id,
        orderIndex: q.orderIndex,
        text: q.text,
        options: parsedOptions,
        correctAnswer: q.correctAnswer,
        selectedOption: selected,
        explanation: q.explanation || "No explanation provided.",
        isCorrect: userAns?.isCorrect ?? (selected === q.correctAnswer),
        marksAwarded: userAns?.marksAwarded ?? 0,
        positiveMarks: q.marks ?? attempt.exam.positiveMarks,
        negativeMarks: q.negativeMarks ?? attempt.exam.negativeMarks,
        status,
      };
    });

    const timeTakenSeconds = attempt.submittedAt
      ? Math.floor(
          (new Date(attempt.submittedAt).getTime() -
            new Date(attempt.startedAt).getTime()) /
            1000
        )
      : 0;

    const attemptedCount = correctCount + incorrectCount;
    const accuracy =
      attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;
    const percentage =
      attempt.totalMarks > 0
        ? Math.max(0, Math.round((attempt.score / attempt.totalMarks) * 100))
        : 0;

    return NextResponse.json({
      attempt: {
        id: attempt.id,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
        score: attempt.score,
        totalMarks: attempt.totalMarks,
        isPassed: attempt.isPassed,
        cheatWarnings: attempt.cheatWarnings,
        timeTakenSeconds,
        percentage,
        accuracy,
        correctCount,
        incorrectCount,
        unattemptedCount,
        totalQuestions: attempt.exam.questions.length,
      },
      candidate: attempt.user,
      exam: {
        id: attempt.exam.id,
        title: attempt.exam.title,
        description: attempt.exam.description,
        passingMarks: attempt.exam.passingMarks,
        positiveMarks: attempt.exam.positiveMarks,
        negativeMarks: attempt.exam.negativeMarks,
      },
      questionsReview,
    });
  } catch (error) {
    console.error("Fetch exam result error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve results" },
      { status: 500 }
    );
  }
}
