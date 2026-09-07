import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getEffectiveExamWindow } from "@/lib/portal-setting";
import questionsMl from "@/lib/questions-ml.json";

// Fisher-Yates shuffle array helper
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    let session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Candidate session not found. Please register first." },
        { status: 401 }
      );
    }

    // Server-side enforcement of exam schedule (Sept 9, 2026, 10:00 AM - 10:00 PM IST)
    // Authorized Admins can bypass for testing
    if (session.role !== "ADMIN") {
      const windowInfo = await getEffectiveExamWindow();
      if (!windowInfo.isOpen) {
        return NextResponse.json(
          {
            error:
              windowInfo.status === "UPCOMING"
                ? `The examination portal is scheduled to open on ${windowInfo.startDateStr}. Please return at 10:00 AM IST.`
                : `The examination portal closed on ${windowInfo.endDateStr}. Submissions are no longer accepted.`,
            windowStatus: windowInfo.status,
            isOpen: false,
          },
          { status: 403 }
        );
      }
    }

    const exam = await prisma.exam.findUnique({
      where: { id: params.id },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    // Check if the student has already completed and submitted an attempt for this exam
    const completedAttempt = await prisma.attempt.findFirst({
      where: {
        examId: exam.id,
        userId: session.id,
        submittedAt: { not: null },
      },
    });

    if (completedAttempt) {
      return NextResponse.json(
        {
          error: "You have already completed and submitted this examination. Multiple attempts are strictly prohibited.",
          alreadySubmitted: true,
          attemptId: completedAttempt.id,
        },
        { status: 403 }
      );
    }

    // Check for existing active attempt
    let attempt = await prisma.attempt.findFirst({
      where: {
        examId: exam.id,
        userId: session.id,
        submittedAt: null,
      },
      include: {
        answers: true,
      },
      orderBy: { startedAt: "desc" },
    });

    let selectedQuestionIds: string[] = [];
    let optionsOrderMap: Record<string, number[]> = {};

    if (attempt && attempt.selectedQuestionIds && attempt.optionsOrderMap) {
      try {
        selectedQuestionIds = JSON.parse(attempt.selectedQuestionIds);
        optionsOrderMap = JSON.parse(attempt.optionsOrderMap);
      } catch (e) {
        console.error("Failed to parse attempt question IDs", e);
      }
    }

    // If new attempt, pick 25 random questions and shuffle options
    if (!attempt || selectedQuestionIds.length === 0) {
      const allQuestions = await prisma.question.findMany({
        where: { examId: exam.id },
        select: { id: true, text: true, orderIndex: true },
      });

      if (allQuestions.length === 0) {
        return NextResponse.json(
          { error: "No questions available in this exam." },
          { status: 400 }
        );
      }

      // Identify challenging questions vs standard (easy/medium) questions
      // Challenging: calculations, multi-step circuits, Ohm's law formulas, IC pinouts, advanced electronics
      const isChallenging = (q: { text: string; orderIndex: number }) => {
        const txt = q.text.toLowerCase();
        return (
          txt.includes("calculate") ||
          txt.includes("ohm's law") ||
          txt.includes("ohms law") ||
          txt.includes("formula") ||
          txt.includes("h-bridge") ||
          txt.includes("esp32") ||
          txt.includes("duty cycle") ||
          txt.includes("impedance") ||
          txt.includes("resistors in series") ||
          txt.includes("resistors in parallel") ||
          txt.includes("truth table") ||
          txt.includes("microcontroller") ||
          txt.includes("atmega") ||
          (q.orderIndex >= 20 && q.orderIndex <= 25)
        );
      };

      const challengingPool = allQuestions.filter(isChallenging);
      const standardPool = allQuestions.filter((q) => !isChallenging(q));

      // Pick exactly 2 or 3 challenging questions (randomized between 2 and 3)
      const targetChallengingCount = Math.min(
        challengingPool.length,
        Math.random() < 0.5 ? 2 : 3
      );
      const targetStandardCount = 25 - targetChallengingCount;

      const shuffledChallenging = shuffleArray(challengingPool).slice(0, targetChallengingCount);
      const shuffledStandard = shuffleArray(standardPool).slice(0, targetStandardCount);

      // Combine and shuffle the overall question order so challenging ones appear naturally
      const selectedPool = shuffleArray([...shuffledChallenging, ...shuffledStandard]);
      selectedQuestionIds = selectedPool.map((q) => q.id);

      // Generate option shuffle mapping for each question: [0, 1, 2, 3] -> randomized order
      optionsOrderMap = {};
      selectedQuestionIds.forEach((qId) => {
        optionsOrderMap[qId] = shuffleArray([0, 1, 2, 3]);
      });

      attempt = await prisma.attempt.create({
        data: {
          examId: exam.id,
          userId: session.id,
          startedAt: new Date(),
          totalMarks: 25,
          selectedQuestionIds: JSON.stringify(selectedQuestionIds),
          optionsOrderMap: JSON.stringify(optionsOrderMap),
        },
        include: {
          answers: true,
        },
      });
    }

    // Calculate time elapsed & remaining seconds (strictly 8 minutes = 480 seconds)
    const elapsedSeconds = Math.floor(
      (Date.now() - new Date(attempt.startedAt).getTime()) / 1000
    );
    const totalAllowedSeconds = (exam.durationMinutes || 8) * 60;
    const remainingSeconds = Math.max(0, totalAllowedSeconds - elapsedSeconds);

    if (remainingSeconds <= 0 && !attempt.submittedAt) {
      return NextResponse.json({
        expired: true,
        attemptId: attempt.id,
        message: "Exam duration (8 minutes) has expired for this attempt.",
      });
    }

    // Fetch the 25 specific questions in order
    const questionRecords = await prisma.question.findMany({
      where: { id: { in: selectedQuestionIds } },
    });

    // Sort questions matching the selected order
    const qMap = new Map(questionRecords.map((q) => [q.id, q]));
    const orderedQuestions = selectedQuestionIds
      .map((id) => qMap.get(id))
      .filter((q): q is typeof questionRecords[0] => Boolean(q));

    // Present questions with shuffled options, STRIPPING correct answers & explanations
    const clientQuestions = orderedQuestions.map((q, idx) => {
      let rawOptions: string[] = [];
      try {
        rawOptions = JSON.parse(q.options);
      } catch {
        rawOptions = [];
      }

      const orderPermutation = optionsOrderMap[q.id] || [0, 1, 2, 3];
      const shuffledOptions = orderPermutation.map((origIdx) => rawOptions[origIdx] ?? "");

      // Malayalam translation lookup
      const mlData = (questionsMl as Record<string, { text: string; options: string[] }>)[q.id];
      const shuffledOptionsMl = mlData && Array.isArray(mlData.options)
        ? orderPermutation.map((origIdx) => mlData.options[origIdx] ?? rawOptions[origIdx] ?? "")
        : undefined;

      return {
        id: q.id,
        orderIndex: idx + 1,
        text: q.text,
        textMl: mlData?.text || undefined,
        options: shuffledOptions,
        optionsMl: shuffledOptionsMl,
        marks: 1.0,
        negativeMarks: 0.0,
      };
    });

    const dbUser = await prisma.user.findUnique({
      where: { id: session.id },
      select: { name: true, medium: true, schoolName: true },
    });

    return NextResponse.json({
      attemptId: attempt.id,
      remainingSeconds,
      candidate: {
        name: dbUser?.name || session.name,
        medium: dbUser?.medium || "ENGLISH",
        schoolName: dbUser?.schoolName,
      },
      exam: {
        id: exam.id,
        title: exam.title,
        description: exam.description,
        durationMinutes: exam.durationMinutes || 8,
        totalMarks: 25,
        passingMarks: exam.passingMarks || 10,
        positiveMarks: 1.0,
        negativeMarks: 0.0,
      },
      questions: clientQuestions,
      savedAnswers: attempt.answers.map((a) => ({
        questionId: a.questionId,
        selectedOption: a.selectedOption,
        isMarkedReview: a.isMarkedReview,
      })),
      cheatWarnings: attempt.cheatWarnings,
    });
  } catch (error) {
    console.error("Start exam attempt error:", error);
    return NextResponse.json(
      { error: "Failed to initiate exam session" },
      { status: 500 }
    );
  }
}
