import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import {
  purchases,
  purchaseItems,
  products,
  suppliers,
  financialTransactions,
  inventoryMovements,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const tenantPurchases = await db
      .select({
        id: purchases.id,
        supplierId: purchases.supplierId,
        totalAmount: purchases.totalAmount,
        paidAmount: purchases.paidAmount,
        liabilityAmount: purchases.liabilityAmount,
        isConsignment: purchases.isConsignment,
        status: purchases.status,
        createdAt: purchases.createdAt,
      })
      .from(purchases)
      .where(eq(purchases.tenantId, session.tenantId))
      .orderBy(purchases.createdAt);

    return NextResponse.json(tenantPurchases);
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
      return NextResponse.json({ error: "غير مصرح للكاشير بإجراء عمليات الشراء والتوريد" }, { status: 403 });
    }

    const body = await req.json();
    const {
      supplierId,
      items, // array of { productId, quantity, unitPrice }
      paidAmount = 0,
      isConsignment = false,
    } = body;

    if (!items || !items.length) {
      return NextResponse.json({ error: "سلة المشتريات فارغة" }, { status: 400 });
    }

    const [supplier] = await db
      .select()
      .from(suppliers)
      .where(and(eq(suppliers.id, supplierId), eq(suppliers.tenantId, session.tenantId)))
      .limit(1);

    if (!supplier) {
      return NextResponse.json({ error: "المورد المحدد غير موجود" }, { status: 400 });
    }

    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const [product] = await db
        .select()
        .from(products)
        .where(and(eq(products.id, item.productId), eq(products.tenantId, session.tenantId)))
        .limit(1);

      if (!product) {
        return NextResponse.json({ error: `الصنف ذو الرقم ${item.productId} غير موجود` }, { status: 400 });
      }

      const requestedQty = parseFloat(item.quantity);
      if (requestedQty <= 0) {
        return NextResponse.json({ error: "الكمية غير صالحة" }, { status: 400 });
      }

      const itemPrice = parseFloat(item.unitPrice || product.basePurchasePrice);
      const itemTotal = requestedQty * itemPrice;
      subtotal += itemTotal;

      validatedItems.push({
        product,
        quantity: requestedQty,
        unitPrice: itemPrice,
        totalPrice: itemTotal,
      });
    }

    const paid = parseFloat(paidAmount || 0);
    const liabilityAmount = Math.max(0, subtotal - paid);

    // Insert purchase record
    const [newPurchase] = await db
      .insert(purchases)
      .values({
        tenantId: session.tenantId,
        supplierId,
        totalAmount: String(subtotal),
        paidAmount: String(paid),
        liabilityAmount: String(liabilityAmount),
        isConsignment: !!isConsignment,
        status: "confirmed",
        createdAt: new Date(),
        userId: session.userId,
      })
      .returning();

    // Insert purchase items, increase stock, log movements
    for (const item of validatedItems) {
      await db.insert(purchaseItems).values({
        tenantId: session.tenantId,
        purchaseId: newPurchase.id,
        productId: item.product.id,
        quantity: String(item.quantity),
        unitPrice: String(item.unitPrice),
        totalPrice: String(item.totalPrice),
      });

      const currentStockFloat = parseFloat(item.product.currentStock);
      const nextStockFloat = currentStockFloat + item.quantity;

      // Update product current stock
      await db
        .update(products)
        .set({
          currentStock: String(nextStockFloat),
          updatedAt: new Date(),
        })
        .where(eq(products.id, item.product.id));

      // Log movement
      await db.insert(inventoryMovements).values({
        tenantId: session.tenantId,
        productId: item.product.id,
        type: "purchase",
        quantity: String(item.quantity),
        previousStock: String(currentStockFloat),
        newStock: String(nextStockFloat),
        notes: `توريد بضاعة - فاتورة شراء رقم #${newPurchase.id}`,
        userId: session.userId,
      });
    }

    // Update supplier liabilities if there is any debt/liability
    if (liabilityAmount > 0) {
      const nextLiability = parseFloat(supplier.currentLiability) + liabilityAmount;
      await db
        .update(suppliers)
        .set({
          currentLiability: String(nextLiability),
          updatedAt: new Date(),
        })
        .where(eq(suppliers.id, supplier.id));
    }

    // Record cash outflow
    if (paid > 0) {
      await db.insert(financialTransactions).values({
        tenantId: session.tenantId,
        shiftId: null,
        type: "purchase",
        amount: String(paid),
        direction: "out",
        description: `تسديد نقدي لشراء بضاعة فاتورة رقم #${newPurchase.id} - المورد: ${supplier.name}`,
        createdAt: new Date(),
        referenceId: newPurchase.id,
        referenceType: "purchase",
      });
    }

    return NextResponse.json({
      success: true,
      message: "تم حفظ فاتورة التوريد والشراء بنجاح وتحديث المخزون وحسابات المورد",
      purchaseId: newPurchase.id,
      totalAmount: subtotal,
      paidAmount: paid,
      liabilityAmount,
    });
  } catch (error: any) {
    console.error("Purchase Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
