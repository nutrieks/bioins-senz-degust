
import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Circle } from "lucide-react"

import { cn } from "@/lib/utils"

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-2", className)}
      {...props}
      ref={ref}
    />
  )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square h-6 w-6 rounded-full border-2 border-primary text-primary shadow ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-3.5 w-3.5 fill-current text-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

// Dodatna komponenta za bolju prezentaciju hedonističke skale
const HedonicRadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("flex flex-wrap justify-between gap-2", className)}
      {...props}
      ref={ref}
    />
  )
})
HedonicRadioGroup.displayName = "HedonicRadioGroup"

// Prilagođeni izborni krug za hedonističku skalu (1-9)
const HedonicRadioItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> & {
    value: string;
    label?: string;
  }
>(({ className, value, label, ...props }, ref) => {
  return (
    <div className="flex flex-col items-center">
      <RadioGroupPrimitive.Item
        ref={ref}
        value={value}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full border-2 border-primary text-sm font-semibold text-primary shadow ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
          className
        )}
        {...props}
      >
        {value}
      </RadioGroupPrimitive.Item>
      {label && (
        <span className="mt-1 text-center text-xs">{label}</span>
      )}
    </div>
  )
})
HedonicRadioItem.displayName = "HedonicRadioItem"

// Komponenta za JAR skalu (1-5)
const JARRadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("flex justify-between gap-2", className)}
      {...props}
      ref={ref}
    />
  )
})
JARRadioGroup.displayName = "JARRadioGroup"

// Prilagođeni radio za JAR skalu
const JARRadioItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> & {
    value: string;
    label: string;
  }
>(({ className, value, label, ...props }, ref) => {
  return (
    <div className="flex flex-col items-center max-w-[120px]">
      <RadioGroupPrimitive.Item
        ref={ref}
        value={value}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary text-sm font-semibold text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
          className
        )}
        {...props}
      >
        {value}
      </RadioGroupPrimitive.Item>
      <span className="mt-1 text-center text-xs">{label}</span>
    </div>
  )
})
JARRadioItem.displayName = "JARRadioItem"

export { 
  RadioGroup, 
  RadioGroupItem, 
  HedonicRadioGroup, 
  HedonicRadioItem,
  JARRadioGroup,
  JARRadioItem
}
