import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { shifts } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    // Get the latest shift for this user and tenant
    const [activeShift] = await db
      .select()
      .from(shifts)
      .where(
        and(
          eq(shifts.tenantId, session.tenantId),
          eq(shifts.userId, session.userId),
          eq(shifts.status, "open")
        )
      )
      .limit(1);

    return NextResponse.json({ activeShift: activeShift || null });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await req.json();
    const { action, startingCash, actualCash, notes } = body;

    if (action === "open") {
      // Ensure no active shift already exists for this user
      const [existing] = await db
        .select()
        .from(shifts)
        .where(
          and(
            eq(shifts.tenantId, session.tenantId),
            eq(shifts.userId, session.userId),
            eq(shifts.status, "open")
          )
        )
        .limit(1);

      if (existing) {
        return NextResponse.json({ error: "لديك وردية مفتوحة بالفعل حالياً" }, { status: 400 });
      }

      const [newShift] = await db
        .insert(shifts)
        .values({
          tenantId: session.tenantId,
          userId: session.userId,
          startTime: new Date(),
          status: "open",
          startingCash: String(startingCash || 0),
          expectedCash: String(startingCash || 0),
          actualCash: "0.00",
          discrepancy: "0.00",
          notes: notes || "تم فتح الوردية وتصفير الصندوق",
        })
        .returning();

      return NextResponse.json({ success: true, shift: newShift });
    } else if (action === "close") {
      // Find the active shift
      const [activeShift] = await db
        .select()
        .from(shifts)
        .where(
          and(
            eq(shifts.tenantId, session.tenantId),
            eq(shifts.userId, session.userId),
            eq(shifts.status, "open")
          )
        )
        .limit(1);

      if (!activeShift) {
        return NextResponse.json({ error: "لا توجد وردية مفتوحة لإغلاقها" }, { status: 400 });
      }

      const expected = parseFloat(activeShift.expectedCash);
      const actual = parseFloat(actualCash || 0);
      const discrepancy = actual - expected;

      const [closedShift] = await db
        .update(shifts)
        .set({
          status: "closed",
          endTime: new Date(),
          closedAt: new Date(),
          actualCash: String(actual),
          discrepancy: String(discrepancy),
          notes: notes || `إغلاق الوردية. فارق الصندوق: ${discrepancy}`,
        })
        .where(eq(shifts.id, activeShift.id))
        .returning();

      return NextResponse.json({ success: true, shift: closedShift });
    } else {
      return NextResponse.json({ error: "إجراء غير معروف" }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
