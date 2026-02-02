"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

export function Field({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="field"
            className={cn("grid gap-2", className)}
            {...props}
        />
    )
}

export function FieldLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
    return (
        <Label
            data-slot="field-label"
            className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}
            {...props}
        />
    )
}

export function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
    return (
        <p
            data-slot="field-description"
            className={cn("text-muted-foreground text-xs", className)}
            {...props}
        />
    )
}

export function FieldError({ errors, className, ...props }: { errors: any[] } & React.ComponentProps<"div">) {
    if (!errors?.length) return null

    return (
        <div
            data-slot="field-error"
            className={cn("text-destructive text-xs font-medium", className)}
            {...props}
        >
            {errors.map((error, i) => (
                <p key={i}>{error?.message}</p>
            ))}
        </div>
    )
}

export function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
    return (
        <fieldset
            data-slot="field-set"
            className={cn("grid gap-4", className)}
            {...props}
        />
    )
}

export function FieldLegend({ className, variant, ...props }: React.ComponentProps<"legend"> & { variant?: "label" }) {
    return (
        <legend
            data-slot="field-legend"
            className={cn(
                "text-sm font-medium leading-none",
                variant === "label" && "mb-2",
                className
            )}
            {...props}
        />
    )
}

export function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="field-group"
            className={cn("grid gap-2", className)}
            {...props}
        />
    )
}

export function FieldContent({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="field-content"
            className={cn("grid gap-1", className)}
            {...props}
        />
    )
}

export function FieldTitle({ className, ...props }: React.ComponentProps<"h3">) {
    return (
        <h3
            data-slot="field-title"
            className={cn("text-sm font-semibold", className)}
            {...props}
        />
    )
}
