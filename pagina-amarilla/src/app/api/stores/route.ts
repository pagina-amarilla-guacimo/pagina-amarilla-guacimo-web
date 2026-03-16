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

export async function POST(request: Request){
    try{
        const body = await request.json()
        const store = await storeService.create(body)
        return NextResponse.json(store, {status: 201})
    }catch (error){
        return NextResponse.json({error: 'Error al crear comercio'}, {status: 500})
    }
}