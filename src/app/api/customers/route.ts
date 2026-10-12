import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const tenantCustomers = await db
      .select()
      .from(customers)
      .where(eq(customers.tenantId, session.tenantId))
      .orderBy(asc(customers.name));

    return NextResponse.json(tenantCustomers);
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
    const { name, phone, address, maxDebtLimit } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: "الاسم ورقم الهاتف مطلوبين" }, { status: 400 });
    }

    const [newCustomer] = await db
      .insert(customers)
      .values({
        tenantId: session.tenantId,
        name,
        phone,
        address: address || null,
        maxDebtLimit: maxDebtLimit ? String(maxDebtLimit) : "50000.00",
        currentDebt: "0.00",
      })
      .returning();

    return NextResponse.json({ success: true, customer: newCustomer });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
