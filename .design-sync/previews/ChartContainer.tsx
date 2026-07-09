import { ChartContainer } from 'fitness-tracker'
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'

const weightData = [
  { date: '05/20', weight: 74.8 },
  { date: '05/27', weight: 74.2 },
  { date: '06/03', weight: 73.9 },
  { date: '06/10', weight: 73.4 },
  { date: '06/17', weight: 73.6 },
  { date: '06/24', weight: 72.9 },
  { date: '07/01', weight: 72.6 },
  { date: '07/08', weight: 72.4 },
]

const config = {
  weight: { label: '體重 (kg)', color: '#f97316' },
}

// ponytail: LineChart gets explicit width/height — the preview bundle carries its
// own recharts copy, so ResponsiveContainer's size context (bundle copy) never
// reaches this chart. Fixed dims bypass the context; see learnings/wave1-display.md.
export const WeightTrend = () => (
  <ChartContainer config={config} style={{ width: 480, height: 240 }}>
    <LineChart
      width={480}
      height={240}
      data={weightData}
      margin={{ top: 8, right: 16, left: 0, bottom: 4 }}
    >
      <CartesianGrid strokeDasharray="3 3" vertical={false} />
      <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={11} />
      <YAxis
        tickLine={false}
        axisLine={false}
        fontSize={11}
        domain={['dataMin - 0.5', 'dataMax + 0.5']}
        unit=" kg"
      />
      <Line
        type="monotone"
        dataKey="weight"
        stroke="var(--color-weight)"
        strokeWidth={2}
        dot={{ fill: 'var(--color-weight)', r: 3 }}
        isAnimationActive={false}
      />
    </LineChart>
  </ChartContainer>
)
