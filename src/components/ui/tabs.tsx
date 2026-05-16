"use client"

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { useSegmentedIndicator } from "@/components/ui/use-segmented-indicator"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 data-horizontal:flex-col",
        className
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  "segmented-shell group/tabs-list inline-flex w-fit items-center justify-center text-muted-foreground group-data-horizontal/tabs:min-h-11 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col",
  {
    variants: {
      variant: {
        default: "gap-1",
        accent: "gap-1",
        line: "gap-1",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TabsList({
  className,
  variant = "default",
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  const { segmentedRef, indicatorRef } = useSegmentedIndicator<HTMLDivElement>()

  return (
    <TabsPrimitive.List
      ref={segmentedRef}
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    >
      <span
        ref={indicatorRef}
        aria-hidden="true"
        className={cn(
          "segmented-indicator",
          variant === "accent" ? "segmented-indicator--accent" : "segmented-indicator--default"
        )}
      />
      {props.children}
    </TabsPrimitive.List>
  )
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "relative z-[1] inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-[14px] border border-transparent px-3.5 py-1.5 text-[13px] font-semibold whitespace-nowrap text-foreground/62 transition-[color,transform,box-shadow,background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:-translate-y-px hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 aria-disabled:pointer-events-none aria-disabled:opacity-50 dark:text-muted-foreground dark:hover:text-foreground data-active:-translate-y-px [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "group-data-[variant=default]/tabs-list:data-active:border-border/80 group-data-[variant=default]/tabs-list:data-active:bg-background group-data-[variant=default]/tabs-list:data-active:text-foreground group-data-[variant=default]/tabs-list:data-active:shadow-[0_8px_18px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.7)]",
        "group-data-[variant=accent]/tabs-list:data-active:border-primary/15 group-data-[variant=accent]/tabs-list:data-active:bg-primary group-data-[variant=accent]/tabs-list:data-active:text-primary-foreground group-data-[variant=accent]/tabs-list:data-active:shadow-[0_12px_30px_rgba(0,188,125,0.24),inset_0_1px_0_rgba(255,255,255,0.14)]",
        "group-data-[variant=line]/tabs-list:data-active:border-border/80 group-data-[variant=line]/tabs-list:data-active:bg-background group-data-[variant=line]/tabs-list:data-active:text-foreground group-data-[variant=line]/tabs-list:data-active:shadow-[0_8px_18px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.7)]",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
