import { VERDICT_COLOR_VAR } from "@/lib/scan/config"
import { ScanVerdict } from "@/lib/scan/types"
import { ScoreGauge } from "./score-gauge"

interface VerdictGaugeProps {
  verdict: ScanVerdict | undefined
  score: number | undefined
}

export function VerdictGauge({ verdict, score }: VerdictGaugeProps) {
  if (!verdict || score === undefined) return null
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between sm:gap-6">
      <ScoreGauge
        score={score}
        size={130}
        strokeWidth={11}
        colorVar={VERDICT_COLOR_VAR[verdict]}
      />
    </div>
  )
}
