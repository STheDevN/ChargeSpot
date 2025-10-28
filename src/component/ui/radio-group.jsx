import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { DotFilledIcon } from "@radix-ui/react-icons"
import PropTypes from "prop-types" // For runtime prop validation

import { cn } from "../../lib/utils.js"

const RadioGroup = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-2", className)}
      {...props}
      ref={ref}
    />
  )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName
RadioGroup.propTypes = {
  className: PropTypes.string,
}

const RadioGroupItem = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 data-[state=checked]:border-primary data-[state=checked]:bg-primary disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <DotFilledIcon className="h-3.5 w-3.5 fill-primary-foreground text-primary-foreground" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName
RadioGroupItem.propTypes = {
  className: PropTypes.string,
}

export { RadioGroup, RadioGroupItem }