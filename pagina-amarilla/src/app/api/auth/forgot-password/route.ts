import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createPasswordResetToken,
  generateResetCode,
} from "@/lib/password-reset";
import { sendPasswordResetEmail } from "@/lib/mailer";

export async function POST() {
  try {
    const admin = await prisma.admin.findFirst({
      select: {
        email: true,
      },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "No hay un administrador configurado" },
        { status: 404 },
      );
    }

    const code = generateResetCode();
    const { token, expiresAt } = createPasswordResetToken(admin.email, code);
    await sendPasswordResetEmail({
      to: admin.email,
      code,
      expiresAt,
    });

    return NextResponse.json({
      success: true,
      message: "Revisa tu correo para continuar con la recuperacion.",
      token,
      email: admin.email,
      expiresAt,
    });
  } catch (error) {
    console.error("Error en forgot-password:", error);

    if (error instanceof Error && error.message.includes("SMTP no configurado")) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "No se pudo enviar el codigo de recuperacion" },
      { status: 500 },
    );
  }
}
