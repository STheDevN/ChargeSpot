import React from "react"
import PropTypes from "prop-types" // For runtime prop validation

import { cn } from "../../lib/utils.js"

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-primary/15", className)}
      {...props}
    />
  )
}

Skeleton.propTypes = {
  className: PropTypes.string,
}

export { Skeleton }