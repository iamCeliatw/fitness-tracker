import { Skeleton } from 'fitness-tracker'

// ponytail: sizing via inline styles — compiled Tailwind CSS only has classes used in app src,
// preview-only utilities (h-32, w-3/4) silently no-op

export const TextLines = () => (
  <div style={{ display: 'grid', gap: 8, maxWidth: 320 }}>
    <Skeleton style={{ height: 16, width: '75%' }} />
    <Skeleton style={{ height: 16, width: '100%' }} />
    <Skeleton style={{ height: 16, width: '50%' }} />
  </div>
)

export const WorkoutCard = () => (
  <div style={{ display: 'flex', gap: 12, alignItems: 'center', maxWidth: 320 }}>
    <Skeleton style={{ height: 40, width: 40, borderRadius: '50%' }} />
    <div style={{ display: 'grid', gap: 6, flex: 1 }}>
      <Skeleton style={{ height: 16, width: 128 }} />
      <Skeleton style={{ height: 12, width: 96 }} />
    </div>
  </div>
)

export const ChartPlaceholder = () => (
  <div style={{ display: 'grid', gap: 10, maxWidth: 360 }}>
    <Skeleton style={{ height: 20, width: 160 }} />
    <Skeleton style={{ height: 128, width: '100%', borderRadius: 10 }} />
  </div>
)
