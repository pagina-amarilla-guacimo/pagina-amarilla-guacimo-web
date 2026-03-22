import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  getSessionMaxAgeSeconds,
} from "@/lib/auth-session";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const email = body.email?.toLowerCase().trim();
    const password = body.password?.trim();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Correo y contrasena son obligatorios" },
        { status: 400 },
      );
    }

    const admin = await prisma.admin.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Credenciales invalidas" },
        { status: 401 },
      );
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Credenciales invalidas" },
        { status: 401 },
      );
    }

    const token = createAdminSessionToken({ id: admin.id, email: admin.email });
    const response = NextResponse.json({ success: true });

    response.cookies.set({
      name: ADMIN_SESSION_COOKIE,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: getSessionMaxAgeSeconds(),
    });

    return response;
  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json(
      { error: "No se pudo iniciar sesion" },
      { status: 500 },
    );
  }
}
