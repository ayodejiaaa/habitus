import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "link" | "accent";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-98",
          {
            "bg-primary text-white hover:bg-primary-hover shadow-md hover:shadow-lg": variant === "default",
            "bg-secondary text-white hover:bg-secondary-hover shadow-md hover:shadow-lg": variant === "secondary",
            "border border-border bg-white hover:bg-gray-50 text-charcoal": variant === "outline",
            "bg-accent text-white hover:bg-accent-hover shadow-md hover:shadow-lg": variant === "accent",
            "hover:bg-charcoal/5 hover:text-charcoal text-charcoal": variant === "ghost",
            "text-primary underline-offset-4 hover:underline bg-transparent": variant === "link",
          },
          {
            "h-10 px-5 py-2.5": size === "default",
            "h-9 rounded-md px-3": size === "sm",
            "h-11 rounded-md px-8": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
