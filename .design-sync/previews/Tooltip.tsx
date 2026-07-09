import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  Button,
} from 'fitness-tracker'

export const MetricHint = () => (
  <TooltipProvider>
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        height: 160,
      }}
    >
      <Tooltip open>
        <TooltipTrigger render={<Button variant="outline" />}>
          體脂率 18.2%
        </TooltipTrigger>
        <TooltipContent side="top">
          以 InBody 量測，較上次 -0.4%
        </TooltipContent>
      </Tooltip>
    </div>
  </TooltipProvider>
)
