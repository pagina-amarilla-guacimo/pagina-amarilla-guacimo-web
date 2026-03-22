"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function updateAdminProfile(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!name || !email) {
      return {
        success: false,
        error: "Nombre y correo son requeridos",
      };
    }

    const updateData: any = {
      name,
      email,
    };

    if (password && password.trim()) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    const admin = await prisma.admin.update({
      where: { id: 1 },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return {
      success: true,
      message: "Perfil actualizado correctamente",
      admin,
    };
  } catch (error) {
    console.error("Error actualizando admin:", error);
    return {
      success: false,
      error: "Error al actualizar el perfil. Intenta nuevamente.",
    };
  }
}
