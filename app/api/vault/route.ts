export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";

// ✅ Create new vault entry
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const db = await getDb();

    const result = await db.collection("vaultItems").insertOne({
      ...data,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error("❌ Error saving vault entry:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// ✅ Get all vault items
export async function GET() {
  try {
    const db = await getDb();
    const items = await db.collection("vaultItems").find().sort({ createdAt: -1 }).toArray();
    return NextResponse.json({ items });
  } catch (error) {
    console.error("❌ Error fetching vault entries:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// ✅ Edit (update) vault item
export async function PUT(req: Request) {
  try {
    const data = await req.json();
    const { _id, ...updateFields } = data;

    const db = await getDb();
    const result = await db
      .collection("vaultItems")
      .updateOne({ _id: new ObjectId(_id) }, { $set: updateFields });

    return NextResponse.json({ success: true, updatedCount: result.modifiedCount });
  } catch (error) {
    console.error("❌ Error updating vault entry:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// ✅ Delete vault item


export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    // ✅ Ensure id is valid before converting
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });
    }

    const db = await getDb();
    const result = await db
      .collection("vaultItems")
      .deleteOne({ _id: new ObjectId(String(id)) }); // 👈 convert safely to string

    return NextResponse.json({ success: true, deletedCount: result.deletedCount });
  } catch (error) {
    console.error("❌ Error deleting vault entry:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

