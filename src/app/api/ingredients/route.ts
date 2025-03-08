import prisma from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Initialisation du client Supabase
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

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
