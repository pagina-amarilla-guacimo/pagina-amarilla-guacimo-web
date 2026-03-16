import { NextResponse } from 'next/server'
import { storeService } from '@/services/store.service'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const store = await storeService.getById(Number(id))
    if (!store) return NextResponse.json({ error: 'Comercio no encontrado' }, { status: 404 })
    return NextResponse.json(store)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener el comercio' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const store = await storeService.update(Number(id), body)
    return NextResponse.json(store)
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar comercio' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await storeService.delete(Number(id))
    return NextResponse.json({ message: 'Comercio eliminado' })
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar la tienda' }, { status: 500 })
  }
}