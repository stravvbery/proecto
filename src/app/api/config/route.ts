import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    socketUrl: process.env.SOCKET_PUBLIC_URL || null,
  });
}
