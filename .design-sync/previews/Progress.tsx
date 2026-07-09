import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from 'fitness-tracker'

export const WeeklyGoal = () => (
  <div style={{ maxWidth: 360 }}>
    <Progress value={65}>
      <ProgressLabel>本週訓練目標</ProgressLabel>
      <ProgressValue />
    </Progress>
  </div>
)

export const Levels = () => (
  <div style={{ display: 'grid', gap: 20, maxWidth: 360 }}>
    <Progress value={25}>
      <ProgressLabel>蛋白質攝取</ProgressLabel>
      <ProgressValue />
    </Progress>
    <Progress value={80}>
      <ProgressLabel>每週體重量測</ProgressLabel>
      <ProgressValue />
    </Progress>
    <Progress value={100}>
      <ProgressLabel>本月預約課程</ProgressLabel>
      <ProgressValue />
    </Progress>
  </div>
)

export const TrackOnly = () => (
  <div style={{ maxWidth: 360 }}>
    <Progress value={45} />
  </div>
)
