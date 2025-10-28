import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import PropTypes from "prop-types" // For runtime prop validation

import { cn } from "../../lib/utils.js"

const Progress = React.forwardRef(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-primary/20 ",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full rounded-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

Progress.propTypes = {
  className: PropTypes.string,
  value: PropTypes.number,
}

export { Progress }