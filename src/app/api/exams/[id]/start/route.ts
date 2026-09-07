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

      // Balanced 4-subject distribution (Grades 8-10 Syllabus):
      // - Mathematics & Quantitative Aptitude: Q1 - Q240 (6 questions)
      // - Logic & Analytical Reasoning: Q241 - Q360 (3 questions)
      // - General Science (Physics/Chem/Bio): Q361 - Q680 (8 questions)
      // - Computer Science & Digital Literacy: Q681 - Q1000 (8 questions)
      const mathPool = allQuestions.filter((q) => q.orderIndex >= 1 && q.orderIndex <= 240);
      const logicPool = allQuestions.filter((q) => q.orderIndex >= 241 && q.orderIndex <= 360);
      const sciencePool = allQuestions.filter((q) => q.orderIndex >= 361 && q.orderIndex <= 680);
      const csPool = allQuestions.filter((q) => q.orderIndex >= 681 && q.orderIndex <= 1000);

      // Select exact quotas per student: 6 + 3 + 8 + 8 = 25 questions
      const selectedMath = shuffleArray(mathPool).slice(0, 6);
      const selectedLogic = shuffleArray(logicPool).slice(0, 3);
      const selectedScience = shuffleArray(sciencePool).slice(0, 8);
      const selectedCS = shuffleArray(csPool).slice(0, 8);

      // Combine and shuffle the overall question order so students experience a balanced, mixed assessment
      const selectedPool = shuffleArray([
        ...selectedScience,
        ...selectedCS,
        ...selectedMath,
        ...selectedLogic,
      ]);
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

      // Malayalam translation lookup: by q.id or orderIndex fallback
      const mlData = (questionsMl as Record<string, { text: string; options: string[] }>)[q.id]
        || (questionsMl as Record<string, { text: string; options: string[] }>)[String(q.orderIndex)];
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
