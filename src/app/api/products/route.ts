import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { products, inventoryMovements } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const tenantProducts = await db
      .select()
      .from(products)
      .where(eq(products.tenantId, session.tenantId))
      .orderBy(asc(products.nameAr));

    return NextResponse.json(tenantProducts);
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

    if (session.role === "cashier") {
      return NextResponse.json({ error: "غير مصرح للكاشير بإضافة منتجات" }, { status: 403 });
    }

    const body = await req.json();
    const { nameAr, nameEn, varietyType, grade, basePurchasePrice, baseSalePrice, currentStock, unit, minStockLevel } = body;

    if (!nameAr || !varietyType || !grade || !basePurchasePrice || !baseSalePrice) {
      return NextResponse.json({ error: "الرجاء تعبئة الحقول الأساسية" }, { status: 400 });
    }

    // Insert Product
    const [newProduct] = await db
      .insert(products)
      .values({
        tenantId: session.tenantId,
        nameAr,
        nameEn: nameEn || null,
        varietyType,
        grade,
        basePurchasePrice: String(basePurchasePrice),
        baseSalePrice: String(baseSalePrice),
        currentStock: String(currentStock || 0),
        unit: unit || "Rabta",
        minStockLevel: String(minStockLevel || 5),
      })
      .returning();

    // Log Inventory Movement if initial stock > 0
    const stockVal = parseFloat(currentStock || 0);
    if (stockVal > 0) {
      await db.insert(inventoryMovements).values({
        tenantId: session.tenantId,
        productId: newProduct.id,
        type: "adjustment",
        quantity: String(stockVal),
        previousStock: "0.00",
        newStock: String(stockVal),
        notes: "رصيد أول المدة عند إنشاء الصنف",
        userId: session.userId,
      });
    }

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
