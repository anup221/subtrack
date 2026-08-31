import type { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

export function Card({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--st-border)]",
        "bg-[var(--st-surface)]",
        "p-6",
        "shadow-[0_1px_2px_rgba(0,0,0,0.10)]",
        "transition-[border-color,background-color,box-shadow,transform]",
        "duration-200",
        "hover:border-[var(--st-border-strong)]",
        className
      )}
      {...props}
    />
  )
}

export function CardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 pb-5",
        className
      )}
      {...props}
    />
  )
}

export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-base font-semibold tracking-[-0.02em]",
        "text-[var(--st-text)]",
        className
      )}
      {...props}
    />
  )
}

export function CardDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-sm leading-6 text-[var(--st-text-muted)]",
        className
      )}
      {...props}
    />
  )
}

export function CardContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        className
      )}
      {...props}
    />
  )
}

export function CardFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mt-6 flex items-center",
        className
      )}
      {...props}
    />
  )
}

export function CardLabel({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-[10px] font-medium uppercase",
        "tracking-[0.16em]",
        "text-[var(--st-text-faint)]",
        className
      )}
      {...props}
    />
  )
}

export function CardValue({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-2xl font-semibold",
        "tracking-[-0.035em]",
        "text-[var(--st-text)]",
        className
      )}
      {...props}
    />
  )
}
