import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { evaluateExam } from "@/lib/exam-engine";

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
        exam: {
          include: {
            questions: true,
          },
        },
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
        score: attempt.score,
        isPassed: attempt.isPassed,
      });
    }

    // Merge answers from body if provided, otherwise use saved in db
    const finalAnswersMap = new Map<string, { selectedOption: number | null; isMarkedReview: boolean }>();
    
    // First from DB
    attempt.answers.forEach((a) => {
      finalAnswersMap.set(a.questionId, {
        selectedOption: a.selectedOption,
        isMarkedReview: a.isMarkedReview,
      });
    });

    // Override or add from request body if any
    if (Array.isArray(answers)) {
      answers.forEach((a: any) => {
        finalAnswersMap.set(a.questionId, {
          selectedOption: a.selectedOption !== undefined ? a.selectedOption : null,
          isMarkedReview: Boolean(a.isMarkedReview),
        });
      });
    }

    const candidateAnswers = Array.from(finalAnswersMap.entries()).map(
      ([questionId, val]) => ({
        questionId,
        selectedOption: val.selectedOption,
        isMarkedReview: val.isMarkedReview,
      })
    );

    const questionsForGrading = attempt.exam.questions.map((q) => ({
      id: q.id,
      correctAnswer: q.correctAnswer,
      marks: q.marks,
      negativeMarks: q.negativeMarks,
    }));

    const result = evaluateExam(questionsForGrading, candidateAnswers, {
      defaultPositiveMarks: attempt.exam.positiveMarks,
      defaultNegativeMarks: attempt.exam.negativeMarks,
      passingMarks: attempt.exam.passingMarks,
      totalMarks: attempt.exam.totalMarks,
    });

    // Update answer records in database
    for (const graded of result.gradedAnswers) {
      await prisma.answerRecord.upsert({
        where: {
          attemptId_questionId: {
            attemptId: attempt.id,
            questionId: graded.questionId,
          },
        },
        create: {
          attemptId: attempt.id,
          questionId: graded.questionId,
          selectedOption: graded.selectedOption,
          isMarkedReview: graded.isMarkedReview,
          isCorrect: graded.isCorrect,
          marksAwarded: graded.marksAwarded,
        },
        update: {
          selectedOption: graded.selectedOption,
          isMarkedReview: graded.isMarkedReview,
          isCorrect: graded.isCorrect,
          marksAwarded: graded.marksAwarded,
        },
      });
    }

    // Finalize attempt
    const updatedAttempt = await prisma.attempt.update({
      where: { id: attempt.id },
      data: {
        score: result.score,
        totalMarks: result.totalMarks,
        isPassed: result.isPassed,
        submittedAt: new Date(),
        cheatWarnings:
          cheatWarnings !== undefined
            ? Number(cheatWarnings)
            : attempt.cheatWarnings,
      },
    });

    return NextResponse.json({
      success: true,
      attemptId: updatedAttempt.id,
      score: updatedAttempt.score,
      totalMarks: updatedAttempt.totalMarks,
      isPassed: updatedAttempt.isPassed,
      correctCount: result.correctCount,
      incorrectCount: result.incorrectCount,
      unattemptedCount: result.unattemptedCount,
      percentage: result.percentage,
    });
  } catch (error) {
    console.error("Submit exam error:", error);
    return NextResponse.json(
      { error: "Failed to process exam submission" },
      { status: 500 }
    );
  }
}
