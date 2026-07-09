import { Input, Label } from 'fitness-tracker'

export const WithLabel = () => (
  <div style={{ display: 'grid', gap: 6, maxWidth: 280 }}>
    <Label htmlFor="weight">體重（kg）</Label>
    <Input id="weight" type="number" defaultValue="72.4" />
  </div>
)

export const Placeholder = () => (
  <div style={{ display: 'grid', gap: 6, maxWidth: 280 }}>
    <Label htmlFor="exercise-search">搜尋動作</Label>
    <Input id="exercise-search" placeholder="例：槓鈴臥推" />
  </div>
)

export const States = () => (
  <div style={{ display: 'grid', gap: 12, maxWidth: 280 }}>
    <Input defaultValue="18.2" aria-invalid />
    <Input defaultValue="儲存中…" disabled />
  </div>
)

export const Types = () => (
  <div style={{ display: 'grid', gap: 12, maxWidth: 280 }}>
    <Input type="date" defaultValue="2026-07-09" />
    <Input type="password" defaultValue="password123" />
  </div>
)
