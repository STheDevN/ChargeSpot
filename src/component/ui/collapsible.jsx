import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"
import PropTypes from "prop-types" // For runtime prop validation
import { cn } from "../../lib/utils.js"
import React from "react"

const Collapsible = CollapsiblePrimitive.Root

const CollapsibleTrigger = React.forwardRef(({ className, ...props }, ref) => (
  <CollapsiblePrimitive.CollapsibleTrigger
    className={cn(
      "flex items-center justify-center w-full px-4 py-5 text-sm font-medium transition-all rounded-md focus:outline-none",
      "text-primary-foreground bg-primary hover:bg-primary/90",
      className
    )}
    {...props}
    ref={ref}
  />
))
CollapsibleTrigger.displayName = "CollapsibleTrigger"
CollapsibleTrigger.propTypes = {
  className: PropTypes.string,
}


const CollapsibleContent = React.forwardRef(({ className, ...props }, ref) => (
  <CollapsiblePrimitive.CollapsibleContent
    className={cn(
      "overflow-hidden transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down",
      "mt-2 px-4 py-3 text-sm border rounded-md",
      "border-foreground/15 bg-background",
      className
    )}
    {...props}
    ref={ref}
  />
))
CollapsibleContent.displayName = "CollapsibleContent"
CollapsibleContent.propTypes = {
  className: PropTypes.string,
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }