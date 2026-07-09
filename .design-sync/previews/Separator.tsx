import { Separator } from 'fitness-tracker'

export const Horizontal = () => (
  <div style={{ maxWidth: 320 }}>
    <div style={{ display: 'grid', gap: 4 }}>
      <p className="text-sm font-medium">今日訓練</p>
      <p className="text-sm text-muted-foreground">槓鈴臥推 4 組、深蹲 5 組</p>
    </div>
    <Separator className="my-4" />
    <div style={{ display: 'grid', gap: 4 }}>
      <p className="text-sm font-medium">今日飲食</p>
      <p className="text-sm text-muted-foreground">2,180 kcal・蛋白質 156g</p>
    </div>
  </div>
)

export const Vertical = () => (
  <div style={{ display: 'flex', gap: 16, alignItems: 'center', height: 40 }}>
    <span className="text-sm">體重 72.4 kg</span>
    <Separator orientation="vertical" />
    <span className="text-sm">體脂 18.2%</span>
    <Separator orientation="vertical" />
    <span className="text-sm">肌肉量 34.6 kg</span>
  </div>
)
