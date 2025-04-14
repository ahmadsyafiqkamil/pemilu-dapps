import { cn } from "@/libs/utils"
import { HTMLAttributes } from "react"

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    />
  )
}

Card.Header = function CardHeader({
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  )
}

Card.Title = function CardTitle({
  className,
  ...props
}: CardProps) {
  return (
    <h3
      className={cn(
        "text-2xl font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    />
  )
}

Card.Description = function CardDescription({
  className,
  ...props
}: CardProps) {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

Card.Content = function CardContent({
  className,
  ...props
}: CardProps) {
  return (
    <div className={cn("p-6 pt-0", className)} {...props} />
  )
}

Card.Footer = function CardFooter({
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  )
} 