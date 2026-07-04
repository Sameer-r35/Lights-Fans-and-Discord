import * as React from "react"

function Badge({ className = "", variant = "default", ...props }) {
  const base = "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
  const variants = {
    default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
    destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
  }
  return (
    <div className={`${base} ${variants[variant]} ${className}`} {...props} />
  )
}
export { Badge }
