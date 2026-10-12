import { pgTable, serial, varchar, text, numeric, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// 1. Tenants Table
export const tenants = pgTable("tenants", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  ownerName: varchar("owner_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  subscriptionStatus: varchar("subscription_status", { length: 50 }).default("trial").notNull(), // 'active' | 'suspended' | 'trial'
  planName: varchar("plan_name", { length: 50 }).default("Basic").notNull(), // 'Basic' | 'Pro' | 'Enterprise'
  currency: varchar("currency", { length: 10 }).default("YER").notNull(), // 'YER' | 'USD' | 'SAR'
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 2. Users Table (Belongs to Tenant)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  username: varchar("username", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).default("cashier").notNull(), // 'admin' | 'manager' | 'cashier'
  active: boolean("active").default(true).notNull(),
  phone: varchar("phone", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 3. Products / Qat Varieties Table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(), // e.g. "قات همداني سوبر"
  nameEn: varchar("name_en", { length: 255 }),          // e.g. "Super Hamdani"
  varietyType: varchar("variety_type", { length: 100 }).default("Hamdani").notNull(), // Hamdani, Shami, Ghaili, Ansi, Harazi, Bait
  grade: varchar("grade", { length: 50 }).default("Regular").notNull(), // Super, Excellent, Regular, Low
  basePurchasePrice: numeric("base_purchase_price", { precision: 12, scale: 2 }).default("0.00").notNull(),
  baseSalePrice: numeric("base_sale_price", { precision: 12, scale: 2 }).default("0.00").notNull(),
  currentStock: numeric("current_stock", { precision: 12, scale: 2 }).default("0.00").notNull(), // decimal for flexible weight/units
  unit: varchar("unit", { length: 50 }).default("Rabta").notNull(), // 'Rabta' (ربطة), 'Bag' (كيس), 'KG' (كيلو)
  minStockLevel: numeric("min_stock_level", { precision: 12, scale: 2 }).default("5.00").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 4. Customers Table (For Debt / Credit Sales)
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  address: text("address"),
  maxDebtLimit: numeric("max_debt_limit", { precision: 12, scale: 2 }).default("50000.00").notNull(),
  currentDebt: numeric("current_debt", { precision: 12, scale: 2 }).default("0.00").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 5. Suppliers Table (Meqwats / Consignors)
export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  currentLiability: numeric("current_liability", { precision: 12, scale: 2 }).default("0.00").notNull(), // What we owe them
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 6. Shifts Table (For Cash Drawer & Pos Auditing)
export const shifts = pgTable("shifts", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  startTime: timestamp("start_time").defaultNow().notNull(),
  endTime: timestamp("end_time"),
  status: varchar("status", { length: 50 }).default("open").notNull(), // 'open' | 'closed'
  startingCash: numeric("starting_cash", { precision: 12, scale: 2 }).default("0.00").notNull(),
  expectedCash: numeric("expected_cash", { precision: 12, scale: 2 }).default("0.00").notNull(),
  actualCash: numeric("actual_cash", { precision: 12, scale: 2 }).default("0.00").notNull(),
  discrepancy: numeric("discrepancy", { precision: 12, scale: 2 }).default("0.00").notNull(),
  notes: text("notes"),
  closedAt: timestamp("closed_at"),
});

// 7. Sales Table
export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  shiftId: integer("shift_id").references(() => shifts.id).notNull(),
  customerId: integer("customer_id").references(() => customers.id),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).default("0.00").notNull(),
  discount: numeric("discount", { precision: 12, scale: 2 }).default("0.00").notNull(),
  finalAmount: numeric("final_amount", { precision: 12, scale: 2 }).default("0.00").notNull(),
  paidAmount: numeric("paid_amount", { precision: 12, scale: 2 }).default("0.00").notNull(),
  debtAmount: numeric("debt_amount", { precision: 12, scale: 2 }).default("0.00").notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }).default("cash").notNull(), // 'cash' | 'credit' | 'mixed' | 'debt'
  status: varchar("status", { length: 50 }).default("confirmed").notNull(), // 'confirmed' | 'refunded' | 'reversed'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  offlineUuid: varchar("offline_uuid", { length: 100 }), // for deduplication and mobile support
  syncStatus: varchar("sync_status", { length: 50 }).default("synced").notNull(), // 'synced' | 'pending'
});

