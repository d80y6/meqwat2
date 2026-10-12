import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { dailyStockSpoilage, products, inventoryMovements } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const logs = await db
      .select({
        id: dailyStockSpoilage.id,
        productId: dailyStockSpoilage.productId,
        date: dailyStockSpoilage.date,
        spoiledQuantity: dailyStockSpoilage.spoiledQuantity,
        markdownQuantity: dailyStockSpoilage.markdownQuantity,
        notes: dailyStockSpoilage.notes,
        createdAt: dailyStockSpoilage.createdAt,
      })
      .from(dailyStockSpoilage)
      .where(eq(dailyStockSpoilage.tenantId, session.tenantId))
      .orderBy(desc(dailyStockSpoilage.date));

    return NextResponse.json(logs);
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
    const { productId, spoiledQuantity = 0, markdownQuantity = 0, notes } = body;

    const spoiled = parseFloat(spoiledQuantity || 0);
    const markdown = parseFloat(markdownQuantity || 0);

    if (!productId || (spoiled <= 0 && markdown <= 0)) {
      return NextResponse.json({ error: "الرجاء اختيار صنف وتحديد كمية تالف أو كمية بايت صالحة" }, { status: 400 });
    }

    const [product] = await db
      .select()
      .from(products)
      .where(and(eq(products.id, productId), eq(products.tenantId, session.tenantId)))
      .limit(1);

    if (!product) {
      return NextResponse.json({ error: "الصنف المحدد غير موجود" }, { status: 400 });
    }

    const currentStock = parseFloat(product.currentStock);
    if (spoiled > currentStock) {
      return NextResponse.json({ error: `كمية التالف المتوفرة في المخزن غير كافية. الحالي: ${currentStock}` }, { status: 400 });
    }

    // Insert spoilage log
    const [newLog] = await db
      .insert(dailyStockSpoilage)
      .values({
        tenantId: session.tenantId,
        productId,
        date: new Date(),
        spoiledQuantity: String(spoiled),
        markdownQuantity: String(markdown),
        notes: notes || "تالف يومي اعتيادي",
        userId: session.userId,
      })
      .returning();

    // Deduct stock for the spoiled portion (thrown away)
    if (spoiled > 0) {
      const nextStock = currentStock - spoiled;
      await db
        .update(products)
        .set({ currentStock: String(nextStock), updatedAt: new Date() })
        .where(eq(products.id, product.id));

      await db.insert(inventoryMovements).values({
        tenantId: session.tenantId,
        productId: product.id,
        type: "spoilage",
        quantity: String(spoiled),
        previousStock: String(currentStock),
        newStock: String(nextStock),
        notes: `تسجيل تالف فاقد يومي: ${notes || ""}`,
        userId: session.userId,
      });
    }

    return NextResponse.json({
      success: true,
      message: "تم تسجيل التالف والفاقد وتحديث المخزون بنجاح",
      log: newLog,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
