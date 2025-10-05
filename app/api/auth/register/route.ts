import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import bcrypt from "bcryptjs";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const db = await getDb();

    // ✅ Check if user exists
    const existing = await db.collection("users").findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // ✅ Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // ✅ Create user
    const result = await db.collection("users").insertOne({
      email,
      passwordHash,
      createdAt: new Date().toISOString(),
    });

    // ✅ Create session and log the user in immediately
    const res = new NextResponse(JSON.stringify({ ok: true }), { status: 200 });
    const session = await getIronSession(req, res, sessionOptions);

    // @ts-ignore
    session.user = { userId: String(result.insertedId), email };
    await session.save();

    console.log("✅ New user registered & logged in:", email);

    return res;
  } catch (error) {
    console.error("❌ Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
