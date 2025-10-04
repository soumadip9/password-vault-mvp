import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) return new NextResponse("Missing", { status: 400 });

  const db = await getDb();
  const users = db.collection("users");
  const exists = await users.findOne({ email });
  if (exists) return new NextResponse("Email already registered", { status: 400 });

  const passwordHash = await bcrypt.hash(password, 12);
  const encSalt = Buffer.from(crypto.randomUUID()).toString("base64");

  await users.insertOne({ email, passwordHash, encSalt });
  return NextResponse.json({ ok: true });
}
