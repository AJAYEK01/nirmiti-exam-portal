import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession, verifyPassword } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { attemptId: string } }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 403 });
    }

    const { attemptId } = params;
    if (!attemptId) {
      return NextResponse.json({ error: "Attempt ID is required." }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: "Examiner password is required to verify deletion." },
        { status: 400 }
      );
    }

    // Verify examiner password
    const adminUser = await prisma.user.findUnique({
      where: { id: session.id },
    });

    if (!adminUser) {
      return NextResponse.json({ error: "Examiner account not found." }, { status: 404 });
    }

    const isMatch = await verifyPassword(password, adminUser.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Incorrect examiner password. Deletion cancelled for safety." },
        { status: 403 }
      );
    }

    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: { user: true },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Student entry not found." }, { status: 404 });
    }

    const studentUserId = attempt.userId;

    // Delete answer records first
    await prisma.answerRecord.deleteMany({
      where: { attemptId },
    });

    // Delete attempt
    await prisma.attempt.delete({
      where: { id: attemptId },
    });

    // If candidate user has no other attempts, clean up candidate user
    const remainingAttempts = await prisma.attempt.count({
      where: { userId: studentUserId },
    });

    if (remainingAttempts === 0 && attempt.user?.role === "STUDENT") {
      await prisma.user.delete({
        where: { id: studentUserId },
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: `Student entry for "${attempt.user?.name}" has been deleted.`,
    });
  } catch (error) {
    console.error("Delete student entry error:", error);
    return NextResponse.json(
      { error: "Failed to delete student entry." },
      { status: 500 }
    );
  }
}
