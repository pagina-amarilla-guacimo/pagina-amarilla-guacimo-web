import { storeRepository } from "../repositories/store.repository";

export const storeService = {
    getAll: () => {
        return storeRepository.findAll()
    }
}