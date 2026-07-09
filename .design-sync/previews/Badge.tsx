import { Badge } from 'fitness-tracker'

export const Variants = () => (
  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
    <Badge>default</Badge>
    <Badge variant="secondary">secondary</Badge>
    <Badge variant="destructive">destructive</Badge>
    <Badge variant="outline">outline</Badge>
    <Badge variant="ghost">ghost</Badge>
    <Badge variant="link">link</Badge>
  </div>
)

export const BookingStatus = () => (
  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
    <Badge>已預約</Badge>
    <Badge variant="secondary">已完成</Badge>
    <Badge variant="destructive">已取消</Badge>
    <Badge variant="outline">可預約</Badge>
  </div>
)

export const MuscleGroups = () => (
  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
    <Badge variant="outline">胸</Badge>
    <Badge variant="outline">背</Badge>
    <Badge variant="outline">腿</Badge>
    <Badge variant="outline">肩</Badge>
    <Badge variant="outline">核心</Badge>
  </div>
)
