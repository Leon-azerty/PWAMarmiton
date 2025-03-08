import OfflineCard from '@/ui/offlineCard'
import { Toaster } from '@/ui/sonner'
import { ModeToggle } from './common/modeToggle'
import { ThemeProvider } from './common/theme-provider'
import './globals.css'

export const metadata = {
  title: 'PWA Marmiton',
  description: 'Epitech project',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  /* remove suppressHydrationWarning will cause warnings because next-themes updates that element.
  This property only applies one level deep, so it won't block hydration
  warnings on other elements. */
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          themes={['system', 'light', 'dark']}
        >
          <OfflineCard />
          {children}
          <div className="fixed bottom-4 right-4">
            <ModeToggle />
          </div>
          <Toaster richColors />
        </ThemeProvider>
        <Toaster richColors />
      </body>
    </html>
  )
}
