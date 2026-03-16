import { storeRepository } from "../repositories/store.repository";

export const storeService = {
    getAll: () => {
        return storeRepository.findAll()
    },

    getById: (id: number) => {
        return storeRepository.findById(id)
    },

    create: (data: {
        name: string
        description: string
        phoneNumber: string
        location: string
        image?: string
        categoryId: number
    }) => {
        return storeRepository.create(data)
    },

    update: (id: number, data: {
        name?: string
        description?: string
        phoneNumber?: string
        location?: string
        image?: string
        categoryId?: number
    }) => {
        return storeRepository.update(id, data)
    },

    delete: (id: number) => {
        return storeRepository.delete(id)
    }
}