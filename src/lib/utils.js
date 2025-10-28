//allows you to build flexible components without worrying about messy class name logic or conflicting styles.

// This file is needed by Shadcn/UI for utility functions like cn()

import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}