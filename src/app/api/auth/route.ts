import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Lấy danh sách emails từ environment variables
    const allowedEmails = process.env.ALLOWED_EMAILS?.split(",") || [];

    // Trả về danh sách emails (chỉ server-side, client không thấy được .env)
    return NextResponse.json({
      allowedEmails,
      totalAllowed: allowedEmails.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch allowed emails" },
      { status: 500 }
    );
  }
}
