import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { questionId, selectedOption, isMarkedReview, cheatWarnings } =
      await req.json();

    const attempt = await prisma.attempt.findUnique({
      where: { id: params.id },
    });

    if (!attempt || attempt.submittedAt) {
      return NextResponse.json(
        { error: "Attempt is either closed or does not exist" },
        { status: 400 }
      );
    }

    if (cheatWarnings !== undefined) {
      await prisma.attempt.update({
        where: { id: params.id },
        data: { cheatWarnings: Number(cheatWarnings) },
      });
    }

    if (questionId) {
      await prisma.answerRecord.upsert({
        where: {
          attemptId_questionId: {
            attemptId: params.id,
            questionId: questionId,
          },
        },
        create: {
          attemptId: params.id,
          questionId: questionId,
          selectedOption:
            selectedOption !== null && selectedOption !== undefined
              ? Number(selectedOption)
              : null,
          isMarkedReview: Boolean(isMarkedReview),
        },
        update: {
          selectedOption:
            selectedOption !== null && selectedOption !== undefined
              ? Number(selectedOption)
              : null,
          isMarkedReview: Boolean(isMarkedReview),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Autosave answer error:", error);
    return NextResponse.json(
      { error: "Failed to autosave response" },
      { status: 500 }
    );
  }
}
