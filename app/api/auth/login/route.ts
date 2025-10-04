export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import bcrypt from "bcryptjs";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const db = await getDb();

    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const res = new NextResponse(JSON.stringify({ ok: true }), { status: 200 });

    // ✅ Create a *fresh session* every time someone logs in
    const session = await getIronSession(req, res, sessionOptions);
    await session.destroy(); // clear old session

    // @ts-ignore
    session.user = { email: user.email, id: String(user._id) };
    await session.save();

    console.log("✅ Logged in as:", user.email);
    return res;
  } catch (err) {
    console.error("❌ Login Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
