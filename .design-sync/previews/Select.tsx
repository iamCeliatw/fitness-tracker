import {
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'fitness-tracker'

const mealItems = [
  { value: 'BREAKFAST', label: '早餐' },
  { value: 'LUNCH', label: '午餐' },
  { value: 'DINNER', label: '晚餐' },
  { value: 'SNACK', label: '點心' },
]

// ponytail: popup won't render statically without `open`; closed trigger states only
export const MealType = () => (
  <div style={{ display: 'grid', gap: 6, maxWidth: 240 }}>
    <Label htmlFor="meal">餐別</Label>
    <Select items={mealItems} defaultValue="LUNCH">
      <SelectTrigger id="meal" style={{ width: '100%' }}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {mealItems.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
)

export const PlaceholderState = () => (
  <div style={{ display: 'grid', gap: 6, maxWidth: 240 }}>
    <Label htmlFor="muscle">目標肌群</Label>
    <Select
      items={[
        { value: 'CHEST', label: '胸' },
        { value: 'BACK', label: '背' },
        { value: 'LEGS', label: '腿' },
      ]}
    >
      <SelectTrigger id="muscle" style={{ width: '100%' }}>
        <SelectValue placeholder="選擇肌群" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="CHEST">胸</SelectItem>
        <SelectItem value="BACK">背</SelectItem>
        <SelectItem value="LEGS">腿</SelectItem>
      </SelectContent>
    </Select>
  </div>
)

export const SizesAndDisabled = () => (
  <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
    <Select items={mealItems} defaultValue="BREAKFAST">
      <SelectTrigger size="sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {mealItems.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    <Select items={mealItems} defaultValue="DINNER" disabled>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {mealItems.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
)
