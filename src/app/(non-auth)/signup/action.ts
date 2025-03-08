'use server'

import { FormResult, loginSchema } from '@/app/common/type'
import prisma from '@lib/prisma'
import { genSaltSync, hashSync } from 'bcrypt-ts'
import { redirect } from 'next/navigation'

export default async function signUp(prevState: any, formData: FormData) {
  try {
    const { email, password } = loginSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    })

    if (!email || !password) {
      return {
        message: 'Please fill all fields',
        type: 'error',
      } as FormResult
    }

    const salt = genSaltSync(10)
    const hash = hashSync(password, salt)

    const user = await prisma.user.create({
      data: {
        email,
        password: hash,
      },
    })

    if (!user) {
      return {
        message: 'Error during User creation',
        type: 'error',
      } as FormResult
    }
  } catch (error) {
    return {
      message: 'Internal Server Error : ' + error,
      type: 'error',
    } as FormResult
  }
  redirect('/login')
}
