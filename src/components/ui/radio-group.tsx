
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

// Prilagođena komponenta za hedonističku skalu koja naglašava tekst
const HedonicRadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("flex justify-between", className)}
      {...props}
      ref={ref}
    />
  )
})
HedonicRadioGroup.displayName = "HedonicRadioGroup"

// Prilagođeni izborni krug za hedonističku skalu s manjim brojčanim oznakama
const HedonicRadioItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> & {
    value: string;
    label?: string;
    number?: string;
  }
>(({ className, value, label, number, ...props }, ref) => {
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <RadioGroupPrimitive.Item
          ref={ref}
          value={value}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary text-xs font-medium text-primary shadow ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
            className
          )}
          {...props}
        >
          {number && <span>{number}</span>}
        </RadioGroupPrimitive.Item>
      </div>
      {label && (
        <span className="mt-2 text-center text-xs max-w-[90px]">{label}</span>
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
      className={cn("flex justify-between", className)}
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
    number?: string;
  }
>(({ className, value, label, number, ...props }, ref) => {
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <RadioGroupPrimitive.Item
          ref={ref}
          value={value}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary text-xs font-medium text-primary shadow ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
            className
          )}
          {...props}
        >
          {number && <span>{number}</span>}
        </RadioGroupPrimitive.Item>
      </div>
      <span className="mt-2 text-center text-xs max-w-[120px]">{label}</span>
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
