
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

// Prilagođena komponenta za hedonističku skalu
const HedonicRadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("space-y-2.5", className)}
      {...props}
      ref={ref}
    />
  )
})
HedonicRadioGroup.displayName = "HedonicRadioGroup"

// Prilagođeni izborni krug za hedonističku skalu s opisnim tekstom
const HedonicRadioItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> & {
    label: string;
  }
>(({ className, value, label, ...props }, ref) => {
  return (
    <label className="hedonic-item-label">
      <RadioGroupPrimitive.Item
        ref={ref}
        value={value}
        className={cn(
          "h-6 w-6 rounded-full border border-primary text-primary shadow ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        id={`radio-${value}-${Math.random().toString(36).substring(2, 9)}`}
        {...props}
      >
        <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
          <Circle className="h-3.5 w-3.5 fill-current text-current" />
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>
      {label && (
        <span className="text-sm font-medium flex-1">{label}</span>
      )}
    </label>
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
      className={cn("space-y-2.5", className)}
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
    label: string;
  }
>(({ className, value, label, ...props }, ref) => {
  return (
    <label className="jar-item-label">
      <RadioGroupPrimitive.Item
        ref={ref}
        value={value}
        className={cn(
          "h-6 w-6 rounded-full border border-primary text-primary shadow ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        id={`radio-jar-${value}-${Math.random().toString(36).substring(2, 9)}`}
        {...props}
      >
        <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
          <Circle className="h-3.5 w-3.5 fill-current text-current" />
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>
      <span className="text-sm font-medium flex-1">{label}</span>
    </label>
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