// 8. Sale Items Table
export const saleItems = pgTable("sale_items", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  saleId: integer("sale_id").references(() => sales.id, { onDelete: "cascade" }).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: numeric("quantity", { precision: 12, scale: 2 }).default("1.00").notNull(),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).default("0.00").notNull(),
  totalPrice: numeric("total_price", { precision: 12, scale: 2 }).default("0.00").notNull(),
});

// 9. Purchases Table (From suppliers, outright or consignment)
export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  supplierId: integer("supplier_id").references(() => suppliers.id).notNull(),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).default("0.00").notNull(),
  paidAmount: numeric("paid_amount", { precision: 12, scale: 2 }).default("0.00").notNull(),
  liabilityAmount: numeric("liability_amount", { precision: 12, scale: 2 }).default("0.00").notNull(),
  isConsignment: boolean("is_consignment").default(false).notNull(), // true means 'Amana' (أمانة)
  status: varchar("status", { length: 50 }).default("confirmed").notNull(), // 'confirmed' | 'returned'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
});

// 10. Purchase Items Table
export const purchaseItems = pgTable("purchase_items", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  purchaseId: integer("purchase_id").references(() => purchases.id, { onDelete: "cascade" }).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: numeric("quantity", { precision: 12, scale: 2 }).default("1.00").notNull(),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).default("0.00").notNull(),
  totalPrice: numeric("total_price", { precision: 12, scale: 2 }).default("0.00").notNull(),
});

// 11. Financial Transactions Table (The double-entry or simple general ledger)
export const financialTransactions = pgTable("financial_transactions", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  shiftId: integer("shift_id").references(() => shifts.id),
  type: varchar("type", { length: 50 }).notNull(), // 'sale' | 'purchase' | 'debt_payment' | 'liability_payment' | 'expense' | 'capital'
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  direction: varchar("direction", { length: 10 }).notNull(), // 'in' (receivable/cash coming in) | 'out' (payable/cash going out)
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  referenceId: integer("reference_id"), // saleId, purchaseId, etc.
  referenceType: varchar("reference_type", { length: 100 }), // 'sale' | 'purchase' | 'customer_payment' | 'supplier_payment'
});

// 12. Inventory Movements Table (Stock tracking ledger)
export const inventoryMovements = pgTable("inventory_movements", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'purchase' | 'sale' | 'spoilage' | 'adjustment' | 'return'
  quantity: numeric("quantity", { precision: 12, scale: 2 }).notNull(),
  previousStock: numeric("previous_stock", { precision: 12, scale: 2 }).notNull(),
  newStock: numeric("new_stock", { precision: 12, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
});

// 13. Daily Stock & Spoilage Table (Essential for Qat since it goes bad in 24 hours)
export const dailyStockSpoilage = pgTable("daily_stock_spoilage", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  date: timestamp("date").defaultNow().notNull(),
  spoiledQuantity: numeric("spoiled_quantity", { precision: 12, scale: 2 }).default("0.00").notNull(), // wasted/discarded
  markdownQuantity: numeric("markdown_quantity", { precision: 12, scale: 2 }).default("0.00").notNull(), // marked down / sold cheap (Bait)
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
});

// 14. Offline Queued Transactions Table
export const offlineQueuedTransactions = pgTable("offline_queued_transactions", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  payload: text("payload").notNull(), // JSON text containing full request details
  status: varchar("status", { length: 50 }).default("pending").notNull(), // 'pending' | 'synced' | 'failed'
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  retryCount: integer("retry_count").default(0).notNull(),
});

// 15. Audit Logs Table (For security auditing)
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  action: varchar("action", { length: 150 }).notNull(), // e.g. "update_price", "reverse_sale"
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});


// RELATIONS DEFINITIONS FOR DRIZZLE ORM
export const tenantRelations = relations(tenants, ({ many }) => ({
  users: many(users),
  products: many(products),
  customers: many(customers),
  suppliers: many(suppliers),
  shifts: many(shifts),
  sales: many(sales),
  purchases: many(purchases),
  financialTransactions: many(financialTransactions),
  inventoryMovements: many(inventoryMovements),
  dailyStockSpoilages: many(dailyStockSpoilage),
  offlineQueuedTransactions: many(offlineQueuedTransactions),
  auditLogs: many(auditLogs),
}));

