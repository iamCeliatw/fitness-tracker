import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Input,
  Label,
} from 'fitness-tracker'

export const EditMeasurement = () => (
  <Dialog open>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>編輯量測紀錄</DialogTitle>
        <DialogDescription>更新 2026/07/08 的身體量測數值。</DialogDescription>
      </DialogHeader>
      <div style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'grid', gap: 6 }}>
          <Label htmlFor="weight">體重（kg）</Label>
          <Input id="weight" defaultValue="72.4" />
        </div>
        <div style={{ display: 'grid', gap: 6 }}>
          <Label htmlFor="bodyfat">體脂率（%）</Label>
          <Input id="bodyfat" defaultValue="18.2" />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline">取消</Button>
        <Button>儲存變更</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)
