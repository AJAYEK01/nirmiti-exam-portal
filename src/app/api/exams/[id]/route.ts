import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    const exam = await prisma.exam.findUnique({
      where: { id: params.id },
      include: {
        questions: {
          orderBy: { orderIndex: "asc" },
        },
        _count: {
          select: { attempts: true },
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    // If user is not admin, hide correct answers & explanations from general exam preview
    if (session?.role !== "ADMIN") {
      const sanitizedQuestions = exam.questions.map((q) => ({
        id: q.id,
        orderIndex: q.orderIndex,
        text: q.text,
        options: JSON.parse(q.options),
        marks: q.marks ?? exam.positiveMarks,
        negativeMarks: q.negativeMarks ?? exam.negativeMarks,
      }));

      return NextResponse.json({
        exam: {
          ...exam,
          questions: sanitizedQuestions,
        },
      });
    }

    // Admin receives full details including parsed options
    const adminQuestions = exam.questions.map((q) => ({
      ...q,
      options: JSON.parse(q.options),
    }));

    return NextResponse.json({
      exam: {
        ...exam,
        questions: adminQuestions,
      },
    });
  } catch (error) {
    console.error("Fetch exam by id error:", error);
    return NextResponse.json({ error: "Failed to fetch exam" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.exam.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete exam error:", error);
    return NextResponse.json({ error: "Failed to delete exam" }, { status: 500 });
  }
}
