import { Input, Label, Textarea } from 'fitness-tracker'

export const WithInput = () => (
  <div style={{ display: 'grid', gap: 6, maxWidth: 280 }}>
    <Label htmlFor="muscle-mass">肌肉量（kg）</Label>
    <Input id="muscle-mass" type="number" defaultValue="34.6" />
  </div>
)

export const WithTextarea = () => (
  <div style={{ display: 'grid', gap: 6, maxWidth: 320 }}>
    <Label htmlFor="workout-note">訓練備註</Label>
    <Textarea id="workout-note" placeholder="今天狀態如何？" />
  </div>
)

export const DisabledPeer = () => (
  <div className="group" data-disabled="true" style={{ display: 'grid', gap: 6, maxWidth: 280 }}>
    <Label htmlFor="locked">教練指派課表（唯讀）</Label>
    <Input id="locked" defaultValue="胸推 5x5" disabled />
  </div>
)
