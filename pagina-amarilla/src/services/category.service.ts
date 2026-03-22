import { categoryRepository } from "../repositories/category.repository";

export const categoryService = {
  getAll: () => {
    return categoryRepository.findAll();
  },

  getAllIncludingDeleted: () => {
    return categoryRepository.findAllIncludingDeleted();
  },

  getById: (id: number) => {
    return categoryRepository.findById(id);
  },

  create: (data: { name: string }) => {
    return categoryRepository.create(data);
  },

  update: (id: number, data: { name?: string }) => {
    return categoryRepository.update(id, data);
  },

  delete: (id: number) => {
    return categoryRepository.delete(id);
  },
};
