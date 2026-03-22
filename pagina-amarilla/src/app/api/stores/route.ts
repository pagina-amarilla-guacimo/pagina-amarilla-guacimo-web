import { NextResponse } from "next/server";
import { storeService } from "@/services/store.service";

export async function GET(request: Request) {
    try{
        const { searchParams } = new URL(request.url);
        const includeDeleted = searchParams.get('includeDeleted') === 'true';
        
        const stores = includeDeleted 
            ? await storeService.getAllIncludingDeleted()
            : await storeService.getAll();
        
        return NextResponse.json(stores)
    }catch (error){
        console.error('Error fetching stores:', error);
        return NextResponse.json({error: 'Error al obtener los comercios'}, {status:500 })
    }
}

export async function POST(request: Request){
    try{
        const body = await request.json()
        const store = await storeService.create(body)
        return NextResponse.json(store, {status: 201})
    }catch (error){
        console.error('Error creating store:', error);
        return NextResponse.json({error: 'Error al crear comercio'}, {status: 500})
    }
}