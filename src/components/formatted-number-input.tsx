"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { currencyFormatter } from "@/lib/constants";

export const FormattedNumberInput = React.forwardRef<
  HTMLInputElement,
  Omit<React.ComponentProps<typeof Input>, "onChange" | "value"> & {
    value: number;
    onChange: (value: number) => void;
  }
>(({ value, onChange, onBlur, ...props }, ref) => {
  const [displayValue, setDisplayValue] = React.useState(
    currencyFormatter.format(value)
  );

  React.useEffect(() => {
    setDisplayValue(currencyFormatter.format(value));
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const numericValue = Number(rawValue.replace(/\./g, "").replace(/,/g, "."));

    if (!isNaN(numericValue)) {
      onChange(numericValue);
      setDisplayValue(rawValue);
    } else if (rawValue === "") {
      onChange(0);
      setDisplayValue("");
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const numericValue = Number(rawValue.replace(/\./g, "").replace(/,/g, "."));
    if (!isNaN(numericValue)) {
      setDisplayValue(currencyFormatter.format(numericValue));
    } else {
      setDisplayValue(currencyFormatter.format(value));
    }
    onBlur?.(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow copy, paste, cut, select all
    if (
      (e.ctrlKey || e.metaKey) &&
      (e.key === "c" || e.key === "v" || e.key === "x" || e.key === "a")
    ) {
      return; // Allow these shortcuts
    }
    // Allow only numbers and control keys
    if (
      !/[0-9]/.test(e.key) &&
      ![
        "Backspace",
        "Tab",
        "Enter",
        "ArrowLeft",
        "ArrowRight",
        "Delete",
        "Home",
        "End",
      ].includes(e.key)
    ) {
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    // Remove all non-numeric characters except dots and commas
    const cleanedText = pastedText.replace(/[^\d.,]/g, "");
    if (cleanedText) {
      const numericValue = Number(
        cleanedText.replace(/\./g, "").replace(/,/g, ".")
      );
      if (!isNaN(numericValue)) {
        onChange(numericValue);
        setDisplayValue(cleanedText);
      }
    }
  };

  return (
    <Input
      ref={ref}
      {...props}
      value={displayValue}
      onChange={handleInputChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onFocus={(e) => e.target.select()}
    />
  );
});
FormattedNumberInput.displayName = "FormattedNumberInput";
