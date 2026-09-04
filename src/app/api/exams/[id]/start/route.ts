import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    let session = await getSession();

    // If no session, create a guest/student user automatically to allow seamless exam taking
    if (!session) {
      let guestUser = await prisma.user.findUnique({
        where: { email: "candidate@exam.com" },
      });

      if (!guestUser) {
        guestUser = await prisma.user.create({
          data: {
            name: "Candidate",
            email: "candidate@exam.com",
            password: "guest-password-hash",
            role: "STUDENT",
          },
        });
      }

      session = {
        id: guestUser.id,
        name: guestUser.name,
        email: guestUser.email,
        role: "STUDENT",
      };
    }

    const exam = await prisma.exam.findUnique({
      where: { id: params.id },
      include: {
        questions: {
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    // Check for an existing unsubmitted attempt
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

    if (!attempt) {
      attempt = await prisma.attempt.create({
        data: {
          examId: exam.id,
          userId: session.id,
          startedAt: new Date(),
          totalMarks: exam.totalMarks,
        },
        include: {
          answers: true,
        },
      });
    }

    // Calculate time elapsed & remaining seconds
    const elapsedSeconds = Math.floor(
      (Date.now() - new Date(attempt.startedAt).getTime()) / 1000
    );
    const totalAllowedSeconds = exam.durationMinutes * 60;
    const remainingSeconds = Math.max(0, totalAllowedSeconds - elapsedSeconds);

    // If time has completely expired, mark attempt submitted if not already
    if (remainingSeconds <= 0 && !attempt.submittedAt) {
      // Auto-submit
      return NextResponse.json({
        expired: true,
        attemptId: attempt.id,
        message: "Exam duration has expired for this attempt.",
      });
    }

    // Prepare questions (STRIP CORRECT ANSWERS & EXPLANATIONS)
    let questions = exam.questions.map((q) => {
      let parsedOptions: string[] = [];
      try {
        parsedOptions = JSON.parse(q.options);
      } catch {
        parsedOptions = [];
      }

      return {
        id: q.id,
        orderIndex: q.orderIndex,
        text: q.text,
        options: parsedOptions,
        marks: q.marks ?? exam.positiveMarks,
        negativeMarks: q.negativeMarks ?? exam.negativeMarks,
      };
    });

    // If shuffle is requested
    if (exam.shuffleQuestions) {
      questions = questions.sort(() => 0.5 - Math.random());
    }

    return NextResponse.json({
      attemptId: attempt.id,
      remainingSeconds,
      exam: {
        id: exam.id,
        title: exam.title,
        description: exam.description,
        durationMinutes: exam.durationMinutes,
        totalMarks: exam.totalMarks,
        passingMarks: exam.passingMarks,
        positiveMarks: exam.positiveMarks,
        negativeMarks: exam.negativeMarks,
      },
      questions,
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
