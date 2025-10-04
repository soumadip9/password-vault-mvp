import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";

// ✅ GET — Fetch all vault items for the logged-in user
export async function GET(req: NextRequest) {
  try {
    const res = new NextResponse();
    const session = await getIronSession(req, res, sessionOptions);
    // @ts-ignore
    const user = session.user;

    if (!user || !user.email) {
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

// ✅ POST — Add a new vault item
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = new NextResponse();
    const session = await getIronSession(req, res, sessionOptions);
    // @ts-ignore
    const user = session.user;

    if (!user || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();

    const newItem = {
      ...body,
      userEmail: user.email,
      createdAt: new Date().toISOString(),
    };

    const result = await db.collection("vault").insertOne(newItem);

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (err) {
    console.error("❌ Error creating vault item:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ✅ PUT — Update a vault item (only user’s own)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const res = new NextResponse();
    const session = await getIronSession(req, res, sessionOptions);
    // @ts-ignore
    const user = session.user;

    if (!user || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();

    if (!body._id) {
      return NextResponse.json({ error: "Missing item ID" }, { status: 400 });
    }

    await db.collection("vault").updateOne(
      { _id: new ObjectId(body._id), userEmail: user.email }, // ✅ Only update logged-in user’s entry
      {
        $set: {
          title: body.title,
          username: body.username,
          password: body.password,
          notes: body.notes,
          url: body.url,
          updatedAt: new Date().toISOString(),
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Error updating vault item:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ✅ DELETE — Remove vault item (only user’s own)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const res = new NextResponse();
    const session = await getIronSession(req, res, sessionOptions);
    // @ts-ignore
    const user = session.user;

    if (!user || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();

    await db
      .collection("vault")
      .deleteOne({ _id: new ObjectId(id), userEmail: user.email }); // ✅ scoped delete

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Error deleting vault item:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
