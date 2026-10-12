import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { suppliers } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const tenantSuppliers = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.tenantId, session.tenantId))
      .orderBy(asc(suppliers.name));

    return NextResponse.json(tenantSuppliers);
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
    const { name, phone, currentLiability } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: "الاسم ورقم الهاتف مطلوبين" }, { status: 400 });
    }

    const [newSupplier] = await db
      .insert(suppliers)
      .values({
        tenantId: session.tenantId,
        name,
        phone,
        currentLiability: currentLiability ? String(currentLiability) : "0.00",
      })
      .returning();

    return NextResponse.json({ success: true, supplier: newSupplier });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
