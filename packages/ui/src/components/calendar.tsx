"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@una-gc/ui/lib/utils";
import { buttonVariants } from "@una-gc/ui/components/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

/**
 * Calendar — wrapper around `react-day-picker` v9.
 *
 * This file was previously written for v8 and broke after the v9 upgrade:
 *   - `IconLeft`/`IconRight` were merged into a single `Chevron` component.
 *   - Almost every `className` slot was renamed (caption → month_caption,
 *     head_row → weekdays, head_cell → weekday, row → week, etc).
 *   - Without those names the library falls back to its un-styled defaults,
 *     which is why the weekday letters appeared shuffled and the navigation
 *     chevrons were invisible.
 */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "flex flex-col gap-4",
        month_caption: "flex justify-center pt-1 relative items-center h-7",
        caption_label: "text-sm font-medium",
        nav: "flex items-center justify-between absolute inset-x-1 top-1",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-60 hover:opacity-100",
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-60 hover:opacity-100",
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] flex items-center justify-center",
        week: "flex w-full mt-2",
        day: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
          "[&:has([aria-selected])]:bg-accent",
          "first:[&:has([aria-selected])]:rounded-l-md",
          "last:[&:has([aria-selected])]:rounded-r-md",
        ),
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
        ),
        range_start:
          "day-range-start aria-selected:bg-primary aria-selected:text-primary-foreground",
        range_end:
          "day-range-end aria-selected:bg-primary aria-selected:text-primary-foreground",
        range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md",
        today: "bg-accent text-accent-foreground rounded-md",
        outside:
          "day-outside text-muted-foreground aria-selected:text-muted-foreground",
        disabled: "text-muted-foreground opacity-50",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: chevronClassName, ...rest }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight;
          return <Icon className={cn("h-4 w-4", chevronClassName)} {...rest} />;
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
