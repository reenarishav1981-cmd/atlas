import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hashPassword } from "@/lib/password";

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, password } = await req.json().catch(() => ({}));

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: "Name must be at least 2 characters long." }, { status: 400 });
    }

    const updateData: any = { name: name.trim() };

    if (password && password.trim().length > 0) {
      if (password.trim().length < 4) {
        return NextResponse.json({ error: "Password must be at least 4 characters long." }, { status: 400 });
      }
      updateData.passwordHash = await hashPassword(password.trim());
    }

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (err) {
    console.error("Profile update failed:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
