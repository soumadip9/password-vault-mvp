import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";

// ✅ Only allow Node.js runtime (not Edge)
export const runtime = "nodejs";

// 🔹 GET — Fetch all vault items for logged-in user
export async function GET(req: NextRequest) {
  try {
    const res = new NextResponse();
    const session = await getIronSession(req, res, sessionOptions);

    // @ts-ignore
    const user = session.user;
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const items = await db
      .collection("vault")
      .find({ userEmail: user.email })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ items });
  } catch (err) {
    console.error("❌ Error fetching vault items:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// 🔹 POST — Add new vault item
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = new NextResponse();
    const session = await getIronSession(req, res, sessionOptions);

    // @ts-ignore
    const user = session.user;
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();

    const newItem = {
      ...body,
      userEmail: user.email,
      createdAt: new Date().toISOString(),
    };

    await db.collection("vault").insertOne(newItem);
    return NextResponse.json({ success: true, item: newItem });
  } catch (err) {
    console.error("❌ Error creating vault item:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// 🔹 PUT — Update vault item
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const res = new NextResponse();
    const session = await getIronSession(req, res, sessionOptions);

    // @ts-ignore
    const user = session.user;
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();

    await db.collection("vault").updateOne(
      { _id: body._id, userEmail: user.email },
      { $set: { ...body } }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Error updating vault item:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// 🔹 DELETE — Delete vault item
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const res = new NextResponse();
    const session = await getIronSession(req, res, sessionOptions);

    // @ts-ignore
    const user = session.user;
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const { ObjectId } = require("mongodb");

    await db
      .collection("vault")
      .deleteOne({ _id: new ObjectId(id), userEmail: user.email });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Error deleting vault item:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
