import { PageLoading } from 'fitness-tracker'

// PageLoading renders position:fixed inset-0; the transform on the wrapper
// makes the wrapper its containing block so the overlay stays inside the card.
export const Loading = () => (
  <div
    style={{
      position: 'relative',
      height: 240,
      width: '100%',
      transform: 'translateZ(0)',
      overflow: 'hidden',
      borderRadius: 8,
    }}
  >
    <PageLoading />
  </div>
)
