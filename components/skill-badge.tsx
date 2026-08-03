import { PillBadge } from "@/components/pill-badge"
import type { Quota } from "@/lib/plan/types"
import { CircleCheck, Lock } from "lucide-react"

interface SkillBadgeProps {
  label: string
  included: boolean
}

export function SkillBadge({ label, included }: SkillBadgeProps) {
  return (
    <PillBadge
      icon={included ? CircleCheck : Lock}
      className={
        included
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          : "border-border bg-card text-muted-foreground"
      }
    >
      {label}
    </PillBadge>
  )
}

interface PlanSkillsProps {
  quota: Quota
  className?: string
}

export function PlanSkills({ quota, className }: PlanSkillsProps) {
  return (
    <div className={className ?? "flex flex-wrap gap-2"}>
      <SkillBadge label="Full pipeline" included={quota.fullPipeline} />
      <SkillBadge
        label="Image scans"
        included={quota.maxImagesPerMonth > 0}
      />
      <SkillBadge
        label="Video scans"
        included={quota.maxVideosPerMonth > 0}
      />
    </div>
  )
}
