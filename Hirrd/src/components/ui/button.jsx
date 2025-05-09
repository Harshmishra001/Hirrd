/* eslint-disable react/prop-types */
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-sm hover:shadow-md",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-gray-700 to-gray-900 text-white hover:from-gray-600 hover:to-gray-800",
        destructive:
          "bg-gradient-to-r from-red-600 to-red-800 text-white hover:from-red-500 hover:to-red-700",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-accent",
        secondary:
          "bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-500 hover:to-gray-600",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        blue: "bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-500 hover:to-blue-700",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        xl: "h-14 sm:h-16 rounded-md px-14 text-lg sm:text-xl font-bold", // added
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          "active:scale-95 transform transition-transform"
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
