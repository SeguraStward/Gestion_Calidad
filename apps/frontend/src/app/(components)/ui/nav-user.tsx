'use client'

import { useAuth } from '@/modules/auth/hooks'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@una-gc/ui/components/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@una-gc/ui/components/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@una-gc/ui/components/dropdown-menu'
import { BadgeCheck, Bell, ChevronsUpDown, LogOut } from 'lucide-react'

export function NavUser() {
  const { isMobile } = useSidebar()
  const { user, role, logout } = useAuth()

  if (!user) return null

  const renderAvatar = () => (
    <Avatar className="h-8 w-8 rounded-lg">
      <AvatarImage src={user.photoUrl || `/assets/images/default-profile-image.png`} alt={user.fullName} />
      <AvatarFallback className="rounded-lg">
        {user.fullName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()}
      </AvatarFallback>
    </Avatar>
  )

  const renderUserInfo = () => (
    <div className="grid flex-1 text-left text-sm leading-tight">
      <span className="truncate font-semibold">{user.fullName}</span>
      <span className="truncate text-xs">{user.email}</span>
      {role && <span className="truncate text-xs text-muted-foreground">{role.name}</span>}
    </div>
  )

  const handleLogout = async () => {
    await logout()
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {renderAvatar()}
              {renderUserInfo()}
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                {renderAvatar()}
                {renderUserInfo()}
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleLogout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
