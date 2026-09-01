import type { ReactNode } from "react"

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <header className="border-b border-[var(--st-border)] pb-8">

      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

        <div className="max-w-3xl">

          {eyebrow && (
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-10 bg-[var(--accent-gradient)]" />

              <span className="eyebrow">
                {eyebrow}
              </span>
            </div>
          )}

          <h1 className="display text-[34px] leading-[1.06] tracking-[-0.045em] text-[var(--st-text)] sm:text-[40px] md:text-[44px]">
            {title}
          </h1>

          {description && (
            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[var(--st-text-muted)]">
              {description}
            </p>
          )}

        </div>

        {actions && (
          <div className="flex shrink-0 items-center gap-2">
            {actions}
          </div>
        )}

      </div>

    </header>
  )
}
