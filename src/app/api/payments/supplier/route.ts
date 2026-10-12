import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { suppliers, financialTransactions } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    if (session.role === "cashier") {
      return NextResponse.json({ error: "غير مصرح للكاشير بإجراء سداد للموردين" }, { status: 403 });
    }

    const body = await req.json();
    const { supplierId, paymentAmount, notes } = body;

    const amt = parseFloat(paymentAmount);
    if (!supplierId || isNaN(amt) || amt <= 0) {
      return NextResponse.json({ error: "الرجاء اختيار مورد وإدخال مبلغ سداد صالح" }, { status: 400 });
    }

    const [supplier] = await db
      .select()
      .from(suppliers)
      .where(and(eq(suppliers.id, supplierId), eq(suppliers.tenantId, session.tenantId)))
      .limit(1);

    if (!supplier) {
      return NextResponse.json({ error: "المورد غير موجود" }, { status: 400 });
    }

    const currentLiability = parseFloat(supplier.currentLiability);
    if (amt > currentLiability) {
      return NextResponse.json({ error: `المبلغ المدخل (${amt} YER) أكبر من المستحق للمورد (${currentLiability} YER)` }, { status: 400 });
    }

    const nextLiability = currentLiability - amt;

    // Update Supplier Liability
    await db
      .update(suppliers)
      .set({
        currentLiability: String(nextLiability),
        updatedAt: new Date(),
      })
      .where(eq(suppliers.id, supplier.id));

    // Record cash outflow
    await db.insert(financialTransactions).values({
      tenantId: session.tenantId,
      shiftId: null,
      type: "liability_payment",
      amount: String(amt),
      direction: "out",
      description: notes || `تسديد مالي للمورد: ${supplier.name}`,
      createdAt: new Date(),
      referenceId: supplier.id,
      referenceType: "supplier_payment",
    });

    return NextResponse.json({
      success: true,
      message: "تم تسديد حساب المورد وتحديث الأرصدة بنجاح",
      currentLiability: nextLiability,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
