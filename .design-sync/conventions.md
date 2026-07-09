# Fitness Tracker DS — usage conventions

React 19 + shadcn/ui components built on **Base UI** (`@base-ui/react`, NOT Radix) with **Tailwind CSS v4** utilities. App content language is zh-TW (Traditional Chinese) — write realistic fitness content (訓練, 體重, 預約) in designs unless asked otherwise.

## Setup & wrapping

- Most components need **no global provider**. Exceptions: wrap `Tooltip` usage in `TooltipProvider`; wrap sidebar layouts in `SidebarProvider` (put page content in `SidebarInset`); mount `<Toaster />` once if toasts are needed.
- **Dark mode**: add class `dark` to a root element — all tokens flip via the `.dark` block in `styles.css`.
- Base UI differences that break silently if ignored:
  - `DropdownMenuLabel` MUST be inside `DropdownMenuGroup`, or the whole menu throws at render.
  - `Select`: `SelectValue` renders the raw value; when value ≠ label, pass `items={[{value, label}, …]}` to `Select`. `onValueChange` receives `string | null`.
  - Overlays render statically/controlled via `open` on the root: `<Dialog open>`, `<Sheet open>`, `<AlertDialog open>`, `<DropdownMenu open>`, `<Tooltip open>`.
  - Triggers compose via the `render` prop, not `asChild`: `<DialogTrigger render={<Button variant="outline" />}>開啟</DialogTrigger>`.

## Styling idiom

Style with Tailwind utilities backed by the DS's semantic tokens. **The shipped `styles.css` is a compiled subset** — it is guaranteed to contain the token-backed semantic utilities below plus the layout/spacing/typography classes the app uses; for anything exotic, prefer inline `style` with `var(--token)` over guessing at a utility that may not be compiled in.

- Surfaces: `bg-background text-foreground`, `bg-card text-card-foreground`, `bg-popover text-popover-foreground`, `bg-sidebar`
- Actions: `bg-primary text-primary-foreground`, `bg-secondary text-secondary-foreground`, `bg-muted text-muted-foreground`, `text-destructive`
- Lines & focus: `border-border`, `border-input` (for accent/focus-ring styling use `var(--accent)` / `var(--ring)` inline — those utilities aren't compiled in)
- Radius: `rounded-lg` (= `--radius`), `rounded-md`, `rounded-xl`
- Charts: CSS vars `--chart-1` … `--chart-5`
- All color tokens are oklch CSS custom properties defined in `styles.css` (`:root` light, `.dark` dark): `--background`, `--foreground`, `--card`, `--popover`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`, `--radius`, `--sidebar`, `--sidebar-primary`, `--sidebar-accent`.

Component look comes from the components themselves (`Button` has `variant`: default / outline / secondary / ghost / destructive / link and `size`: xs / sm / default / lg / icon; `Badge` has `variant`) — don't rebuild their styling with utilities.

## Where the truth lives

- `styles.css` — the full token set and every compiled utility (grep it before using an unusual class).
- `components/general/<Name>/<Name>.d.ts` — the exact props API; `<Name>.prompt.md` — usage notes and examples per component.
- `ChartContainer`/`ChartTooltip`/`ChartLegend` wrap recharts, but recharts primitives (`LineChart` etc.) are NOT bundle exports — only build charts if recharts is available in your runtime; otherwise use stat cards (`Card` + big number) like the app does.

## Idiomatic example

```tsx
<Card style={{ maxWidth: 360 }}>
  <CardHeader>
    <CardTitle>胸推日</CardTitle>
    <CardDescription>2026/07/08 · 5 個動作 · 52 分鐘</CardDescription>
    <CardAction><Badge variant="secondary">已完成</Badge></CardAction>
  </CardHeader>
  <CardContent>
    <p className="text-sm text-muted-foreground">總訓練量 4,860kg</p>
  </CardContent>
  <CardFooter>
    <Button variant="outline" size="sm">查看細節</Button>
  </CardFooter>
</Card>
```
