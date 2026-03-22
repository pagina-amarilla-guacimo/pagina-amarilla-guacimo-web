export interface Store {
  id: number
  name: string
  description: string
  phoneNumber: string
  district: string
  location: string
  image?: string | null
  categoryId: number
  category?: Category
  isActive: boolean
}

export interface Category {
  id: number
  name: string
  stores?: Store[]
  isActive: boolean
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