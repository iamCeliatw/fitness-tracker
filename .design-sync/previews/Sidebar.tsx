import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarInset,
  SidebarTrigger,
  SidebarSeparator,
  Avatar,
  AvatarFallback,
} from 'fitness-tracker'

export const AppShell = () => (
  <SidebarProvider defaultOpen style={{ minHeight: 552, height: 552, overflow: 'hidden' }}>
    {/* preview-only: the fixed sidebar container is h-svh, which overflows the card's padded cell */}
    <style>{`[data-slot=sidebar-container]{height:calc(100svh - 72px) !important}`}</style>
    <Sidebar>
      <SidebarHeader>
        <div style={{ padding: '4px 8px', fontWeight: 700, fontSize: 15 }}>
          Fitness Tracker
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>訓練</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive>訓練日誌</SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>體重追蹤</SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>飲食記錄</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>教練</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>預約時段</SidebarMenuButton>
                <SidebarMenuBadge>3</SidebarMenuBadge>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>我的學員</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px' }}>
          <Avatar size="sm">
            <AvatarFallback>陳</AvatarFallback>
          </Avatar>
          <span style={{ fontSize: 13 }}>陳小美 教練</span>
        </div>
      </SidebarFooter>
    </Sidebar>
    <SidebarInset>
      <header style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderBottom: '1px solid var(--border)' }}>
        <SidebarTrigger />
        <span style={{ fontWeight: 600, fontSize: 14 }}>訓練日誌</span>
      </header>
      <div style={{ padding: 24 }}>
        <p style={{ fontSize: 14, opacity: 0.7 }}>
          2026/07/08 胸推日 · 5 個動作 · 總訓練量 4,860 kg
        </p>
      </div>
    </SidebarInset>
  </SidebarProvider>
)
