export interface Store {
  id: number
  name: string
  description: string
  phoneNumber: string
  location: string
  image?: string | null
  categoryId: number
  category?: Category
}

export interface Category {
  id: number
  name: string
  stores?: Store[]
}

export interface Admin {
  id: number
  name: string
  email: string
  createdAt: Date
}

export type CreateStoreDto = Omit<Store, 'id' | 'category'>
export type UpdateStoreDto = Partial<CreateStoreDto>

export type CreateCategoryDto = Pick<Category, 'name'>
export type UpdateCategoryDto = Partial<CreateCategoryDto>