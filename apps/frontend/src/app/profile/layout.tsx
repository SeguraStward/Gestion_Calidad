import { AppSidebar } from '@/app/(components)/ui/app-sidebar'
import { SidebarProvider } from '@una-gc/ui/components/sidebar'
import { ReactNode } from 'react'

const ProfileLayout = ({ children }: { children: ReactNode }) => {
  return (
    <SidebarProvider>
      <AppSidebar>{children}</AppSidebar>
    </SidebarProvider>
  )
}
export default ProfileLayout
