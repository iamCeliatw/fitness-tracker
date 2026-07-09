import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
  NavigationMenuContent,
  navigationMenuTriggerStyle,
} from 'fitness-tracker'

export const DashboardNav = () => (
  <NavigationMenu>
    <NavigationMenuList>
      <NavigationMenuItem>
        <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
          總覽
        </NavigationMenuLink>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
          訓練日誌
        </NavigationMenuLink>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
          體重追蹤
        </NavigationMenuLink>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
          預約教練
        </NavigationMenuLink>
      </NavigationMenuItem>
    </NavigationMenuList>
  </NavigationMenu>
)

export const WithDropdown = () => (
  <div style={{ minHeight: 260, paddingBottom: 16 }}>
    <NavigationMenu defaultValue="records">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
            總覽
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem value="records">
          <NavigationMenuTrigger>我的紀錄</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div style={{ display: 'grid', gap: 4, width: 220, padding: 4 }}>
              <NavigationMenuLink href="#">
                <div>
                  <div style={{ fontWeight: 500 }}>訓練日誌</div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>
                    查看每次訓練的組數與重量
                  </div>
                </div>
              </NavigationMenuLink>
              <NavigationMenuLink href="#">
                <div>
                  <div style={{ fontWeight: 500 }}>體重追蹤</div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>
                    體重與體脂率趨勢圖
                  </div>
                </div>
              </NavigationMenuLink>
              <NavigationMenuLink href="#">
                <div>
                  <div style={{ fontWeight: 500 }}>飲食記錄</div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>
                    熱量與三大營養素
                  </div>
                </div>
              </NavigationMenuLink>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
            預約教練
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  </div>
)
