import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";

export const runtime = "nodejs";

// ✅ Logout Route
export async function POST(req: NextRequest) {
  const res = new NextResponse(JSON.stringify({ success: true }), { status: 200 });
  const session = await getIronSession(req, res, sessionOptions);

  await session.destroy(); // Clear session
  return res;
}

