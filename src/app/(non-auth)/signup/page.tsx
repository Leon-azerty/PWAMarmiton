'use client'

import SubmitButton from '@/app/common/submitButton'
import { loginSchema } from '@/app/common/type'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@ui/card'
import { Input } from '@ui/input'
import { useActionState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import signUp from './action'

export default function Home() {
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const [state, formAction] = useActionState(signUp, null)

  useEffect(() => {
    if (state) {
      if (state.type === 'error') {
        toast.error(state.message)
      }
    }
  })

  return (
    <Form {...form}>
      <form action={formAction} className="space-y-8">
        <Card className="mx-auto w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Sign up</CardTitle>
            <CardDescription>
              Enter your information to create an account.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
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
                    <FormLabel htmlFor="password">Password</FormLabel>
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
          </CardContent>
          <CardFooter>
            <SubmitButton text="Sign up" className="w-full" />
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
