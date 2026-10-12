import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { users, tenants } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ authenticated: false, error: "غير مصرح" }, { status: 401 });
    }

    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        role: users.role,
        active: users.active,
      })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ authenticated: false, error: "مستخدم غير موجود" }, { status: 401 });
    }

    const [tenant] = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, session.tenantId))
      .limit(1);

    return NextResponse.json({
      authenticated: true,
      user,
      tenant,
    });
  } catch (error: any) {
    console.error("Auth Me Error:", error);
    return NextResponse.json({ authenticated: false, error: "خطأ داخلي" }, { status: 500 });
  }
}
