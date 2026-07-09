import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  Button,
  Input,
  Label,
} from 'fitness-tracker'

export const SlotDetail = () => (
  <Sheet open>
    <SheetContent side="right">
      <SheetHeader>
        <SheetTitle>預約時段詳情</SheetTitle>
        <SheetDescription>2026/07/12（日）10:00–11:00 · 陳教練</SheetDescription>
      </SheetHeader>
      <div style={{ display: 'grid', gap: 12, padding: '0 16px' }}>
        <div style={{ display: 'grid', gap: 6 }}>
          <Label htmlFor="student">學員</Label>
          <Input id="student" defaultValue="王小美" readOnly />
        </div>
        <div style={{ display: 'grid', gap: 6 }}>
          <Label htmlFor="focus">訓練重點</Label>
          <Input id="focus" defaultValue="下肢：深蹲 / 硬舉" />
        </div>
      </div>
      <SheetFooter>
        <Button>確認預約</Button>
        <Button variant="outline">取消時段</Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
)
