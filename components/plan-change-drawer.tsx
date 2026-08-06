"use client"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import type { SubscriptionPreview } from "@/lib/subscription/types"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface PlanChangeDrawerProps {
  open: boolean
  preview: SubscriptionPreview | null
  isConfirming?: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function PlanChangeDrawer({
  open,
  preview,
  isConfirming = false,
  onOpenChange,
  onConfirm,
}: PlanChangeDrawerProps) {
  const currency = preview?.currency ?? "eur"
  const lines = preview?.lines ?? []

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="flex h-full w-[40vw]! max-w-[40vw]! flex-col gap-0 overflow-hidden p-6">
        <DrawerHeader className="p-0 text-start">
          <DrawerTitle className="font-display text-lg font-bold">
            Confirm plan change
          </DrawerTitle>
          <DrawerDescription>
            {preview?.targetPlanName
              ? `Switch to ${preview.targetPlanName}${
                  preview.targetPlanPrice != null
                    ? ` (${formatMajorPrice(preview.targetPlanPrice, currency)}/month)`
                    : ""
                }. Review the prorated amount below.`
              : "Review the prorated amount before confirming."}
          </DrawerDescription>
        </DrawerHeader>

        <div className="mt-6 flex-1 overflow-y-auto">
          {lines.length > 0 && (
            <ul className="divide-y divide-border/60 rounded-xl border border-border">
              {lines.map((line, index) => (
                <li
                  key={`${line.description}-${index}`}
                  className="flex items-start justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-foreground">{line.description}</p>
                    {line.proration && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Proration
                      </p>
                    )}
                  </div>
                  <span
                    className={cn(
                      "shrink-0 text-sm font-semibold tabular-nums",
                      line.amount < 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-foreground"
                    )}
                  >
                    {formatCents(line.amount, currency)}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
            <span className="text-sm font-medium text-foreground">
              Amount due now
            </span>
            <span className="font-display text-xl font-bold tabular-nums text-foreground">
              {formatCents(preview?.amountDue ?? 0, currency)}
            </span>
          </div>
        </div>

        <DrawerFooter className="mt-6 p-0">
          <Button onClick={onConfirm} disabled={isConfirming || !preview}>
            {isConfirming ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : null}
            Confirm change
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isConfirming}
          >
            Cancel
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function formatCents(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

/** Plan list price from preview (`targetPlanPrice`) is in major units. */
function formatMajorPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}
