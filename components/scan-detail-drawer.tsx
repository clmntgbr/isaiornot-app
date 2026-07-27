"use client"

import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer"
import {
  getScanDisplayName,
  getInsightEntries,
} from "@/lib/scan/config"
import { useScan } from "@/lib/scan/context"
import type { Scan } from "@/lib/scan/types"
import { CircleAlert } from "lucide-react"
import { useEffect, useState } from "react"
import { InsightRow } from "./insight-row"
import { VerdictGauge } from "./verdict-gauge"

interface ScanDetailDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  scanId: string
}

export function ScanDetailDrawer({
  open,
  onOpenChange,
  scanId,
}: ScanDetailDrawerProps) {
  const { fetchScan } = useScan()
  const [item, setItem] = useState<Scan | null>(null)

  useEffect(() => {
    if (!open || !scanId) return

    let cancelled = false

    fetchScan(scanId).then((scan) => {
      if (!cancelled) setItem(scan)
    })

    return () => {
      cancelled = true
    }
  }, [open, scanId, fetchScan])

  const insights = item?.insight ? getInsightEntries(item.insight) : []
  const isFailed = item?.status === "failed"

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="flex h-full w-[40vw]! max-w-[40vw]! flex-col gap-0 overflow-hidden p-6">
        <DrawerTitle className="sr-only">
          {item ? getScanDisplayName(item) : "Détail de l'analyse"}
        </DrawerTitle>
        {item &&
          (isFailed ? (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <CircleAlert className="size-7" />
              </div>
              <div className="space-y-2">
                <p className="font-display text-lg font-bold">
                  Analyse échouée
                </p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  {item.message ??
                    "L'analyse n'a pas pu être terminée. Veuillez réessayer."}
                </p>
              </div>
              {item.filename && (
                <p className="text-xs text-muted-foreground">{item.filename}</p>
              )}
            </div>
          ) : (
            <>
              <VerdictGauge verdict={item.verdict} score={item.finalScore} />
              <div className="grid grid-cols-2 gap-4">
                {insights.map((insight) => (
                  <InsightRow
                    key={insight.key}
                    label={insight.label}
                    value={insight.value}
                    description={insight.description}
                    help={insight.help}
                  />
                ))}
              </div>
            </>
          ))}
      </DrawerContent>
    </Drawer>
  )
}
