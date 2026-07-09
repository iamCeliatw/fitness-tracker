import { Tabs, TabsList, TabsTrigger, TabsContent } from 'fitness-tracker'

export const MuscleGroupFilter = () => (
  <Tabs defaultValue="chest" style={{ width: 360 }}>
    <TabsList>
      <TabsTrigger value="all">全部</TabsTrigger>
      <TabsTrigger value="chest">胸</TabsTrigger>
      <TabsTrigger value="back">背</TabsTrigger>
      <TabsTrigger value="legs">腿</TabsTrigger>
      <TabsTrigger value="shoulders">肩</TabsTrigger>
      <TabsTrigger value="arms">手臂</TabsTrigger>
    </TabsList>
    <TabsContent value="chest">
      <ul style={{ margin: 0, paddingLeft: 20, display: 'grid', gap: 4 }}>
        <li>槓鈴臥推</li>
        <li>上斜啞鈴臥推</li>
        <li>繩索飛鳥</li>
      </ul>
    </TabsContent>
  </Tabs>
)

export const RangeSwitch = () => (
  <Tabs defaultValue="30" style={{ width: 280 }}>
    <TabsList variant="line">
      <TabsTrigger value="30">近 30 天</TabsTrigger>
      <TabsTrigger value="90">近 90 天</TabsTrigger>
    </TabsList>
    <TabsContent value="30">體重趨勢：72.4 kg（-0.8 kg）</TabsContent>
  </Tabs>
)

export const OrgOnboarding = () => (
  <Tabs defaultValue="create" style={{ width: 320 }}>
    <TabsList style={{ width: '100%' }}>
      <TabsTrigger value="create">建立組織</TabsTrigger>
      <TabsTrigger value="join">加入組織</TabsTrigger>
    </TabsList>
    <TabsContent value="create">
      建立你的健身房或工作室，成為組織擁有者。
    </TabsContent>
  </Tabs>
)
