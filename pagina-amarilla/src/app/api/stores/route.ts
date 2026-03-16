import { NextResponse } from "next/server";
import { storeService } from "@/services/store.service";

export async function GET() {
    try{
        const stores = await storeService.getAll()
        return NextResponse.json(stores)
    }catch (error){
        return NextResponse.json({error: 'Error al obtener los comercios'}, {status:500 })
    }
}