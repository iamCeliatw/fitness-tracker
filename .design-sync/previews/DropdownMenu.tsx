import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  Button,
} from 'fitness-tracker'

export const AccountMenu = () => (
  <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 24 }}>
    <DropdownMenu open>
      <DropdownMenuTrigger render={<Button variant="outline" />}>
        王小美
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" style={{ minWidth: 200 }}>
        <DropdownMenuGroup>
          <DropdownMenuLabel>我的帳號</DropdownMenuLabel>
          <DropdownMenuItem>個人資料</DropdownMenuItem>
          <DropdownMenuItem>
            訓練設定
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>切換組織</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">登出</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
)
