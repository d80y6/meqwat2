import { db } from "@/db";
import {
  tenants,
  users,
  products,
  customers,
  suppliers,
  shifts,
  sales,
  saleItems,
  purchases,
  purchaseItems,
  financialTransactions,
  inventoryMovements,
  dailyStockSpoilage,
  auditLogs,
} from "@/db/schema";
import { hashPassword } from "./auth";
import { count, eq } from "drizzle-orm";

export async function isDatabaseSeeded(): Promise<boolean> {
  const [result] = await db.select({ value: count() }).from(tenants);
  return (result?.value || 0) > 0;
}

export async function seedDatabase() {
  const alreadySeeded = await isDatabaseSeeded();
  if (alreadySeeded) {
    return { success: true, message: "Database already seeded." };
  }

  // 1. Create Tenants
  const [tenant1] = await db.insert(tenants).values([
    {
      name: "مؤسسة صنعاء للقات الفاخر",
      ownerName: "الحاج يحيى الكبسي",
      email: "alkebsi@meqwat.com",
      phone: "777112233",
      subscriptionStatus: "active",
      planName: "Pro",
      currency: "YER",
      address: "شارع حدة، أمام مركز الكميم، صنعاء",
    },
  ]).returning();

  const [tenant2] = await db.insert(tenants).values([
    {
      name: "محل الغيل لبيع القات النموذجي",
      ownerName: "علي الغيلي",
      email: "ghail@meqwat.com",
      phone: "771223344",
      subscriptionStatus: "active",
      planName: "Basic",
      currency: "YER",
      address: "شارع تعز، جولة تعز، صنعاء",
    },
  ]).returning();

  // 2. Create Users for Tenant 1
  const pwdHash = hashPassword("password");
  const [admin1] = await db.insert(users).values([
    {
      tenantId: tenant1.id,
      name: "أبو حامد الكبسي",
      username: "admin",
      email: "admin@meqwat.com",
      passwordHash: pwdHash,
      role: "admin",
      phone: "777112233",
      active: true,
    },
  ]).returning();

  const [cashier1] = await db.insert(users).values([
    {
      tenantId: tenant1.id,
      name: "سامح الكاشير",
      username: "cashier",
      email: "cashier@meqwat.com",
      passwordHash: pwdHash,
      role: "cashier",
      phone: "777889900",
      active: true,
    },
  ]).returning();

  // Create Users for Tenant 2
  await db.insert(users).values([
    {
      tenantId: tenant2.id,
      name: "علي الغيلي (المالك)",
      username: "ghail_owner",
      email: "owner@ghail.com",
      passwordHash: pwdHash,
      role: "manager",
      phone: "771223344",
      active: true,
    },
  ]);

  // 3. Create Products (Qat Varieties & Grades) for Tenant 1
  const [prodHamdani] = await db.insert(products).values([
    {
      tenantId: tenant1.id,
      nameAr: "قات همداني سوبر فاخر",
      nameEn: "Hamdani Super Premium",
      varietyType: "Hamdani",
      grade: "Super",
      basePurchasePrice: "8000.00",
      baseSalePrice: "12000.00",
      currentStock: "45.00",
      unit: "Rabta",
      minStockLevel: "10.00",
    },
  ]).returning();

  const [prodShami] = await db.insert(products).values([
    {
      tenantId: tenant1.id,
      nameAr: "قات شامي قطاف ممتاز",
      nameEn: "Shami Excellent Pick",
      varietyType: "Shami",
      grade: "Excellent",
      basePurchasePrice: "5000.00",
      baseSalePrice: "7500.00",
      currentStock: "60.00",
      unit: "Rabta",
      minStockLevel: "15.00",
    },
  ]).returning();

  const [prodAnsi] = await db.insert(products).values([
    {
      tenantId: tenant1.id,
      nameAr: "قات عنسي غيلان عادي",
      nameEn: "Ansi Regular Ghailan",
      varietyType: "Ansi",
      grade: "Regular",
      basePurchasePrice: "3000.00",
      baseSalePrice: "4500.00",
      currentStock: "90.00",
      unit: "Rabta",
      minStockLevel: "20.00",
    },
  ]).returning();

  const [prodBait] = await db.insert(products).values([
    {
      tenantId: tenant1.id,
      nameAr: "قات بايت مخفض",
      nameEn: "Bait Discount Qat",
      varietyType: "Bait",
      grade: "Low",
      basePurchasePrice: "1500.00",
      baseSalePrice: "2200.00",
      currentStock: "15.00",
      unit: "Rabta",
      minStockLevel: "5.00",
    },
  ]).returning();

  // Products for Tenant 2
  await db.insert(products).values([
    {
      tenantId: tenant2.id,
      nameAr: "قات غيلي فاخر",
      nameEn: "Ghaili Premium",
      varietyType: "Ghaili",
      grade: "Super",
      basePurchasePrice: "4000.00",
      baseSalePrice: "6000.00",
      currentStock: "30.00",
      unit: "Rabta",
      minStockLevel: "5.00",
    },
  ]);

  // 4. Create Customers (for Debt management)
  const [cust1] = await db.insert(customers).values([
    {
      tenantId: tenant1.id,
      name: "الشيخ فؤاد الحميري",
      phone: "771122334",
      address: "صنعاء، حي الأصبحي",
      maxDebtLimit: "150000.00",
      currentDebt: "45000.00",
    },
  ]).returning();

  const [cust2] = await db.insert(customers).values([
    {
      tenantId: tenant1.id,
      name: "القاضي عبد الرحمن العلفي",
      phone: "770554433",
      address: "صنعاء، حي الروضة",
      maxDebtLimit: "300000.00",
      currentDebt: "120000.00",
    },
  ]).returning();

  // 5. Create Suppliers (Meqwats providing inventory)
  const [supp1] = await db.insert(suppliers).values([
    {
      tenantId: tenant1.id,
      name: "المقوت يحيى الهمداني (موزع رئيسي)",
      phone: "777555666",
      currentLiability: "250000.00",
    },
  ]).returning();

  const [supp2] = await db.insert(suppliers).values([
    {
      tenantId: tenant1.id,
      name: "حزام العنسي (مورد أمانات)",
      phone: "773221100",
      currentLiability: "140000.00",
    },
  ]).returning();

  // 6. Create Shifts
  // A historical closed shift
  const [closedShift] = await db.insert(shifts).values([
    {
      tenantId: tenant1.id,
      userId: cashier1.id,
      startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 16 * 60 * 60 * 1000),
      status: "closed",
      startingCash: "100000.00",
      expectedCash: "235000.00",
      actualCash: "235000.00",
      discrepancy: "0.00",
      notes: "الوردية الأولى تمت بنجاح وتطابق الصندوق تماماً",
      closedAt: new Date(Date.now() - 16 * 60 * 60 * 1000),
    },
  ]).returning();

  // An active current shift
  const [activeShift] = await db.insert(shifts).values([
    {
      tenantId: tenant1.id,
      userId: cashier1.id,
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: "open",
      startingCash: "150000.00",
      expectedCash: "150000.00",
      actualCash: "0.00",
      discrepancy: "0.00",
      notes: "وردية المساء الحالية - حركة البيع ممتازة",
    },
  ]).returning();

  // 7. Create Sales in the closed shift
  const [sale1] = await db.insert(sales).values([
    {
      tenantId: tenant1.id,
      shiftId: closedShift.id,
      customerId: cust1.id,
      totalAmount: "36000.00",
      discount: "1000.00",
      finalAmount: "35000.00",
      paidAmount: "10000.00",
      debtAmount: "25000.00",
      paymentMethod: "mixed",
      status: "confirmed",
      createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
      userId: cashier1.id,
    },
  ]).returning();

  await db.insert(saleItems).values([
    {
      tenantId: tenant1.id,
      saleId: sale1.id,
      productId: prodHamdani.id,
      quantity: "3.00",
      unitPrice: "12000.00",
      totalPrice: "36000.00",
    },
  ]);

  const [sale2] = await db.insert(sales).values([
    {
      tenantId: tenant1.id,
      shiftId: closedShift.id,
      customerId: cust2.id,
      totalAmount: "120000.00",
      discount: "0.00",
      finalAmount: "120000.00",
      paidAmount: "0.00",
      debtAmount: "120000.00",
      paymentMethod: "debt",
      status: "confirmed",
      createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
      userId: cashier1.id,
    },
  ]).returning();

  await db.insert(saleItems).values([
    {
      tenantId: tenant1.id,
      saleId: sale2.id,
      productId: prodHamdani.id,
      quantity: "10.00",
      unitPrice: "12000.00",
      totalPrice: "120000.00",
    },
  ]);

  // Cash sale
  const [sale3] = await db.insert(sales).values([
    {
      tenantId: tenant1.id,
      shiftId: closedShift.id,
      customerId: null,
      totalAmount: "15000.00",
      discount: "0.00",
      finalAmount: "15000.00",
      paidAmount: "15000.00",
      debtAmount: "0.00",
      paymentMethod: "cash",
      status: "confirmed",
      createdAt: new Date(Date.now() - 17 * 60 * 60 * 1000),
      userId: cashier1.id,
    },
  ]).returning();

  await db.insert(saleItems).values([
    {
      tenantId: tenant1.id,
      saleId: sale3.id,
      productId: prodShami.id,
      quantity: "2.00",
      unitPrice: "7500.00",
      totalPrice: "15000.00",
    },
  ]);

  // Update expected cash on closedShift to include:
  // startingCash (100000) + sale1 cash (10000) + sale2 cash (0) + sale3 cash (15000) = 125000
  await db.update(shifts)
    .set({ expectedCash: "125000.00", actualCash: "125000.00" })
    .where(eq(shifts.id, closedShift.id));

  // 8. Create Purchases from suppliers
  const [purchase1] = await db.insert(purchases).values([
    {
      tenantId: tenant1.id,
      supplierId: supp1.id,
      totalAmount: "400000.00",
      paidAmount: "150000.00",
      liabilityAmount: "250000.00",
      isConsignment: true,
      status: "confirmed",
      createdAt: new Date(Date.now() - 30 * 60 * 60 * 1000),
      userId: admin1.id,
    },
  ]).returning();

  await db.insert(purchaseItems).values([
    {
      tenantId: tenant1.id,
      purchaseId: purchase1.id,
      productId: prodHamdani.id,
      quantity: "50.00",
      unitPrice: "8000.00",
      totalPrice: "400000.00",
    },
  ]);

  // 9. Financial Transactions Ledger
  await db.insert(financialTransactions).values([
    {
      tenantId: tenant1.id,
      shiftId: closedShift.id,
      type: "sale",
      amount: "10000.00",
      direction: "in",
      description: "دفعة نقدية من مبيعات آجل للفاتورة رقم #1 - الشيخ فؤاد الحميري",
      referenceId: sale1.id,
      referenceType: "sale",
      createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
    },
    {
      tenantId: tenant1.id,
      shiftId: closedShift.id,
      type: "sale",
      amount: "15000.00",
      direction: "in",
      description: "مبيعات نقدية مباشرة فاتورة رقم #3",
      referenceId: sale3.id,
      referenceType: "sale",
      createdAt: new Date(Date.now() - 17 * 60 * 60 * 1000),
    },
    {
      tenantId: tenant1.id,
      shiftId: null,
      type: "purchase",
      amount: "150000.00",
      direction: "out",
      description: "دفعة نقدية للمقوت يحيى الهمداني لتسوية فاتورة الشراء #1",
      referenceId: purchase1.id,
      referenceType: "purchase",
      createdAt: new Date(Date.now() - 30 * 60 * 60 * 1000),
    },
    {
      tenantId: tenant1.id,
      shiftId: null,
      type: "debt_payment",
      amount: "20000.00",
      direction: "in",
      description: "تسديد دفعة من الحساب الآجل - القاضي عبد الرحمن العلفي",
      referenceId: cust2.id,
      referenceType: "customer_payment",
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    },
  ]);

  // 10. Inventory Movements
  await db.insert(inventoryMovements).values([
    {
      tenantId: tenant1.id,
      productId: prodHamdani.id,
      type: "purchase",
      quantity: "50.00",
      previousStock: "0.00",
      newStock: "50.00",
      notes: "شراء وتوريد كمية جديدة من المورد يحيى الهمداني",
      userId: admin1.id,
      createdAt: new Date(Date.now() - 30 * 60 * 60 * 1000),
    },
    {
      tenantId: tenant1.id,
      productId: prodHamdani.id,
      type: "sale",
      quantity: "3.00",
      previousStock: "50.00",
      newStock: "47.00",
      notes: "مبيعات فاتورة رقم #1",
      userId: cashier1.id,
      createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
    },
    {
      tenantId: tenant1.id,
      productId: prodHamdani.id,
      type: "sale",
      quantity: "10.00",
      previousStock: "47.00",
      newStock: "37.00",
      notes: "مبيعات فاتورة رقم #2",
      userId: cashier1.id,
      createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
    },
  ]);

  // 11. Daily Stock & Spoilage Log (Highly perishable nature of Qat)
  await db.insert(dailyStockSpoilage).values([
    {
      tenantId: tenant1.id,
      productId: prodAnsi.id,
      date: new Date(Date.now() - 12 * 60 * 60 * 1000),
      spoiledQuantity: "3.50",
      markdownQuantity: "12.00",
      notes: "تلف جزئي بسبب حرارة الجو، وتحويل جزء إلى قات بايت مخفض السعر",
      userId: cashier1.id,
    },
  ]);

  // 12. Audit Logs
  await db.insert(auditLogs).values([
    {
      tenantId: tenant1.id,
      userId: admin1.id,
      action: "database_seed",
      details: "تم تهيئة النظام ببيانات تجريبية كاملة ومتكاملة لسيناريوهات البيع والشراء والآجل والأمانات",
    },
  ]);

  return { success: true, message: "Database seeded successfully with sample data." };
}
