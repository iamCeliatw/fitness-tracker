import { Button } from 'fitness-tracker'

export const Variants = () => (
  <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
    <Button>儲存訓練</Button>
    <Button variant="secondary">加入動作</Button>
    <Button variant="outline">取消</Button>
    <Button variant="ghost">略過</Button>
    <Button variant="destructive">刪除紀錄</Button>
    <Button variant="link">查看全部</Button>
  </div>
)

export const Sizes = () => (
  <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
    <Button size="xs">xs</Button>
    <Button size="sm">新增組數</Button>
    <Button size="default">開始訓練</Button>
    <Button size="lg">完成本次訓練</Button>
  </div>
)

export const Disabled = () => (
  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
    <Button disabled>儲存中…</Button>
    <Button variant="outline" disabled>取消</Button>
  </div>
)
