import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
  Button,
  Badge,
} from 'fitness-tracker'

export const WorkoutSummary = () => (
  <Card style={{ maxWidth: 360 }}>
    <CardHeader>
      <CardTitle>胸推日</CardTitle>
      <CardDescription>2026/07/08 · 5 個動作 · 52 分鐘</CardDescription>
      <CardAction>
        <Badge variant="secondary">已完成</Badge>
      </CardAction>
    </CardHeader>
    <CardContent>
      <p>槓鈴臥推 4 組 × 8 下（80kg），上斜啞鈴臥推 3 組 × 10 下（26kg），總訓練量 4,860kg。</p>
    </CardContent>
    <CardFooter>
      <Button variant="outline" size="sm">查看細節</Button>
    </CardFooter>
  </Card>
)

export const StatCard = () => (
  <Card style={{ maxWidth: 240 }}>
    <CardContent>
      <p style={{ fontSize: 12, marginBottom: 4 }}>本週體重</p>
      <p style={{ fontSize: 28, fontWeight: 700, lineHeight: 1 }}>72.4 kg</p>
      <p style={{ fontSize: 12, marginTop: 4 }}>較上週 −0.6 kg</p>
    </CardContent>
  </Card>
)
