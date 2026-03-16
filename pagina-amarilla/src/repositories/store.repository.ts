import {prisma} from '@/lib/prisma'

export const storeRepository = {
    
    findAll: () => {
        return prisma.store.findMany({
            include: {
                category: true
            }
        })
    }
}