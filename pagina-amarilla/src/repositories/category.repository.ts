import { prisma } from "@/lib/prisma";

export const categoryRepository = {
  findAll: () => {
    return prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { stores: true },
        },
      },
    });
  },

  findAllIncludingDeleted: () => {
    return prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { stores: true },
        },
      },
    });
  },

  findById: (id: number) => {
    return prisma.category.findUnique({
      where: { id },
    });
  },

  create: (data: { name: string }) => {
    return prisma.category.create({ data: { ...data, isActive: true } });
  },

  update: (id: number, data: { name?: string }) => {
    return prisma.category.update({
      where: { id },
      data,
    });
  },

  delete: (id: number) => {
    return prisma.category.update({
      where: { id },
      data: { isActive: false },
    });
  },
};
