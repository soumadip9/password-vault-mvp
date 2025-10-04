import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session/edge";
import { sessionOptions } from "@/lib/session";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const res = new NextResponse(null, { status: 302, headers: { Location: "/" } });
  const session = await getIronSession(req, res, sessionOptions);
  await session.destroy();
  return res;
}
