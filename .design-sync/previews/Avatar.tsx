import {
  Avatar,
  AvatarFallback,
  AvatarBadge,
  AvatarGroup,
  AvatarGroupCount,
} from 'fitness-tracker'

export const Sizes = () => (
  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
    <Avatar size="sm">
      <AvatarFallback>王</AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarFallback>陳</AvatarFallback>
    </Avatar>
    <Avatar size="lg">
      <AvatarFallback>林</AvatarFallback>
    </Avatar>
  </div>
)

export const WithStatusBadge = () => (
  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
    <Avatar>
      <AvatarFallback>教</AvatarFallback>
      <AvatarBadge />
    </Avatar>
    <Avatar size="lg">
      <AvatarFallback>學</AvatarFallback>
      <AvatarBadge />
    </Avatar>
  </div>
)

export const StudentGroup = () => (
  <AvatarGroup>
    <Avatar>
      <AvatarFallback>王</AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarFallback>陳</AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarFallback>林</AvatarFallback>
    </Avatar>
    <AvatarGroupCount>+5</AvatarGroupCount>
  </AvatarGroup>
)
