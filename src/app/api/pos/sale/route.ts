import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import {
  sales,
  saleItems,
  products,
  customers,
  shifts,
  financialTransactions,
  inventoryMovements,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await req.json();
    const {
      customerId,
      items, // array of { productId, quantity, unitPrice }
      discount = 0,
      paidAmount = 0,
      paymentMethod = "cash", // 'cash' | 'credit' | 'mixed' | 'debt'
      offlineUuid,
    } = body;

    if (!items || !items.length) {
      return NextResponse.json({ error: "لا يمكن إتمام بيع سلة فارغة" }, { status: 400 });
    }

    // 1. Ensure active shift
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
      return NextResponse.json({ error: "الرجاء فتح وردية جديدة قبل البدء في مبيعات نقاط البيع" }, { status: 400 });
    }

    // 2. Prevent duplication if offlineUuid is passed (idempotency check)
    if (offlineUuid) {
      const [duplicate] = await db
        .select()
        .from(sales)
        .where(
          and(
            eq(sales.tenantId, session.tenantId),
            eq(sales.offlineUuid, offlineUuid)
          )
        )
        .limit(1);

      if (duplicate) {
        return NextResponse.json({
          success: true,
          message: "هذه الفاتورة تم مزامنتها مسبقاً (مكررة)",
          sale: duplicate,
        });
      }
    }

    // 3. Gather products and validate stock/totals
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
      const stock = parseFloat(product.currentStock);

      if (requestedQty <= 0) {
        return NextResponse.json({ error: `الكمية غير صالحة للصنف: ${product.nameAr}` }, { status: 400 });
      }

      if (stock < requestedQty) {
        return NextResponse.json({
          error: `المخزون غير كافٍ للصنف: ${product.nameAr}. المتوفر: ${stock}، المطلوب: ${requestedQty}`,
        }, { status: 400 });
      }

      const itemPrice = parseFloat(item.unitPrice || product.baseSalePrice);
      const itemTotal = requestedQty * itemPrice;
      subtotal += itemTotal;

      validatedItems.push({
        product,
        quantity: requestedQty,
        unitPrice: itemPrice,
        totalPrice: itemTotal,
      });
    }

    const totalDiscount = parseFloat(discount || 0);
    const finalAmount = Math.max(0, subtotal - totalDiscount);
    const paid = parseFloat(paidAmount || 0);
    const debtAmount = Math.max(0, finalAmount - paid);

    // Validate customer and debt limits if debt or mixed payment is chosen
    let targetCustomer = null;
    if (debtAmount > 0) {
      if (!customerId) {
        return NextResponse.json({ error: "يجب اختيار عميل لتسجيل البيع الآجل" }, { status: 400 });
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
      const debtLimit = parseFloat(customer.maxDebtLimit);

      if (currentDebt + debtAmount > debtLimit) {
        return NextResponse.json({
          error: `سقف الدين للعميل ${customer.name} غير كافٍ. المسموح به: ${debtLimit} YER، الدين الحالي: ${currentDebt} YER، الدين الجديد المطلوب: ${debtAmount} YER.`,
        }, { status: 400 });
      }

      targetCustomer = customer;
    }

    // 4. TRANSACTION BLOCK SIMULATION / ACID EXECUTION
    // Write Sale
    const [newSale] = await db
      .insert(sales)
      .values({
        tenantId: session.tenantId,
        shiftId: activeShift.id,
        customerId: customerId || null,
        totalAmount: String(subtotal),
        discount: String(totalDiscount),
        finalAmount: String(finalAmount),
        paidAmount: String(paid),
        debtAmount: String(debtAmount),
        paymentMethod,
        status: "confirmed",
        createdAt: new Date(),
        userId: session.userId,
        offlineUuid: offlineUuid || null,
        syncStatus: "synced",
      })
      .returning();

    // Write Sale Items, Decrease Stock, Log Movements
    for (const item of validatedItems) {
      // 1. Create Sale Item record
      await db.insert(saleItems).values({
        tenantId: session.tenantId,
        saleId: newSale.id,
        productId: item.product.id,
        quantity: String(item.quantity),
        unitPrice: String(item.unitPrice),
        totalPrice: String(item.totalPrice),
      });

      // 2. Deduct product inventory
      const currentStockFloat = parseFloat(item.product.currentStock);
      const nextStockFloat = currentStockFloat - item.quantity;

      await db
        .update(products)
        .set({
          currentStock: String(nextStockFloat),
          updatedAt: new Date(),
        })
        .where(eq(products.id, item.product.id));

      // 3. Log movement
      await db.insert(inventoryMovements).values({
        tenantId: session.tenantId,
        productId: item.product.id,
        type: "sale",
        quantity: String(item.quantity),
        previousStock: String(currentStockFloat),
        newStock: String(nextStockFloat),
        notes: `مبيعات نقطة البيع - الفاتورة #${newSale.id}`,
        userId: session.userId,
      });
    }

    // 5. Update customer debt if credit
    if (debtAmount > 0 && targetCustomer) {
      const nextDebt = parseFloat(targetCustomer.currentDebt) + debtAmount;
      await db
        .update(customers)
        .set({
          currentDebt: String(nextDebt),
          updatedAt: new Date(),
        })
        .where(eq(customers.id, targetCustomer.id));
    }

    // 6. Record financial transaction for cash received
    if (paid > 0) {
      await db.insert(financialTransactions).values({
        tenantId: session.tenantId,
        shiftId: activeShift.id,
        type: "sale",
        amount: String(paid),
        direction: "in",
        description: `فاتورة مبيعات رقم #${newSale.id} - العميل: ${targetCustomer ? targetCustomer.name : 'نقدي'}`,
        createdAt: new Date(),
        referenceId: newSale.id,
        referenceType: "sale",
      });

      // 7. Update active shift's expected cash
      const newExpectedCash = parseFloat(activeShift.expectedCash) + paid;
      await db
        .update(shifts)
        .set({
          expectedCash: String(newExpectedCash),
        })
        .where(eq(shifts.id, activeShift.id));
    }

    return NextResponse.json({
      success: true,
      message: "تم حفظ وتسجيل عملية البيع بنجاح وتحديث المخزون والمالية",
      saleId: newSale.id,
      finalAmount,
      paidAmount: paid,
      debtAmount,
    });
  } catch (error: any) {
    console.error("Sale Processing Error:", error);
    return NextResponse.json({ error: "خطأ في معالجة البيع: " + error.message }, { status: 500 });
  }
}
