import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await prisma.ingredientList.findMany({
      orderBy: { id: 'desc' },
    })
    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Error occurred while fetching ingredients:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
