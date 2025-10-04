import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getIronSession } from "iron-session/edge";
import { sessionOptions } from "@/lib/session";
import { ObjectId } from "mongodb";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const res = new NextResponse();
  const session = await getIronSession(req, res, sessionOptions);
  // @ts-ignore
  const user = session.user;
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const db = await getDb();
  const u = await db.collection("users").findOne({ _id: new ObjectId(user.userId) });
  return NextResponse.json({ encSalt: u?.encSalt });
}
