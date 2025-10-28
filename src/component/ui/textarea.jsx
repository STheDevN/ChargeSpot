import * as React from "react"
import PropTypes from "prop-types" // For runtime prop validation

import { cn } from "../../lib/utils.js"

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[60px] w-full rounded-md border border-foreground/20 bg-transparent px-3 py-2 text-base text-foreground shadow-sm placeholder:text-foreground/50 hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-border focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

Textarea.propTypes = {
  className: PropTypes.string,
}

export { Textarea }