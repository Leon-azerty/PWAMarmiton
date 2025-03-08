'use client'

import { Button } from '@/ui/button'
import { LogOut } from 'lucide-react'
import { LogoutAction } from './logout.action'

export default function Logout() {
  return (
    <section>
      <Button onClick={async () => await LogoutAction()}>
        Log out
        <LogOut />
      </Button>
    </section>
  )
}
