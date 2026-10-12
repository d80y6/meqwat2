import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, tenants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, setSession } from "@/lib/auth";
import { seedDatabase, isDatabaseSeeded } from "@/lib/seed";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "الرجاء إدخال اسم المستخدم وكلمة المرور" }, { status: 400 });
    }

    // Auto-seed if database is empty to guarantee a ready-to-test workspace
    const seeded = await isDatabaseSeeded();
    if (!seeded) {
      await seedDatabase();
    }

    // Find user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" }, { status: 401 });
    }

    if (!user.active) {
      return NextResponse.json({ error: "هذا الحساب معطل حالياً" }, { status: 403 });
    }

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" }, { status: 401 });
    }

    // Get tenant details
    const [tenant] = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, user.tenantId))
      .limit(1);

    if (!tenant) {
      return NextResponse.json({ error: "المؤسسة المرتبطة بهذا المستخدم غير موجودة" }, { status: 404 });
    }

    if (tenant.subscriptionStatus === "suspended") {
      return NextResponse.json({ error: "تم تعليق اشتراك هذه المؤسسة. يرجى مراجعة إدارة المنصة" }, { status: 403 });
    }

    const sessionPayload = {
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role as "admin" | "manager" | "cashier",
      username: user.username,
      name: user.name,
    };

    await setSession(sessionPayload);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
      },
      tenant: {
        id: tenant.id,
        name: tenant.name,
        planName: tenant.planName,
        currency: tenant.currency,
      },
    });
  } catch (error: any) {
    console.error("Login API Error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء تسجيل الدخول: " + error.message }, { status: 500 });
  }
}
