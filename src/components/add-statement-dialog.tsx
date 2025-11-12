"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parse } from "date-fns";
import { CalendarIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { type Statement } from "@/lib/data";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  loan_id: z.string().min(1, "Mã khoản vay là bắt buộc."),
  note: z.string().optional(),
  payment_date: z.string().min(1, "Ngày thanh toán là bắt buộc."),
  principal_amount: z.coerce.number().min(0),
  interest_amount: z.coerce.number().min(0),
  management_fee: z.coerce.number().min(0),
  overdue_fee: z.coerce.number().min(0),
  settlement_fee: z.coerce.number().min(0),
  remaining_amount: z.coerce.number().min(0),
  vat_amount: z.coerce.number().min(0),
  total_amount: z.coerce.number().min(0),
});

const currencyFormatter = new Intl.NumberFormat("de-DE");

const FormattedNumberInput = React.forwardRef<
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

  return (
    <Input
      ref={ref}
      {...props}
      value={displayValue}
      onChange={handleInputChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onFocus={(e) => e.target.select()}
    />
  );
});
FormattedNumberInput.displayName = "FormattedNumberInput";

type AddStatementDialogProps = {
  onSave: (
    data: Omit<Statement, "id" | "created_at" | "updated_at" | "created_by"> & {
      id?: string;
    }
  ) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  statementToEdit?: Statement | null;
};

export function AddStatementDialog({
  onSave,
  isOpen,
  setIsOpen,
  statementToEdit,
}: AddStatementDialogProps) {
  const isEditMode = !!statementToEdit;

  const defaultValues = {
    loan_id: "",
    note: "",
    payment_date: format(new Date(), "yyyy-MM-dd"),
    principal_amount: 0,
    interest_amount: 0,
    management_fee: 0,
    overdue_fee: 0,
    settlement_fee: 0,
    remaining_amount: 0,
    vat_amount: 0,
    total_amount: 0,
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: isEditMode ? statementToEdit : defaultValues,
  });

  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (
        type === "change" &&
        [
          "principal_amount",
          "interest_amount",
          "management_fee",
          "overdue_fee",
          "settlement_fee",
          "remaining_amount",
          "vat_amount",
        ].includes(name as string)
      ) {
        const {
          principal_amount,
          interest_amount,
          management_fee,
          overdue_fee,
          settlement_fee,
          remaining_amount,
          vat_amount,
        } = form.getValues();
        const total =
          (principal_amount || 0) +
          (interest_amount || 0) +
          (management_fee || 0) +
          (overdue_fee || 0) +
          (settlement_fee || 0) +
          (remaining_amount || 0) +
          (vat_amount || 0);
        form.setValue("total_amount", total);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  useEffect(() => {
    form.reset(isEditMode ? { ...statementToEdit } : defaultValues);
  }, [statementToEdit, form, isEditMode]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    onSave({
      loan_id: values.loan_id,
      note: values.note || "",
      payment_date: values.payment_date,
      principal_amount: values.principal_amount,
      interest_amount: values.interest_amount,
      management_fee: values.management_fee,
      overdue_fee: values.overdue_fee,
      settlement_fee: values.settlement_fee,
      remaining_amount: values.remaining_amount,
      vat_amount: values.vat_amount,
      total_amount: values.total_amount,
      id: isEditMode ? statementToEdit.id : undefined,
    });
    if (!isEditMode) {
      form.reset(defaultValues);
    }
    setIsOpen(false);
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Update statement" : "Add statement"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update details for the statement."
              : "Enter details for the new statement."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
                e.preventDefault();
              }
            }}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="payment_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Payment Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(
                              parse(field.value, "yyyy-MM-dd", new Date()),
                              "dd/MM/yyyy"
                            )
                          ) : (
                            <span>Select date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          field.value
                            ? parse(field.value, "yyyy-MM-dd", new Date())
                            : undefined
                        }
                        onSelect={(date) =>
                          field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="loan_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loan ID</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="principal_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Principal</FormLabel>
                    <FormControl>
                      <FormattedNumberInput {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="interest_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interest</FormLabel>
                    <FormControl>
                      <FormattedNumberInput {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="management_fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Management Fee</FormLabel>
                    <FormControl>
                      <FormattedNumberInput {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="overdue_fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overdue Fee</FormLabel>
                    <FormControl>
                      <FormattedNumberInput {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="settlement_fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Settlement Fee</FormLabel>
                    <FormControl>
                      <FormattedNumberInput {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="remaining_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remaining Amount</FormLabel>
                    <FormControl>
                      <FormattedNumberInput {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vat_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>VAT Amount</FormLabel>
                    <FormControl>
                      <FormattedNumberInput {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="total_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Amount</FormLabel>
                  <FormControl>
                    <FormattedNumberInput
                      {...field}
                      readOnly
                      className="bg-muted"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button type="button" onClick={form.handleSubmit(onSubmit)}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
