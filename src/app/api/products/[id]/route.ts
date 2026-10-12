import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { products, inventoryMovements } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    if (session.role === "cashier") {
      return NextResponse.json({ error: "غير مصرح للكاشير بتعديل الأصناف" }, { status: 403 });
    }

    const { id } = await params;
    const prodId = parseInt(id);
    if (isNaN(prodId)) {
      return NextResponse.json({ error: "معرف الصنف غير صالح" }, { status: 400 });
    }

    const body = await req.json();
    const { nameAr, nameEn, varietyType, grade, basePurchasePrice, baseSalePrice, currentStock, unit, minStockLevel } = body;

    // Check ownership
    const [existing] = await db
      .select()
      .from(products)
      .where(and(eq(products.id, prodId), eq(products.tenantId, session.tenantId)))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "الصنف غير موجود أو غير تابع لمؤسستك" }, { status: 404 });
    }

    const newStockStr = currentStock !== undefined ? String(currentStock) : existing.currentStock;
    const oldStock = parseFloat(existing.currentStock);
    const newStockVal = parseFloat(newStockStr);

    // Update product
    const [updatedProduct] = await db
      .update(products)
      .set({
        nameAr: nameAr || existing.nameAr,
        nameEn: nameEn !== undefined ? nameEn : existing.nameEn,
        varietyType: varietyType || existing.varietyType,
        grade: grade || existing.grade,
        basePurchasePrice: basePurchasePrice !== undefined ? String(basePurchasePrice) : existing.basePurchasePrice,
        baseSalePrice: baseSalePrice !== undefined ? String(baseSalePrice) : existing.baseSalePrice,
        currentStock: newStockStr,
        unit: unit || existing.unit,
        minStockLevel: minStockLevel !== undefined ? String(minStockLevel) : existing.minStockLevel,
        updatedAt: new Date(),
      })
      .where(eq(products.id, prodId))
      .returning();

    // Log Inventory Movement if stock changed manually
    if (oldStock !== newStockVal) {
      await db.insert(inventoryMovements).values({
        tenantId: session.tenantId,
        productId: prodId,
        type: "adjustment",
        quantity: String(Math.abs(newStockVal - oldStock)),
        previousStock: String(oldStock),
        newStock: String(newStockVal),
        notes: "تعديل يدوي للكمية في المستودع",
        userId: session.userId,
      });
    }

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    if (session.role !== "admin") {
      return NextResponse.json({ error: "يجب أن تكون مديراً كبيراً لحذف صنف بالكامل" }, { status: 403 });
    }

    const { id } = await params;
    const prodId = parseInt(id);
    if (isNaN(prodId)) {
      return NextResponse.json({ error: "معرف الصنف غير صالح" }, { status: 400 });
    }

    // Check ownership
    const [existing] = await db
      .select()
      .from(products)
      .where(and(eq(products.id, prodId), eq(products.tenantId, session.tenantId)))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "الصنف غير موجود أو غير تابع لمؤسستك" }, { status: 404 });
    }

    await db
      .delete(products)
      .where(eq(products.id, prodId));

    return NextResponse.json({ success: true, message: "تم حذف الصنف بنجاح" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
