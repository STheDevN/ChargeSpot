import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDownIcon } from "@radix-ui/react-icons"
import PropTypes from "prop-types" // Import prop-types

import { cn } from "../../lib/utils.js"

const Accordion = AccordionPrimitive.Root

const AccordionItem = React.forwardRef(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b border-foreground/15 text-foreground", className)}
    {...props}
  />
))
AccordionItem.displayName = "AccordionItem"
AccordionItem.propTypes = {
  className: PropTypes.string,
}

const AccordionTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 text-base font-medium transition-all hover:underline text-start text-foreground [&[data-state=open]>svg]:rotate-180 [&[data-state=open]>svg]:text-primary data-[state=open]:text-primary",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDownIcon className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName
AccordionTrigger.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
}


const AccordionContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-base data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
))
AccordionContent.displayName = AccordionPrimitive.Content.displayName
AccordionContent.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }