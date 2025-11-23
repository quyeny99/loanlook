"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";

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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { ExcludeDisbursement } from "@/lib/types";
import { useEffect, useState } from "react";
import { parseISO, format as formatDate } from "date-fns";
import { createClient } from "@/utils/supabase/client";
import {
  insertExcludedDisbursement,
  updateExcludedDisbursement,
} from "@/lib/supabase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ControllerRenderProps } from "react-hook-form";

// Date Input Component
function DateInput({
  field,
  onDateChange,
}: {
  field: ControllerRenderProps<any, "date">;
  onDateChange?: (date: string) => void;
}) {
  const formatDateDisplay = (value: string): string => {
    if (!value) return "";
    try {
      // Handle both date (yyyy-mm-dd) and timestamptz (ISO string) formats
      const date = parseISO(value);
      return formatDate(date, "dd/MM/yyyy");
    } catch {
      return value;
    }
  };

  const [displayValue, setDisplayValue] = useState(
    formatDateDisplay(field.value)
  );

  useEffect(() => {
    const formatted = formatDateDisplay(field.value);
    if (formatted !== displayValue) {
      setDisplayValue(formatted);
    }
  }, [field.value]);

  return (
    <Input
      type="text"
      placeholder="dd/mm/yyyy"
      value={displayValue}
      maxLength={10}
      onChange={(e) => {
        const inputValue = e.target.value;

        // Allow only digits and slashes
        if (inputValue === "" || /^[\d/]*$/.test(inputValue)) {
          // Remove slashes for processing
          const cleaned = inputValue.replace(/\//g, "");

          if (cleaned === "") {
            setDisplayValue("");
            field.onChange("");
            return;
          }

          // Format as dd/mm/yyyy
          let formatted = cleaned;
          if (cleaned.length > 2) {
            formatted = cleaned.slice(0, 2) + "/" + cleaned.slice(2);
          }
          if (cleaned.length > 4) {
            formatted =
              cleaned.slice(0, 2) +
              "/" +
              cleaned.slice(2, 4) +
              "/" +
              cleaned.slice(4, 8);
          }

          setDisplayValue(formatted);

          // Convert to yyyy-mm-dd if complete
          if (cleaned.length === 8) {
            const day = cleaned.slice(0, 2);
            const month = cleaned.slice(2, 4);
            const year = cleaned.slice(4, 8);

            const dayNum = parseInt(day, 10);
            const monthNum = parseInt(month, 10);
            const yearNum = parseInt(year, 10);

            if (
              dayNum >= 1 &&
              dayNum <= 31 &&
              monthNum >= 1 &&
              monthNum <= 12 &&
              yearNum >= 1900 &&
              yearNum <= 2100
            ) {
              // Convert to timestamptz format (ISO string with time)
              const dateValue = `${year}-${month}-${day}T00:00:00.000Z`;
              field.onChange(dateValue);
              // Auto-update reference_month (yyyy-MM format)
              if (onDateChange) {
                onDateChange(`${year}-${month}`);
              }
            } else {
              field.onChange("");
              if (onDateChange) {
                onDateChange("");
              }
            }
          } else {
            field.onChange("");
          }
        }
      }}
      onBlur={() => {
        // Validate and format on blur
        const cleaned = displayValue.replace(/\//g, "");
        if (cleaned.length === 8) {
          const day = cleaned.slice(0, 2);
          const month = cleaned.slice(2, 4);
          const year = cleaned.slice(4, 8);

          const dayNum = parseInt(day, 10);
          const monthNum = parseInt(month, 10);
          const yearNum = parseInt(year, 10);

          if (
            dayNum >= 1 &&
            dayNum <= 31 &&
            monthNum >= 1 &&
            monthNum <= 12 &&
            yearNum >= 1900 &&
            yearNum <= 2100
          ) {
            const formatted = `${day}/${month}/${year}`;
            setDisplayValue(formatted);
            // Convert to timestamptz format (ISO string with time)
            const dateValue = `${year}-${month}-${day}T00:00:00.000Z`;
            field.onChange(dateValue);
            // Auto-update reference_month (yyyy-MM format)
            if (onDateChange) {
              onDateChange(`${year}-${month}`);
            }
          } else {
            // Invalid date, reset
            setDisplayValue("");
            field.onChange("");
            if (onDateChange) {
              onDateChange("");
            }
          }
        } else if (displayValue && cleaned.length !== 8) {
          // Incomplete date, clear
          setDisplayValue("");
          field.onChange("");
        }
      }}
    />
  );
}

// Amount Input Component
function AmountInput({
  field,
}: {
  field: ControllerRenderProps<any, "amount">;
}) {
  const formatNumber = (value: number | undefined): string => {
    if (!value || value === 0) return "";
    return new Intl.NumberFormat("vi-VN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const parseNumber = (value: string): number => {
    // Remove all dots and convert to number
    const numStr = value.replace(/\./g, "");
    const num = parseInt(numStr, 10);
    return isNaN(num) ? 0 : num;
  };

  const [displayValue, setDisplayValue] = useState(formatNumber(field.value));

  useEffect(() => {
    const currentParsed = parseNumber(displayValue);
    if (field.value !== currentParsed && field.value !== undefined) {
      setDisplayValue(formatNumber(field.value));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field.value]);

  return (
    <Input
      type="text"
      placeholder="10.000.000"
      value={displayValue}
      onChange={(e) => {
        const inputValue = e.target.value;
        // Remove all non-numeric characters except empty string
        const cleaned = inputValue.replace(/[^\d]/g, "");

        if (cleaned === "") {
          setDisplayValue("");
          field.onChange(0);
          return;
        }

        // Parse to number and format
        const numValue = parseInt(cleaned, 10);
        if (!isNaN(numValue)) {
          const formatted = formatNumber(numValue);
          setDisplayValue(formatted);
          field.onChange(numValue);
        }
      }}
      onBlur={() => {
        // Ensure proper formatting on blur
        const numValue = parseNumber(displayValue);
        if (numValue > 0) {
          const formatted = formatNumber(numValue);
          setDisplayValue(formatted);
          field.onChange(numValue);
        }
      }}
      onPaste={(e) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData("text");
        const cleaned = pastedText.replace(/[^\d]/g, "");
        if (cleaned) {
          const numValue = parseInt(cleaned, 10);
          if (!isNaN(numValue) && numValue > 0) {
            const formatted = formatNumber(numValue);
            setDisplayValue(formatted);
            field.onChange(numValue);
          }
        }
      }}
    />
  );
}

// Commission Input Component
function CommissionInput({
  field,
}: {
  field: ControllerRenderProps<any, "commission">;
}) {
  const formatNumber = (value: number | undefined): string => {
    if (!value || value === 0) return "";
    return new Intl.NumberFormat("vi-VN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const parseNumber = (value: string): number => {
    // Remove all dots and convert to number
    const numStr = value.replace(/\./g, "");
    const num = parseInt(numStr, 10);
    return isNaN(num) ? 0 : num;
  };

  const [displayValue, setDisplayValue] = useState(formatNumber(field.value));

  useEffect(() => {
    const currentParsed = parseNumber(displayValue);
    if (field.value !== currentParsed && field.value !== undefined) {
      setDisplayValue(formatNumber(field.value));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field.value]);

  return (
    <Input
      type="text"
      placeholder="0"
      value={displayValue}
      onChange={(e) => {
        const inputValue = e.target.value;
        // Remove all non-numeric characters except empty string
        const cleaned = inputValue.replace(/[^\d]/g, "");

        if (cleaned === "") {
          setDisplayValue("");
          field.onChange(0);
          return;
        }

        // Parse to number and format
        const numValue = parseInt(cleaned, 10);
        if (!isNaN(numValue)) {
          const formatted = formatNumber(numValue);
          setDisplayValue(formatted);
          field.onChange(numValue);
        }
      }}
      onBlur={() => {
        // Ensure proper formatting on blur
        const numValue = parseNumber(displayValue);
        if (numValue >= 0) {
          const formatted = formatNumber(numValue);
          setDisplayValue(formatted);
          field.onChange(numValue);
        }
      }}
      onPaste={(e) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData("text");
        const cleaned = pastedText.replace(/[^\d]/g, "");
        if (cleaned) {
          const numValue = parseInt(cleaned, 10);
          if (!isNaN(numValue) && numValue >= 0) {
            const formatted = formatNumber(numValue);
            setDisplayValue(formatted);
            field.onChange(numValue);
          }
        }
      }}
    />
  );
}

const formSchema = z.object({
  date: z.string().min(1, "Ngày là bắt buộc."),
  related_ln_code: z.string().min(1, "Loan Code là bắt buộc."),
  related_ap_code: z.string().min(1, "App Code là bắt buộc."),
  fullname: z.string().min(1, "Tên khách hàng là bắt buộc."),
  amount: z.number().min(1, "Số tiền phải lớn hơn 0."),
  reference_month: z.string().min(1, "Reference Month là bắt buộc."),
  approve_term: z.number().min(1, "Approve Term phải lớn hơn 0."),
  commission: z.number().min(0, "Commission không được âm."),
  country: z.number().min(1, "Country là bắt buộc."),
  country__name: z.string().min(1, "Country Name là bắt buộc."),
  country__en: z.string().min(1, "Country EN là bắt buộc."),
  legal_type__name: z.string().min(1, "Legal Type Name là bắt buộc."),
  legal_type__code: z.string().min(1, "Legal Type Code là bắt buộc."),
  province: z.string().min(1, "Province là bắt buộc."),
  product__type__en: z.string().min(1, "Product Type là bắt buộc."),
  source__name: z.string().min(1, "Source Name là bắt buộc."),
  reason: z.string().min(1, "Lý do loại trừ là bắt buộc."),
  direction: z.enum(["in", "out"], {
    required_error: "Hướng điều chỉnh là bắt buộc.",
  }),
});

type AddExcludeDisbursementDialogProps = {
  onSave: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  disbursementToEdit?: ExcludeDisbursement | null;
};

export function AddExcludeDisbursementDialog({
  onSave,
  isOpen,
  setIsOpen,
  disbursementToEdit,
}: AddExcludeDisbursementDialogProps) {
  const { toast } = useToast();
  const isEditMode = !!disbursementToEdit;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString(),
      related_ln_code: "",
      related_ap_code: "",
      fullname: "",
      amount: 0,
      reference_month: "",
      approve_term: 0,
      commission: 0,
      country: 1,
      country__name: "Việt Nam",
      country__en: "Vietnam",
      legal_type__name: "Căn cước công dân",
      legal_type__code: "CCCD",
      province: "",
      product__type__en: "Unsecured Loan",
      source__name: "Website",
      reason: "",
      direction: "out",
    },
  });

  useEffect(() => {
    if (isEditMode && disbursementToEdit) {
      const dateValue = disbursementToEdit.date;
      // Extract yyyy-MM from date (timestamptz format: yyyy-mm-ddTHH:mm:ss.sssZ)
      let referenceMonth = "";
      try {
        const date = parseISO(dateValue);
        referenceMonth = formatDate(date, "yyyy-MM");
      } catch {
        // Fallback: try to extract from string
        referenceMonth = dateValue ? dateValue.substring(0, 7) : "";
      }
      form.reset({
        date: disbursementToEdit.date,
        related_ln_code: disbursementToEdit.related_ln_code,
        related_ap_code: disbursementToEdit.related_ap_code,
        fullname: disbursementToEdit.fullname || "",
        amount: disbursementToEdit.amount,
        reference_month: referenceMonth,
        approve_term: disbursementToEdit.approve_term || 0,
        commission: disbursementToEdit.commission || 0,
        country: disbursementToEdit.country || 1,
        country__name: disbursementToEdit.country__name || "",
        country__en: disbursementToEdit.country__en || "",
        legal_type__name: disbursementToEdit.legal_type__name || "",
        legal_type__code: disbursementToEdit.legal_type__code || "",
        province: disbursementToEdit.province || "",
        product__type__en: disbursementToEdit.product__type__en || "",
        source__name: disbursementToEdit.source__name || "",
        reason: disbursementToEdit.reason || "",
        direction: disbursementToEdit.direction || "out",
      });
    } else {
      const today = new Date();
      const todayISO = today.toISOString(); // timestamptz format
      const referenceMonth = format(today, "yyyy-MM"); // yyyy-MM
      form.reset({
        date: todayISO,
        related_ln_code: "",
        related_ap_code: "",
        fullname: "",
        amount: 0,
        reference_month: referenceMonth,
        approve_term: 0,
        commission: 0,
        country: 1,
        country__name: "Việt Nam",
        country__en: "Vietnam",
        legal_type__name: "Căn cước công dân",
        legal_type__code: "CCCD",
        province: "",
        product__type__en: "Unsecured Loan",
        source__name: "Website",
        reason: "",
        direction: "out",
      });
    }
  }, [disbursementToEdit, isEditMode, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const dataToSave = {
        date: values.date,
        amount: values.amount,
        direction: values.direction,
        reason: values.reason || null,
        related_ln_code: values.related_ln_code,
        related_ap_code: values.related_ap_code,
        reference_month: values.reference_month || null,
        fullname: values.fullname || null,
        approve_term: values.approve_term || null,
        commission: values.commission || null,
        country: values.country || null,
        country__name: values.country__name || null,
        country__en: values.country__en || null,
        legal_type__name: values.legal_type__name || null,
        legal_type__code: values.legal_type__code || null,
        province: values.province || null,
        product__type__en: values.product__type__en || null,
        source__name: values.source__name || null,
      };

      let error;
      if (isEditMode && disbursementToEdit) {
        // Update existing disbursement
        const result = await updateExcludedDisbursement(
          disbursementToEdit.id,
          dataToSave
        );
        error = result.error;
      } else {
        // Insert new disbursement
        const result = await insertExcludedDisbursement(dataToSave);
        error = result.error;
      }

      if (error) {
        console.error(
          `Error ${isEditMode ? "updating" : "adding"} exclude disbursement:`,
          error
        );
        toast({
          title: "Error",
          description:
            error.message ||
            `Failed to ${
              isEditMode ? "update" : "create"
            } exclude disbursement.`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: `Exclude disbursement has been ${
          isEditMode ? "updated" : "created"
        }.`,
      });

      form.reset();
      setIsOpen(false);
      onSave();
    } catch (error) {
      console.error("Failed to save exclude disbursement:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode
              ? "Cập nhật Exclude Disbursement"
              : "Thêm Exclude Disbursement"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Cập nhật thông tin exclude disbursement."
              : "Nhập thông tin để thêm exclude disbursement mới."}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Disbursement Date *</FormLabel>
                    <FormControl>
                      <DateInput
                        field={field}
                        onDateChange={(date) => {
                          form.setValue("reference_month", date);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reference_month"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference Month *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="2025-09"
                        {...field}
                        disabled
                        className="bg-muted cursor-not-allowed"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="related_ln_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loan Code *</FormLabel>
                    <FormControl>
                      <Input placeholder="LN********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="related_ap_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>App Code *</FormLabel>
                    <FormControl>
                      <Input placeholder="AP********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="fullname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Tên khách hàng" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount *</FormLabel>
                    <FormControl>
                      <AmountInput field={field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="approve_term"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Approve Term *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="6"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="commission"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commission</FormLabel>
                    <FormControl>
                      <CommissionInput field={field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="country__name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country *</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          const countries: Record<
                            string,
                            { name: string; en: string; id: number }
                          > = {
                            "Việt Nam": {
                              name: "Việt Nam",
                              en: "Vietnam",
                              id: 1,
                            },
                            Singapore: {
                              name: "Singapore",
                              en: "Singapore",
                              id: 2,
                            },
                            "Đài Loan": {
                              name: "Đài Loan",
                              en: "Taiwan",
                              id: 3,
                            },
                          };
                          const country = countries[value];
                          if (country) {
                            field.onChange(country.name);
                            form.setValue("country__en", country.en);
                            form.setValue("country", country.id);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn quốc gia" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Việt Nam">Việt Nam</SelectItem>
                          <SelectItem value="Singapore">Singapore</SelectItem>
                          <SelectItem value="Đài Loan">Đài Loan</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Province *</FormLabel>
                    <FormControl>
                      <Input placeholder="Hà Nội" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="legal_type__name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Legal Type *</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          const types: Record<
                            string,
                            { name: string; code: string }
                          > = {
                            "Căn cước công dân": {
                              name: "Căn cước công dân",
                              code: "CCCD",
                            },
                            "Hộ chiếu": { name: "Hộ chiếu", code: "HC" },
                          };
                          const type = types[value];
                          if (type) {
                            field.onChange(type.name);
                            form.setValue("legal_type__code", type.code);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại giấy tờ" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Căn cước công dân">
                            Căn cước công dân
                          </SelectItem>
                          <SelectItem value="Hộ chiếu">Hộ chiếu</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="product__type__en"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Type *</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại sản phẩm" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Unsecured Loan">
                            Unsecured Loan
                          </SelectItem>
                          <SelectItem value="Pawning">Pawning</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="source__name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source *</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn nguồn" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Website">Website</SelectItem>
                          <SelectItem value="App">App</SelectItem>
                          <SelectItem value="CTV">CTV</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="direction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Direction *</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn hướng điều chỉnh" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="in">In (Cộng)</SelectItem>
                          <SelectItem value="out">Out (Trừ)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Nhập lý do loại trừ..."
                      rows={4}
                    />
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
              <Button type="submit">
                {isEditMode ? "Cập nhật" : "Thêm mới"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
