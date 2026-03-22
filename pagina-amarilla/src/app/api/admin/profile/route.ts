import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const admin = await prisma.admin.findFirst({
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "No admin found" },
        { status: 404 }
      );
    }

    return NextResponse.json(admin);
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
