import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getEffectiveExamWindow, setPortalOverride } from "@/lib/portal-setting";
import { PortalOverride } from "@/lib/exam-window";

// GET current effective portal status
export async function GET() {
  try {
    const windowInfo = await getEffectiveExamWindow();
    return NextResponse.json({ success: true, windowInfo });
  } catch (error) {
    console.error("Fetch portal status error:", error);
    return NextResponse.json(
      { error: "Failed to fetch portal status" },
      { status: 500 }
    );
  }
}

// POST update portal override status (ADMIN ONLY)
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required." },
        { status: 403 }
      );
    }

    const { status } = await req.json();

    if (
      status !== "SCHEDULED" &&
      status !== "FORCE_OPEN" &&
      status !== "FORCE_CLOSED"
    ) {
      return NextResponse.json(
        { error: "Invalid status. Must be SCHEDULED, FORCE_OPEN, or FORCE_CLOSED." },
        { status: 400 }
      );
    }

    await setPortalOverride(status as PortalOverride);
    const updatedWindow = await getEffectiveExamWindow();

    return NextResponse.json({
      success: true,
      message: `Exam portal status set to ${status}`,
      windowInfo: updatedWindow,
    });
  } catch (error) {
    console.error("Update portal status error:", error);
    return NextResponse.json(
      { error: "Failed to update portal status" },
      { status: 500 }
    );
  }
}
