import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import bcrypt from "bcryptjs";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";



export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const db = await getDb();
  const user = await db.collection("users").findOne({ email });
  if (!user) return new NextResponse("Invalid credentials", { status: 401 });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return new NextResponse("Invalid credentials", { status: 401 });

  const res = new NextResponse(JSON.stringify({ ok: true }), { status: 200 });
  const session = await getIronSession(req, res, sessionOptions);
  // @ts-ignore
  session.user = { userId: String(user._id), email };
  await session.save();
  return res;
}
