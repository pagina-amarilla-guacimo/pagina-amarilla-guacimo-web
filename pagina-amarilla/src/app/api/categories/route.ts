import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeDeleted = searchParams.get("includeDeleted") === "true";

    const categories = await prisma.category.findMany({
      where: includeDeleted ? undefined : { isActive: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "El nombre de la categoría es requerido" },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    // Verificar si la categoría ya existe (solo activas)
    const existing = await prisma.category.findFirst({
      where: {
        AND: [
          {
            name: {
              equals: trimmedName,
              mode: "insensitive",
            },
          },
          {
            isActive: true,
          },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Esta categoría ya existe" },
        { status: 409 }
      );
    }

    // Si existe pero está inactiva, reactivarla
    const inactiveCategory = await prisma.category.findFirst({
      where: {
        AND: [
          {
            name: {
              equals: trimmedName,
              mode: "insensitive",
            },
          },
          {
            isActive: false,
          },
        ],
      },
    });

    if (inactiveCategory) {
      const reactivated = await prisma.category.update({
        where: { id: inactiveCategory.id },
        data: { isActive: true },
      });
      return NextResponse.json(reactivated, { status: 201 });
    }

    // Crear nueva categoría
    const category = await prisma.category.create({
      data: { name: trimmedName, isActive: true },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Error al crear la categoría" },
      { status: 500 }
    );
  }
}
