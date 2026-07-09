import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  Badge,
} from 'fitness-tracker'

export const WorkoutSets = () => (
  <Table>
    <TableCaption>2026/07/08 胸推日 訓練紀錄</TableCaption>
    <TableHeader>
      <TableRow>
        <TableHead>動作</TableHead>
        <TableHead>組數</TableHead>
        <TableHead>重量</TableHead>
        <TableHead>次數</TableHead>
        <TableHead style={{ textAlign: 'right' }}>訓練量</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell>槓鈴臥推</TableCell>
        <TableCell>4</TableCell>
        <TableCell>80 kg</TableCell>
        <TableCell>8</TableCell>
        <TableCell style={{ textAlign: 'right' }}>2,560 kg</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>上斜啞鈴臥推</TableCell>
        <TableCell>3</TableCell>
        <TableCell>26 kg</TableCell>
        <TableCell>10</TableCell>
        <TableCell style={{ textAlign: 'right' }}>780 kg</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>繩索飛鳥</TableCell>
        <TableCell>3</TableCell>
        <TableCell>15 kg</TableCell>
        <TableCell>12</TableCell>
        <TableCell style={{ textAlign: 'right' }}>540 kg</TableCell>
      </TableRow>
    </TableBody>
    <TableFooter>
      <TableRow>
        <TableCell colSpan={4}>總訓練量</TableCell>
        <TableCell style={{ textAlign: 'right' }}>3,880 kg</TableCell>
      </TableRow>
    </TableFooter>
  </Table>
)

export const AuditLogs = () => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>時間</TableHead>
        <TableHead>操作者</TableHead>
        <TableHead>動作</TableHead>
        <TableHead>資源</TableHead>
        <TableHead>狀態</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell>07/08 14:32</TableCell>
        <TableCell>陳小美（教練）</TableCell>
        <TableCell>INSERT</TableCell>
        <TableCell>AppointmentSlot</TableCell>
        <TableCell><Badge variant="secondary">已建立</Badge></TableCell>
      </TableRow>
      <TableRow>
        <TableCell>07/08 15:01</TableCell>
        <TableCell>王大力（學員）</TableCell>
        <TableCell>UPDATE</TableCell>
        <TableCell>Appointment</TableCell>
        <TableCell><Badge>已預約</Badge></TableCell>
      </TableRow>
      <TableRow>
        <TableCell>07/08 18:45</TableCell>
        <TableCell>林阿哲（學員）</TableCell>
        <TableCell>UPDATE</TableCell>
        <TableCell>Appointment</TableCell>
        <TableCell><Badge variant="destructive">已取消</Badge></TableCell>
      </TableRow>
    </TableBody>
  </Table>
)
