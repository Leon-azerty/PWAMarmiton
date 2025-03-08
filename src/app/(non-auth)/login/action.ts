'use server'

import { encrypt } from '@/lib/session'
import { FormResult, loginSchema } from '@common/type'
import prisma from '@lib/prisma'
import { compareSync } from 'bcrypt-ts'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const duration = 120
const second = 1000

export async function Login(prevState: any, formData: FormData) {
  const { email, password } = loginSchema.parse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!email || !password)
    return {
      message: 'Email and password are required',
      type: 'error',
    } as FormResult

  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  })

  if (!user) return { message: 'User not found', type: 'error' } as FormResult

  if (!compareSync(password, user.password))
    return { message: 'Invalid password', type: 'error' } as FormResult

  const expires = new Date(Date.now() + duration * second)
  const session = await encrypt({ user, expires })

  const cookiesStore = await cookies()
  cookiesStore.set(process.env.SESSION_NAME!, session, {
    expires,
    httpOnly: true,
  })
  revalidatePath('/', 'layout')
  redirect('/')
}
