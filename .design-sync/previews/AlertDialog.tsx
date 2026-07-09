import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from 'fitness-tracker'

export const DeleteRecord = () => (
  <AlertDialog open>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>確認刪除</AlertDialogTitle>
        <AlertDialogDescription>
          此操作無法復原，確定要刪除這筆量測記錄嗎？
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>取消</AlertDialogCancel>
        <AlertDialogAction variant="destructive">刪除</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)
