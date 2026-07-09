import { Calendar } from 'fitness-tracker'

export const SingleDate = () => (
  <Calendar
    mode="single"
    defaultMonth={new Date(2026, 6)}
    selected={new Date(2026, 6, 15)}
  />
)

export const BookingRange = () => (
  <Calendar
    mode="range"
    defaultMonth={new Date(2026, 6)}
    selected={{ from: new Date(2026, 6, 6), to: new Date(2026, 6, 10) }}
  />
)
