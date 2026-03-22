import {prisma} from '@/lib/prisma'

export const storeRepository = {
    
    findAll: () => {
        return prisma.store.findMany({
            where: {
                isActive: true
            },
            include: {
                category: true
            }
        })
    },

    findById: (id: number) => {
        return prisma.store.findUnique({
            where: {id},
            include: {
                category: true
            }
        })
    },

    create: (data:{
        name: string
        description: string
        phoneNumber: string
        district: string
        location: string
        image?: string
        categoryId: number
    }) => {
        return prisma.store.create({data: {...data, isActive: true}})
    },

    update: (id: number, data: {
        name?: string
        description?: string
        phoneNumber?: string
        district?: string
        location?: string
        image?: string
        categoryId?: number
    }) => {
        return prisma.store.update({where: {id}, data})
    },

    delete: (id: number) =>{
        return prisma.store.update({
            where: {id},
            data: {isActive: false}
        })
    },

    findAllIncludingDeleted: () => {
        return prisma.store.findMany({
            include: {
                category: true
            }
        })
    }
}