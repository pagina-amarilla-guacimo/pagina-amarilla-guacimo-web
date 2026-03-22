import { NextResponse } from 'next/server'
import { storeService } from '@/services/store.service'

const ALLOWED_DISTRICTS = ['Guácimo', 'Pocora', 'Río Jiménez'] as const

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
    const storeId = Number(id)
    if (Number.isNaN(storeId)) {
      return NextResponse.json({ error: 'ID de comercio inválido' }, { status: 400 })
    }

    const body = await request.json()
    const {
      name,
      description,
      phoneNumber,
      district,
      location,
      image,
      categoryId,
    } = body

    if (!name || !description || !phoneNumber || !district || !location || !categoryId) {
      return NextResponse.json({ error: 'Todos los campos obligatorios deben completarse' }, { status: 400 })
    }

    if (!ALLOWED_DISTRICTS.includes(district)) {
      return NextResponse.json({ error: 'Distrito inválido' }, { status: 400 })
    }

    const parsedCategoryId = Number(categoryId)
    if (Number.isNaN(parsedCategoryId) || parsedCategoryId <= 0) {
      return NextResponse.json({ error: 'Categoría inválida' }, { status: 400 })
    }

    const payload = {
      name: String(name).trim(),
      description: String(description).trim(),
      phoneNumber: String(phoneNumber).trim(),
      district,
      location: String(location).trim(),
      image: image ? String(image).trim() : undefined,
      categoryId: parsedCategoryId,
    }

    const store = await storeService.update(storeId, payload)
    return NextResponse.json(store)
  } catch (error) {
    console.error('Error al actualizar comercio:', error)

    if (typeof error === 'object' && error && 'code' in error) {
      const prismaError = error as { code?: string }
      if (prismaError.code === 'P2025') {
        return NextResponse.json({ error: 'Comercio no encontrado' }, { status: 404 })
      }
      if (prismaError.code === 'P2003') {
        return NextResponse.json({ error: 'La categoría seleccionada no existe' }, { status: 400 })
      }
    }

    return NextResponse.json({ error: 'Error al actualizar comercio' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const store = await storeService.delete(Number(id))
    return NextResponse.json({ message: 'Comercio eliminado correctamente', store })
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar el comercio' }, { status: 500 })
  }
}