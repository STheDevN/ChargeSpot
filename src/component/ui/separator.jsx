import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"
import { cva } from "class-variance-authority"
import PropTypes from "prop-types" // For runtime prop validation

import { cn } from "../../lib/utils.js"

const separatorVariants = cva("shrink-0", {
  variants: {
    variant: {
      default: "bg-foreground/15",
      primary: "bg-primary/30",
      secondary: "bg-secondary/15",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

const Separator = React.forwardRef(
  ({ className, orientation = "horizontal", decorative = true, variant, ...props }, ref) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        separatorVariants({ variant }),
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  )
)
Separator.displayName = SeparatorPrimitive.Root.displayName

Separator.propTypes = {
  className: PropTypes.string,
  orientation: PropTypes.oneOf(["horizontal", "vertical"]),
  decorative: PropTypes.bool,
  variant: PropTypes.oneOf(["default", "primary", "secondary"]),
}

export { Separator }