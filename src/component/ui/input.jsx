import * as React from "react"
import PropTypes from "prop-types" // For runtime prop validation

import { cn } from "../../lib/utils.js"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-foreground/20 bg-transparent px-4 py-1 text-base text-foreground shadow-sm transition-colors hover:border-foreground/30 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-primary-foreground placeholder:text-foreground/50 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-border focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

Input.propTypes = {
  className: PropTypes.string,
  type: PropTypes.string,
}

export { Input }