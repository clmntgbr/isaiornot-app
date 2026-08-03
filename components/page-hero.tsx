import { cn } from "@/lib/utils"
import { Sparkles } from "lucide-react"

interface PageHeroProps {
  /** Text shown in the pill badge above the title. */
  badge: React.ReactNode
  /** Icon rendered in the badge (defaults to Sparkles). */
  icon?: React.ComponentType<{ className?: string }>
  /** Leading, non-highlighted part of the title. */
  title: React.ReactNode
  /** Gradient-highlighted part of the title. */
  highlight: React.ReactNode
  /**
   * When true the highlighted part flows inline with the title;
   * otherwise it is rendered on its own line.
   */
  highlightInline?: boolean
  /** Optional subtitle paragraph under the title. */
  subtitle?: React.ReactNode
  /** Extra content rendered at the bottom of the hero (e.g. a toggle). */
  children?: React.ReactNode
}

export function PageHero({
  badge,
  icon: Icon = Sparkles,
  title,
  highlight,
  highlightInline = false,
  subtitle,
  children,
}: PageHeroProps) {
  return (
    <section className="relative flex flex-col items-center gap-6 py-12 text-center sm:gap-8 sm:py-16">
      <div className="bg-grid mask-fade-b pointer-events-none absolute inset-0 -z-10 opacity-40" />
      <div
        className="pointer-events-none absolute top-0 left-1/2 -z-10 size-120 -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        style={{
          background: "radial-gradient(circle, var(--primary), transparent 70%)",
        }}
      />

      <div className="animate-fade-in inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-muted-foreground">
        <Icon className="size-3 text-primary" />
        {badge}
      </div>

      <h1 className="font-display animate-slide-up max-w-2xl text-3xl leading-tight font-extrabold tracking-tight text-balance text-foreground sm:text-5xl">
        {title}
        {highlightInline ? " " : null}
        <span
          className={cn(
            "bg-linear-to-r from-sky-400 via-indigo-500 to-purple-500 bg-clip-text text-transparent",
            !highlightInline && "mt-1 block"
          )}
        >
          {highlight}
        </span>
      </h1>

      {subtitle && (
        <p
          className="animate-slide-up max-w-xl text-balance text-muted-foreground sm:text-lg"
          style={{ animationDelay: "0.05s" }}
        >
          {subtitle}
        </p>
      )}

      {children}
    </section>
  )
}
