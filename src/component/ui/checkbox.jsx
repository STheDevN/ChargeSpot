import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "@radix-ui/react-icons"
import PropTypes from "prop-types" // For runtime prop validation

import { cn } from "../../lib/utils.js"

const Checkbox = React.forwardRef(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-foreground/30 hover:border-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <CheckIcon className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName
Checkbox.propTypes = {
  className: PropTypes.string,
}


// Wrapper component that includes a label with primary text color
const CheckboxWithText = React.forwardRef(({ className, label, labelClassName, ...props }, ref) => (
  <div className="flex items-center space-x-2">
    <Checkbox ref={ref} id={props.id} className={className} {...props} />
    <label
      htmlFor={props.id}
      className={cn("text-sm font-medium text-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", labelClassName)}
    >
      {label}
    </label>
  </div>
))
CheckboxWithText.displayName = "CheckboxWithText"
CheckboxWithText.propTypes = {
  className: PropTypes.string,
  label: PropTypes.string.isRequired,
  labelClassName: PropTypes.string,
  id: PropTypes.string,
}


export { Checkbox, CheckboxWithText }