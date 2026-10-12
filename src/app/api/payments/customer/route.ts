import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { customers, financialTransactions, shifts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await req.json();
    const { customerId, paymentAmount, notes } = body;

    const amt = parseFloat(paymentAmount);
    if (!customerId || isNaN(amt) || amt <= 0) {
      return NextResponse.json({ error: "الرجاء إدخال عميل صالح ومبلغ سداد صحيح أكبر من الصفر" }, { status: 400 });
    }

    const [customer] = await db
      .select()
      .from(customers)
      .where(and(eq(customers.id, customerId), eq(customers.tenantId, session.tenantId)))
      .limit(1);

    if (!customer) {
      return NextResponse.json({ error: "العميل المحدد غير موجود" }, { status: 400 });
    }

    const currentDebt = parseFloat(customer.currentDebt);
    if (amt > currentDebt) {
      return NextResponse.json({ error: `المبلغ المدخل (${amt} YER) أكبر من الدين الحالي المستحق للعميل (${currentDebt} YER)` }, { status: 400 });
    }

    const nextDebt = currentDebt - amt;

    // Update Customer Debt
    await db
      .update(customers)
      .set({
        currentDebt: String(nextDebt),
        updatedAt: new Date(),
      })
      .where(eq(customers.id, customer.id));

    // Get active shift to attribute cash to
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

    const shiftId = activeShift ? activeShift.id : null;

    // Record Financial Transaction
    await db.insert(financialTransactions).values({
      tenantId: session.tenantId,
      shiftId,
      type: "debt_payment",
      amount: String(amt),
      direction: "in",
      description: notes || `دفعة سداد حساب من العميل: ${customer.name}`,
      createdAt: new Date(),
      referenceId: customer.id,
      referenceType: "customer_payment",
    });

    // Update active shift drawer expected cash if applicable
    if (activeShift) {
      const nextExpected = parseFloat(activeShift.expectedCash) + amt;
      await db
        .update(shifts)
        .set({ expectedCash: String(nextExpected) })
        .where(eq(shifts.id, activeShift.id));
    }

    return NextResponse.json({
      success: true,
      message: "تم تسجيل سداد الدين بنجاح وتحديث حساب العميل والصندوق",
      currentDebt: nextDebt,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
