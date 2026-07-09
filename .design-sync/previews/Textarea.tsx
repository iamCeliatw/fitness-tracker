import { Label, Textarea } from 'fitness-tracker'

export const WithLabel = () => (
  <div style={{ display: 'grid', gap: 6, maxWidth: 360 }}>
    <Label htmlFor="note">訓練備註</Label>
    <Textarea
      id="note"
      defaultValue={'今天深蹲狀態不錯，最後一組 100kg x 5 完成。\n下次可以試著加到 102.5kg。'}
    />
  </div>
)

export const Placeholder = () => (
  <div style={{ maxWidth: 360 }}>
    <Textarea placeholder="記錄這餐的內容與感受…" />
  </div>
)

export const States = () => (
  <div style={{ display: 'grid', gap: 12, maxWidth: 360 }}>
    <Textarea defaultValue="字數超過上限的飲食備註" aria-invalid />
    <Textarea defaultValue="預約已取消，備註已鎖定" disabled />
  </div>
)
