"use client";

import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { cva, type VariantProps } from "class-variance-authority";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-lg border border-border bg-card p-4 pr-10 shadow-elevated animate-fade-up",
  {
    variants: {
      variant: {
        default: "",
        success: "border-success/30",
        error: "border-destructive/30",
        info: "border-primary/30",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

const toastIconMap = {
  default: <Info className="h-5 w-5 shrink-0 text-primary" />,
  success: <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />,
  error: <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />,
  info: <Info className="h-5 w-5 shrink-0 text-primary" />,
};

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root> & VariantProps<typeof toastVariants>
>(({ className, variant = "default", children, ...props }, ref) => (
  <ToastPrimitive.Root
    ref={ref}
    className={cn(toastVariants({ variant }), className)}
    {...props}
  >
    <div className="pt-0.5">{toastIconMap[variant || "default"]}</div>
    <div className="min-w-0 flex-1">{children}</div>
    <ToastPrimitive.Close className="absolute right-3 top-3 rounded-sm p-1 opacity-60 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring">
      <X className="h-4 w-4" />
      <span className="sr-only">Dismiss</span>
    </ToastPrimitive.Close>
  </ToastPrimitive.Root>
));
Toast.displayName = ToastPrimitive.Root.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title
    ref={ref}
    className={cn("text-sm font-medium text-foreground", className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitive.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description
    ref={ref}
    className={cn("mt-0.5 text-sm text-muted-foreground", className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitive.Description.displayName;

type ToastActionElement = React.ReactElement;

export type {
  ToastActionElement,
};

export {
  Toast,
  ToastTitle,
  ToastDescription,
};
