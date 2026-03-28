import React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const headingVariants = cva(
  "tracking-tight font-heading uppercase",
  {
    variants: {
      variant: {
        default: "text-charcoal",
        cobalt: "text-cobalt",
        surgical: "text-surgical",
        iodine: "text-iodine",
        light: "text-white",
        muted: "text-charcoal/60",
      },
      size: {
        default: "text-2xl sm:text-3xl lg:text-4xl",
        xxs: "text-base sm:text-lg lg:text-lg",
        xs: "text-lg sm:text-xl lg:text-2xl",
        sm: "text-xl sm:text-2xl lg:text-3xl",
        md: "text-2xl sm:text-3xl lg:text-4xl",
        lg: "text-3xl sm:text-4xl lg:text-5xl",
        xl: "text-4xl sm:text-5xl lg:text-6xl",
        xll: "text-5xl sm:text-6xl lg:text-[5.4rem] lg:leading-[1]",
        xxl: "text-5xl sm:text-6xl lg:text-[6rem] leading-[1]",
        xxxl: "text-5xl sm:text-6xl lg:text-[8rem] leading-[1]",
      },
      weight: {
        default: "font-bold",
        thin: "font-thin",
        base: "font-normal",
        semi: "font-semibold",
        bold: "font-bold",
        black: "font-bold",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      weight: "default",
    },
  }
)

export interface HeadingProps extends VariantProps<typeof headingVariants> {
  asChild?: boolean
  children: React.ReactNode
  className?: string
}

const GradientHeading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ asChild, variant, weight, size, className, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "h3"
    return (
      <Comp ref={ref} {...props} className={cn("block", className)}>
        <span className={cn(headingVariants({ variant, size, weight }))}>
          {children}
        </span>
      </Comp>
    )
  }
)

GradientHeading.displayName = "GradientHeading"

export type Variant = "default" | "cobalt" | "surgical" | "iodine" | "light" | "muted"
export type Size = "default" | "xxs" | "xs" | "sm" | "md" | "lg" | "xl" | "xll" | "xxl" | "xxxl"
export type Weight = "default" | "thin" | "base" | "semi" | "bold" | "black"

export { GradientHeading, headingVariants }
