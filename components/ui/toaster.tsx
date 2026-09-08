"use client";

import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { Toast, ToastTitle, ToastDescription } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <ToastPrimitive.Provider swipeDirection="right">
      {toasts.map((item) => (
        <Toast key={item.id} variant={item.variant} onOpenChange={(open) => { if (!open) dismiss(item.id); }}>
          <div className="min-w-0">
            <ToastTitle>{item.title}</ToastTitle>
            {item.description && <ToastDescription>{item.description}</ToastDescription>}
          </div>
        </Toast>
      ))}
      <ToastPrimitive.Viewport className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:max-w-sm" />
    </ToastPrimitive.Provider>
  );
}
