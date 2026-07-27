"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CONFIDENCE_CONFIG, VERDICT_CONFIG } from "@/lib/scan/config"
import type {
  ScanConfidence,
  ScanFilters,
  ScanStatus,
  ScanVerdict,
} from "@/lib/scan/types"
import { cn } from "@/lib/utils"
import { Bot, ChevronDown, HelpCircle, ListFilter, ShieldCheck, X } from "lucide-react"
import type { ReactNode } from "react"

const ALL_VALUE = "all"

const VERDICT_OPTIONS: { value: typeof ALL_VALUE | ScanVerdict; label: string }[] =
  [
    { value: ALL_VALUE, label: "Tous" },
    { value: "likely_real", label: VERDICT_CONFIG.likely_real.label },
    { value: "uncertain", label: VERDICT_CONFIG.uncertain.label },
    { value: "likely_ai", label: VERDICT_CONFIG.likely_ai.label },
  ]

const CONFIDENCE_OPTIONS: {
  value: typeof ALL_VALUE | ScanConfidence
  label: string
}[] = [
  { value: ALL_VALUE, label: "Toutes" },
  { value: "high", label: CONFIDENCE_CONFIG.high.short },
  { value: "medium", label: CONFIDENCE_CONFIG.medium.short },
  { value: "low", label: CONFIDENCE_CONFIG.low.short },
]

const STATUS_OPTIONS: { value: typeof ALL_VALUE | ScanStatus; label: string }[] =
  [
    { value: ALL_VALUE, label: "Tous" },
    { value: "processing", label: "En cours" },
    { value: "completed", label: "Terminé" },
    { value: "failed", label: "Échoué" },
  ]

interface ScansFiltersProps {
  filters: ScanFilters
  onChange: (filters: ScanFilters) => void
  disabled?: boolean
}

export function ScansFilters({
  filters,
  onChange,
  disabled = false,
}: ScansFiltersProps) {
  const hasActiveFilters = Boolean(
    filters.verdict || filters.confidence || filters.status
  )

  const updateFilter = <K extends keyof ScanFilters>(
    key: K,
    value: ScanFilters[K] | typeof ALL_VALUE
  ) => {
    const next: ScanFilters = { ...filters }
    if (!value || value === ALL_VALUE) {
      delete next[key]
    } else {
      next[key] = value as ScanFilters[K]
    }
    onChange(next)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <FilterDropdown
        label="Verdict"
        value={filters.verdict ?? ALL_VALUE}
        options={VERDICT_OPTIONS}
        disabled={disabled}
        onChange={(value) =>
          updateFilter(
            "verdict",
            value === ALL_VALUE ? undefined : (value as ScanVerdict)
          )
        }
        renderOption={(option) => {
          if (option.value === "likely_real") {
            return (
              <>
                <ShieldCheck className="size-3.5 text-primary" />
                {option.label}
              </>
            )
          }
          if (option.value === "likely_ai") {
            return (
              <>
                <Bot className="size-3.5 text-destructive" />
                {option.label}
              </>
            )
          }
          if (option.value === "uncertain") {
            return (
              <>
                <HelpCircle className="size-3.5 text-muted-foreground" />
                {option.label}
              </>
            )
          }
          return option.label
        }}
      />

      <FilterDropdown
        label="Confiance"
        value={filters.confidence ?? ALL_VALUE}
        options={CONFIDENCE_OPTIONS}
        disabled={disabled}
        onChange={(value) =>
          updateFilter(
            "confidence",
            value === ALL_VALUE ? undefined : (value as ScanConfidence)
          )
        }
      />

      <FilterDropdown
        label="Statut"
        value={filters.status ?? ALL_VALUE}
        options={STATUS_OPTIONS}
        disabled={disabled}
        onChange={(value) =>
          updateFilter(
            "status",
            value === ALL_VALUE ? undefined : (value as ScanStatus)
          )
        }
      />

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onChange({})}
          className="text-muted-foreground"
        >
          <X className="size-3.5" />
          Réinitialiser
        </Button>
      )}
    </div>
  )
}

function FilterDropdown({
  label,
  value,
  options,
  disabled,
  onChange,
  renderOption,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  disabled?: boolean
  onChange: (value: string) => void
  renderOption?: (option: { value: string; label: string }) => ReactNode
}) {
  const selected = options.find((option) => option.value === value)
  const isActive = value !== ALL_VALUE

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className={cn(isActive && "border-primary/40 bg-primary/5 text-primary")}
        >
          <span className="text-muted-foreground">{label}:</span>
          {selected?.label ?? "Tous"}
          <ChevronDown className="size-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-44">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {renderOption ? renderOption(option) : option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
