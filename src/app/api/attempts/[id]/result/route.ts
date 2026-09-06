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
        exam: true,
        answers: true,
        user: {
          select: {
            name: true,
            email: true,
            schoolName: true,
            className: true,
            medium: true,
            parentMobile: true,
          },
        },
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    // Determine the specific questions taken for this attempt (25 questions)
    let questionIds: string[] = [];
    if (attempt.selectedQuestionIds) {
      try {
        questionIds = JSON.parse(attempt.selectedQuestionIds);
      } catch {}
    }

    let questions = [];
    if (questionIds.length > 0) {
      const qRecords = await prisma.question.findMany({
        where: { id: { in: questionIds } },
      });
      const qMap = new Map(qRecords.map((q) => [q.id, q]));
      questions = questionIds.map((id) => qMap.get(id)).filter(Boolean) as typeof qRecords;
    } else {
      questions = await prisma.question.findMany({
        where: { examId: attempt.examId },
        take: 25,
        orderBy: { orderIndex: "asc" },
      });
    }

    // Parse optionsOrderMap if present
    let optionsOrderMap: Record<string, number[]> = {};
    if (attempt.optionsOrderMap) {
      try {
        optionsOrderMap = JSON.parse(attempt.optionsOrderMap);
      } catch {}
    }

    const answerMap = new Map<string, any>();
    attempt.answers.forEach((ans) => answerMap.set(ans.questionId, ans));

    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;

    const questionsReview = questions.map((q, idx) => {
      const userAns = answerMap.get(q.id);
      const chosenShuffledIndex = userAns?.selectedOption ?? null;
      let rawOptions: string[] = [];
      try {
        rawOptions = JSON.parse(q.options);
      } catch {
        rawOptions = [];
      }

      // Reconstruct shuffled options as shown to the candidate
      const orderPermutation = optionsOrderMap[q.id] || [0, 1, 2, 3];
      const displayedOptions = orderPermutation.map((origIdx) => rawOptions[origIdx] ?? "");

      // Identify which displayed option index was the correct one
      const correctShuffledIndex = orderPermutation.indexOf(q.correctAnswer);

      let status: "correct" | "incorrect" | "unattempted" = "unattempted";
      if (chosenShuffledIndex === null || chosenShuffledIndex === undefined) {
        unattemptedCount++;
        status = "unattempted";
      } else if (chosenShuffledIndex === correctShuffledIndex) {
        correctCount++;
        status = "correct";
      } else {
        incorrectCount++;
        status = "incorrect";
      }

      return {
        id: q.id,
        orderIndex: idx + 1,
        text: q.text,
        options: displayedOptions,
        correctAnswer: correctShuffledIndex >= 0 ? correctShuffledIndex : q.correctAnswer,
        selectedOption: chosenShuffledIndex,
        explanation: q.explanation || "Official answer key verified.",
        isCorrect: status === "correct",
        marksAwarded: status === "correct" ? 1.0 : 0.0,
        positiveMarks: 1.0,
        negativeMarks: 0.0,
        status,
      };
    });

    const timeTakenSeconds =
      attempt.timeTakenSeconds ||
      (attempt.submittedAt
        ? Math.floor(
            (new Date(attempt.submittedAt).getTime() -
              new Date(attempt.startedAt).getTime()) /
              1000
          )
        : 0);

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
        totalMarks: attempt.totalMarks || 25,
        isPassed: attempt.isPassed,
        cheatWarnings: attempt.cheatWarnings,
        timeTakenSeconds,
        percentage,
        accuracy,
        correctCount,
        incorrectCount,
        unattemptedCount,
        totalQuestions: questions.length,
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
