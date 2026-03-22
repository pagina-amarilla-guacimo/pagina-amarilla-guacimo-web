import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { verifyPasswordResetToken } from "@/lib/password-reset";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      code?: string;
      token?: string;
      newPassword?: string;
    };

    const email = body.email?.toLowerCase().trim();
    const code = body.code?.trim();
    const token = body.token?.trim();
    const newPassword = body.newPassword?.trim();

    if (!email || !code || !token || !newPassword) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 },
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "La nueva contrasena debe tener al menos 8 caracteres" },
        { status: 400 },
      );
    }

    const verification = verifyPasswordResetToken({ token, email, code });
    if (!verification.valid) {
      return NextResponse.json(
        { error: verification.reason ?? "Codigo invalido" },
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
      select: { id: true },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Administrador no encontrado" },
        { status: 404 },
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Contrasena actualizada correctamente",
    });
  } catch (error) {
    console.error("Error en reset-password:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar la contrasena" },
      { status: 500 },
    );
  }
}
