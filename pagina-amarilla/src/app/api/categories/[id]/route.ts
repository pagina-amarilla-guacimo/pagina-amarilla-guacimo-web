import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const category = await prisma.category.findUnique({
      where: { id: Number(id) },
      include: {
        _count: {
          select: { stores: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Categoría no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { error: "Error al obtener la categoría" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "El nombre de la categoría es requerido" },
        { status: 400 }
      );
    }

    // Verificar si el nombre ya existe (excluyendo la categoría actual)
    const existing = await prisma.category.findFirst({
      where: {
        AND: [
          {
            name: {
              equals: name,
              mode: "insensitive",
            },
          },
          {
            id: {
              not: Number(id),
            },
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

    const category = await prisma.category.update({
      where: { id: Number(id) },
      data: { name: name.trim() },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Error al actualizar la categoría" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const categoryId = Number(id);

    // Verificar si hay comercios vinculados y activos
    const storeCount = await prisma.store.count({
      where: { 
        categoryId,
        isActive: true 
      },
    });

    if (storeCount > 0) {
      return NextResponse.json(
        {
          error: `No se puede eliminar esta categoría porque tiene ${storeCount} comercio(s) vinculado(s)`,
        },
        { status: 409 }
      );
    }

    // Realizar borrado lógico
    const category = await prisma.category.update({
      where: { id: categoryId },
      data: { isActive: false },
    });

    return NextResponse.json({ message: "Categoría eliminada correctamente", category });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Error al eliminar la categoría" },
      { status: 500 }
    );
  }
}
