import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Quick login is permanently disabled for security. Please sign in using your official credentials.",
    },
    { status: 403 }
  );
}

export async function GET() {
  return NextResponse.json(
    {
      error: "Method not allowed.",
    },
    { status: 405 }
  );
}
