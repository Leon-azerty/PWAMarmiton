import prisma from '@lib/prisma'
import { compareSync } from 'bcrypt-ts'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const secretKey = 'secret'
const key = new TextEncoder().encode(secretKey)

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const DURATION = 6 * DAY

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${DURATION} sec from now`)
    .sign(key)
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ['HS256'],
  })
  return payload
}

// --------------------------------------------------

export async function login({
  email,
  password,
}: {
  email: string
  password: string
}) {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  if (!compareSync(password, user.password)) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const expires = new Date(Date.now() + DURATION)
  const session = await encrypt({ user, expires })

  const cookiesStore = await cookies()
  cookiesStore.set(process.env.SESSION_NAME!, session, {
    expires,
    httpOnly: true,
  })
}

// --------------------------------------------------

export async function logout() {
  // Destroy the session
  const cookiesStore = await cookies()
  cookiesStore.set(process.env.SESSION_NAME!, '', { expires: new Date(0) })
}

export async function verifySession() {
  const cookiesStore = await cookies()
  const session = cookiesStore.get(process.env.SESSION_NAME!)?.value
  if (!session) return null
  return await decrypt(session)
}

export async function updateSession(request: NextRequest) {
  const cookiesStore = await cookies()
  const session = cookiesStore.get(process.env.SESSION_NAME!)?.value
  if (!session)
    return NextResponse.json({ error: 'pas de session' }, { status: 401 })
  NextResponse.json({ error: 'session active ' }, { status: 401 })

  // Refresh the session so it doesn't expire
  const parsed = await decrypt(session)
  parsed.expires = new Date(Date.now() + DURATION)
  const res = NextResponse.next()
  res.cookies.set({
    name: process.env.SESSION_NAME!,
    value: await encrypt(parsed),
    httpOnly: true,
    expires: parsed.expires,
  })
  return res
}
