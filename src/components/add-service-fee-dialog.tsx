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
import { type LoanServiceFee } from "@/lib/data";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  loan_id: z.string().min(1, "Mã khoản vay là bắt buộc."),
  payment_date: z.string().min(1, "Ngày thanh toán là bắt buộc."),
  note: z.string().optional(),
  appraisal_fee: z.coerce.number().min(0),
  appraisal_fee_vat: z.coerce.number().min(0),
  disbursement_fee: z.coerce.number().min(0),
  disbursement_fee_vat: z.coerce.number().min(0),
  vat_amount: z.coerce.number().min(0),
  total_amount: z.coerce.number().min(0),
});

const currencyFormatter = new Intl.NumberFormat("de-DE");

// Helper function to safely parse date from database
const parsePaymentDate = (dateValue: string | null | undefined): string => {
  if (!dateValue) {
    return format(new Date(), "yyyy-MM-dd");
  }

  try {
    // If it's already in yyyy-MM-dd format
    if (dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateValue;
    }

    // If it's a timestamp, extract just the date part
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) {
      return format(new Date(), "yyyy-MM-dd");
    }
    return format(date, "yyyy-MM-dd");
  } catch {
    return format(new Date(), "yyyy-MM-dd");
  }
};

// Helper function to safely parse date for display
const parseDateForDisplay = (
  dateValue: string | null | undefined
): Date | undefined => {
  if (!dateValue) {
    return undefined;
  }

  try {
    // If it's in yyyy-MM-dd format
    if (dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return parse(dateValue, "yyyy-MM-dd", new Date());
    }

    // If it's a timestamp
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) {
      return undefined;
    }
    return date;
  } catch {
    return undefined;
  }
};

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

type AddServiceFeeDialogProps = {
  onSave: (
    data: Omit<
      LoanServiceFee,
      "id" | "created_at" | "updated_at" | "created_by"
    > & {
      id?: string;
    }
  ) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  serviceFeeToEdit?: LoanServiceFee | null;
};

export function AddServiceFeeDialog({
  onSave,
  isOpen,
  setIsOpen,
  serviceFeeToEdit,
}: AddServiceFeeDialogProps) {
  const isEditMode = !!serviceFeeToEdit;

  const defaultValues = {
    loan_id: "",
    payment_date: format(new Date(), "yyyy-MM-dd"),
    note: "",
    appraisal_fee: 0,
    appraisal_fee_vat: 0,
    disbursement_fee: 0,
    disbursement_fee_vat: 0,
    vat_amount: 0,
    total_amount: 0,
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: isEditMode ? serviceFeeToEdit : defaultValues,
  });

  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (
        type === "change" &&
        [
          "appraisal_fee",
          "appraisal_fee_vat",
          "disbursement_fee",
          "disbursement_fee_vat",
        ].includes(name as string)
      ) {
        const {
          appraisal_fee,
          appraisal_fee_vat,
          disbursement_fee,
          disbursement_fee_vat,
        } = form.getValues();

        // Calculate total VAT
        const totalVat = (appraisal_fee_vat || 0) + (disbursement_fee_vat || 0);
        form.setValue("vat_amount", totalVat);

        // Calculate total amount (all fees + all VAT)
        const total =
          (appraisal_fee || 0) +
          (appraisal_fee_vat || 0) +
          (disbursement_fee || 0) +
          (disbursement_fee_vat || 0);
        form.setValue("total_amount", total);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && serviceFeeToEdit) {
        // Parse payment_date an toàn từ database
        const parsedPaymentDate = parsePaymentDate(
          serviceFeeToEdit.payment_date
        );
        form.reset({
          ...serviceFeeToEdit,
          payment_date: parsedPaymentDate,
        });
      } else {
        // Reset với default values, đảm bảo payment_date luôn là ngày hôm nay
        form.reset({
          ...defaultValues,
          payment_date: format(new Date(), "yyyy-MM-dd"),
        });
      }
    }
  }, [serviceFeeToEdit, form, isEditMode, isOpen]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    onSave({
      loan_id: values.loan_id,
      payment_date: values.payment_date,
      note: values.note || "",
      appraisal_fee: values.appraisal_fee,
      appraisal_fee_vat: values.appraisal_fee_vat,
      disbursement_fee: values.disbursement_fee,
      disbursement_fee_vat: values.disbursement_fee_vat,
      vat_amount: values.vat_amount,
      total_amount: values.total_amount,
      id: isEditMode ? serviceFeeToEdit.id : undefined,
    });
    if (!isEditMode) {
      form.reset({
        ...defaultValues,
        payment_date: format(new Date(), "yyyy-MM-dd"),
      });
    }
    setIsOpen(false);
  }

  const handleOpenChange = (open: boolean) => {
    if (open && !isEditMode) {
      // Khi mở dialog để thêm mới, reset form với default values và payment_date là ngày hôm nay
      form.reset({
        ...defaultValues,
        payment_date: format(new Date(), "yyyy-MM-dd"),
      });
    } else if (!open) {
      // Khi đóng dialog, reset form
      form.reset();
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Cập nhật phí dịch vụ" : "Thêm phí dịch vụ"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Cập nhật thông tin phí dịch vụ khoản vay."
              : "Nhập thông tin phí dịch vụ khoản vay mới."}
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
                  <FormLabel>Ngày thanh toán</FormLabel>
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
                            (() => {
                              try {
                                const parsedDate = parseDateForDisplay(
                                  field.value
                                );
                                if (parsedDate) {
                                  return format(parsedDate, "dd/MM/yyyy");
                                }
                                return format(new Date(), "dd/MM/yyyy");
                              } catch {
                                return format(new Date(), "dd/MM/yyyy");
                              }
                            })()
                          ) : (
                            <span>Chọn ngày</span>
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
                            ? parseDateForDisplay(field.value) || new Date()
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
            <FormField
              control={form.control}
              name="loan_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã khoản vay (Loan ID)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="appraisal_fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phí thẩm định (chưa VAT)</FormLabel>
                    <FormControl>
                      <FormattedNumberInput {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="appraisal_fee_vat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>VAT phí thẩm định</FormLabel>
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
                name="disbursement_fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phí giải ngân (chưa VAT)</FormLabel>
                    <FormControl>
                      <FormattedNumberInput {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="disbursement_fee_vat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>VAT phí giải ngân</FormLabel>
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
              name="vat_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tổng VAT</FormLabel>
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
              name="total_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tổng phí (có VAT)</FormLabel>
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
                  <FormLabel>Ghi chú</FormLabel>
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
                Hủy
              </Button>
              <Button type="button" onClick={form.handleSubmit(onSubmit)}>
                Lưu
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
