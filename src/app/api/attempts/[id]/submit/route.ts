import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json().catch(() => ({}));
    const { answers, cheatWarnings } = body;

    const attempt = await prisma.attempt.findUnique({
      where: { id: params.id },
      include: {
        exam: true,
        answers: true,
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    if (attempt.submittedAt) {
      return NextResponse.json({
        success: true,
        alreadySubmitted: true,
        attemptId: attempt.id,
        message: "Exam has already been submitted.",
      });
    }

    // Parse optionsOrderMap if present: questionId -> [shuffled original indexes]
    let optionsOrderMap: Record<string, number[]> = {};
    if (attempt.optionsOrderMap) {
      try {
        optionsOrderMap = JSON.parse(attempt.optionsOrderMap);
      } catch (e) {
        console.error("Failed to parse optionsOrderMap", e);
      }
    }

    // Merge answers from body with saved database answers
    const answersMap = new Map<string, { selectedOption: number | null; isMarkedReview: boolean }>();
    attempt.answers.forEach((a) => {
      answersMap.set(a.questionId, {
        selectedOption: a.selectedOption,
        isMarkedReview: a.isMarkedReview,
      });
    });

    if (Array.isArray(answers)) {
      answers.forEach((a: any) => {
        answersMap.set(a.questionId, {
          selectedOption: a.selectedOption !== undefined ? a.selectedOption : null,
          isMarkedReview: Boolean(a.isMarkedReview),
        });
      });
    }

    // Load question definitions
    let questionIds: string[] = [];
    if (attempt.selectedQuestionIds) {
      try {
        questionIds = JSON.parse(attempt.selectedQuestionIds);
      } catch {}
    }

    if (questionIds.length === 0) {
      questionIds = Array.from(answersMap.keys());
    }

    const questionRecords = await prisma.question.findMany({
      where: { id: { in: questionIds } },
    });

    let score = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;

    const gradedRecords: any[] = [];

    for (const q of questionRecords) {
      const ans = answersMap.get(q.id);
      const chosenShuffledIndex = ans?.selectedOption;
      const isMarkedReview = Boolean(ans?.isMarkedReview);

      let isCorrect = false;
      let marksAwarded = 0;

      if (chosenShuffledIndex === null || chosenShuffledIndex === undefined) {
        unattemptedCount++;
      } else {
        // Map chosen shuffled index to original option index
        const orderPermutation = optionsOrderMap[q.id];
        const originalIndex = orderPermutation ? orderPermutation[chosenShuffledIndex] : chosenShuffledIndex;

        if (originalIndex === q.correctAnswer) {
          isCorrect = true;
          correctCount++;
          marksAwarded = 1.0;
          score += 1.0;
        } else {
          incorrectCount++;
          marksAwarded = 0.0;
        }
      }

      gradedRecords.push({
        attemptId: attempt.id,
        questionId: q.id,
        selectedOption: chosenShuffledIndex,
        isMarkedReview,
        isCorrect,
        marksAwarded,
      });
    }

    // High-Concurrency Optimization: Replace 25 separate network roundtrips with single batch write
    await prisma.$transaction([
      prisma.answerRecord.deleteMany({
        where: { attemptId: attempt.id },
      }),
      prisma.answerRecord.createMany({
        data: gradedRecords,
      }),
    ]);

    const now = new Date();
    const timeTakenSeconds = Math.max(
      1,
      Math.min(
        (attempt.exam.durationMinutes || 8) * 60,
        Math.floor((now.getTime() - new Date(attempt.startedAt).getTime()) / 1000)
      )
    );

    const isPassed = score >= (attempt.exam.passingMarks || 10);

    const updatedAttempt = await prisma.attempt.update({
      where: { id: attempt.id },
      data: {
        score,
        totalMarks: 25,
        isPassed,
        timeTakenSeconds,
        submittedAt: now,
        cheatWarnings:
          cheatWarnings !== undefined
            ? Number(cheatWarnings)
            : attempt.cheatWarnings,
      },
    });

    const response = NextResponse.json({
      success: true,
      attemptId: updatedAttempt.id,
      message: "Responses successfully submitted and locked for evaluation.",
    });

    // Clear candidate session token and any completion locks so another student can use the device
    response.cookies.delete("exam_token");
    response.cookies.delete("exam_completed");

    return response;
  } catch (error) {
    console.error("Submit exam error:", error);
    return NextResponse.json(
      { error: "Failed to process exam submission" },
      { status: 500 }
    );
  }
}
