import { SidebarProvider, SidebarTrigger } from '@/ui/sidebar'
import type { Metadata } from 'next'
import '../globals.css'
import ServiceWorkerListener from './common/ServiceWorkerListener/ServiceWorkerListener'
import { AppSidebar } from './components/appSidebar'

export const metadata: Metadata = {
  title: 'PWA Marmiton',
  description: 'Epitech PWA project',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarTrigger />
      <main className="flex w-full justify-center">{children}</main>
      <ServiceWorkerListener />
    </SidebarProvider>
  )
}
