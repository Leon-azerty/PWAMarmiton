'use client'

import { ModeToggle } from '@/app/common/modeToggle'
import SubmitButton from '@/app/common/submitButton'
import { loginSchema } from '@/app/common/type'
import { Button } from '@/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/card'
import { Input } from '@ui/input'
import Link from 'next/link'
import { useActionState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Login } from './action'

export default function Home() {
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const [state, formAction] = useActionState(Login, null)

  useEffect(() => {
    if (state) {
      if (state.type === 'error') {
        toast.error(state.message)
        state.type = undefined
      }
    }
  })

  return (
    <>
      <ModeToggle />
      <Link href="/">
        <Button>Unauth access</Button>
      </Link>
      <Form {...form}>
        <form action={formAction} className="space-y-8">
          <Card className="mx-auto max-w-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Login</CardTitle>
              <CardDescription>
                Enter your email below to login to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="email">Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="m@example.com"
                            {...field}
                            id="email"
                            type="email"
                            required
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-2">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center">
                          <FormLabel htmlFor="password">Password</FormLabel>
                          <Link
                            href="/reset-password"
                            className="ml-auto inline-block text-sm underline"
                          >
                            Forgot your password?
                          </Link>
                        </div>
                        <FormControl>
                          <Input
                            placeholder="******"
                            {...field}
                            id="password"
                            type="password"
                            required
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <SubmitButton text="Login" className="w-full" />
              </div>
              <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="underline">
                  Sign up
                </Link>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </>
  )
}
