import { Home, Inbox, Settings } from 'lucide-react'

import { getUser } from '@/app/common/user'
import { Button } from '@/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/ui/sidebar'
import Link from 'next/link'

export async function AppSidebar() {
  const user = await getUser()

  const items = [
    {
      title: 'Home',
      url: '/',
      icon: Home,
    },
    ...(user
      ? [
          {
            title: 'Favorite',
            url: '/favorite',
            icon: Inbox,
          },
          {
            title: 'Settings',
            url: '/settings',
            icon: Settings,
          },
        ]
      : []),
  ]

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {!user && (
                <Link href="/login">
                  <Button variant="default">Login</Button>
                </Link>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