export const userRelations = relations(users, ({ one, many }) => ({
  tenant: one(tenants, { fields: [users.tenantId], references: [tenants.id] }),
  shifts: many(shifts),
  sales: many(sales),
  purchases: many(purchases),
  inventoryMovements: many(inventoryMovements),
  dailyStockSpoilages: many(dailyStockSpoilage),
  auditLogs: many(auditLogs),
}));

export const productRelations = relations(products, ({ one, many }) => ({
  tenant: one(tenants, { fields: [products.tenantId], references: [tenants.id] }),
  saleItems: many(saleItems),
  purchaseItems: many(purchaseItems),
  inventoryMovements: many(inventoryMovements),
  dailyStockSpoilages: many(dailyStockSpoilage),
}));

export const customerRelations = relations(customers, ({ one, many }) => ({
  tenant: one(tenants, { fields: [customers.tenantId], references: [tenants.id] }),
  sales: many(sales),
}));

export const supplierRelations = relations(suppliers, ({ one, many }) => ({
  tenant: one(tenants, { fields: [suppliers.tenantId], references: [tenants.id] }),
  purchases: many(purchases),
}));

export const shiftRelations = relations(shifts, ({ one, many }) => ({
  tenant: one(tenants, { fields: [shifts.tenantId], references: [tenants.id] }),
  user: one(users, { fields: [shifts.userId], references: [users.id] }),
  sales: many(sales),
  financialTransactions: many(financialTransactions),
}));

export const saleRelations = relations(sales, ({ one, many }) => ({
  tenant: one(tenants, { fields: [sales.tenantId], references: [tenants.id] }),
  shift: one(shifts, { fields: [sales.shiftId], references: [shifts.id] }),
  customer: one(customers, { fields: [sales.customerId], references: [customers.id] }),
  user: one(users, { fields: [sales.userId], references: [users.id] }),
  saleItems: many(saleItems),
}));

export const saleItemRelations = relations(saleItems, ({ one }) => ({
  tenant: one(tenants, { fields: [saleItems.tenantId], references: [tenants.id] }),
  sale: one(sales, { fields: [saleItems.saleId], references: [sales.id] }),
  product: one(products, { fields: [saleItems.productId], references: [products.id] }),
}));

export const purchaseRelations = relations(purchases, ({ one, many }) => ({
  tenant: one(tenants, { fields: [purchases.tenantId], references: [tenants.id] }),
  supplier: one(suppliers, { fields: [purchases.supplierId], references: [suppliers.id] }),
  user: one(users, { fields: [purchases.userId], references: [users.id] }),
  purchaseItems: many(purchaseItems),
}));

export const purchaseItemRelations = relations(purchaseItems, ({ one }) => ({
  tenant: one(tenants, { fields: [purchaseItems.tenantId], references: [tenants.id] }),
  purchase: one(purchases, { fields: [purchaseItems.purchaseId], references: [purchases.id] }),
  product: one(products, { fields: [purchaseItems.productId], references: [products.id] }),
}));

export const financialTransactionRelations = relations(financialTransactions, ({ one }) => ({
  tenant: one(tenants, { fields: [financialTransactions.tenantId], references: [tenants.id] }),
  shift: one(shifts, { fields: [financialTransactions.shiftId], references: [shifts.id] }),
}));

export const inventoryMovementRelations = relations(inventoryMovements, ({ one }) => ({
  tenant: one(tenants, { fields: [inventoryMovements.tenantId], references: [tenants.id] }),
  product: one(products, { fields: [inventoryMovements.productId], references: [products.id] }),
  user: one(users, { fields: [inventoryMovements.userId], references: [users.id] }),
}));

export const dailyStockSpoilageRelations = relations(dailyStockSpoilage, ({ one }) => ({
  tenant: one(tenants, { fields: [dailyStockSpoilage.tenantId], references: [tenants.id] }),
  product: one(products, { fields: [dailyStockSpoilage.productId], references: [products.id] }),
  user: one(users, { fields: [dailyStockSpoilage.userId], references: [users.id] }),
}));

export const offlineQueuedTransactionRelations = relations(offlineQueuedTransactions, ({ one }) => ({
  tenant: one(tenants, { fields: [offlineQueuedTransactions.tenantId], references: [tenants.id] }),
}));

export const auditLogRelations = relations(auditLogs, ({ one }) => ({
  tenant: one(tenants, { fields: [auditLogs.tenantId], references: [tenants.id] }),
  user: one(users, { fields: [auditLogs.userId], references: [users.id] }),
}));
