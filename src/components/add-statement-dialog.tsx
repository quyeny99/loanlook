
"use client"

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parseISO } from "date-fns";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { type Statement } from "@/lib/data";
import { Textarea } from "./ui/textarea";

const formSchema = z.object({
  loanCode: z.string().min(1, "Mã khoản vay là bắt buộc."),
  notes: z.string().optional(),
  paymentDate: z.date({
    required_error: "Ngày thanh toán là bắt buộc.",
  }),
  principal: z.coerce.number().min(0),
  interest: z.coerce.number().min(0),
  loanManagementFee: z.coerce.number().min(0),
  latePaymentPenalty: z.coerce.number().min(0),
  settlementFee: z.coerce.number().min(0),
  surplusCollection: z.coerce.number().min(0),
  vatPayable: z.coerce.number().min(0),
});

const currencyFormatter = new Intl.NumberFormat('de-DE');

const FormattedNumberInput = React.forwardRef<
  HTMLInputElement,
  Omit<React.ComponentProps<typeof Input>, 'onChange' | 'value'> & {
    value: number;
    onChange: (value: number) => void;
  }
>(({ value, onChange, onBlur, ...props }, ref) => {
  const [displayValue, setDisplayValue] = React.useState(currencyFormatter.format(value));

  React.useEffect(() => {
    setDisplayValue(currencyFormatter.format(value));
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const numericValue = Number(rawValue.replace(/\./g, '').replace(/,/g, '.'));
    
    if (!isNaN(numericValue)) {
      onChange(numericValue);
      setDisplayValue(rawValue);
    } else if (rawValue === '') {
      onChange(0);
      setDisplayValue('');
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const numericValue = Number(rawValue.replace(/\./g, '').replace(/,/g, '.'));
    if (!isNaN(numericValue)) {
      setDisplayValue(currencyFormatter.format(numericValue));
    } else {
      setDisplayValue(currencyFormatter.format(value));
    }
    onBlur?.(e);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Allow only numbers and control keys
      if (!/[0-9]/.test(e.key) && !['Backspace', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'Delete', 'Home', 'End'].includes(e.key)) {
          e.preventDefault();
      }
  };


  return <Input 
            ref={ref} 
            {...props} 
            value={displayValue} 
            onChange={handleInputChange} 
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onFocus={(e) => e.target.select()}
         />;
});
FormattedNumberInput.displayName = "FormattedNumberInput";


type AddStatementDialogProps = {
  onSave: (data: Omit<Statement, 'id'> & { id?: string }) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  statementToEdit?: Statement | null;
};

export function AddStatementDialog({ onSave, isOpen, setIsOpen, statementToEdit }: AddStatementDialogProps) {
  const isEditMode = !!statementToEdit;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: isEditMode
      ? { ...statementToEdit, paymentDate: parseISO(statementToEdit.paymentDate) }
      : {
          loanCode: "",
          notes: "",
          paymentDate: new Date(),
          principal: 0,
          interest: 0,
          loanManagementFee: 0,
          latePaymentPenalty: 0,
          settlementFee: 0,
          surplusCollection: 0,
          vatPayable: 0,
        },
  });
  
  useEffect(() => {
    form.reset(isEditMode ? { ...statementToEdit, paymentDate: parseISO(statementToEdit.paymentDate) } : {
        loanCode: "",
        notes: "",
        paymentDate: new Date(),
        principal: 0,
        interest: 0,
        loanManagementFee: 0,
        latePaymentPenalty: 0,
        settlementFee: 0,
        surplusCollection: 0,
        vatPayable: 0,
    });
  }, [statementToEdit, form, isEditMode]);


  function onSubmit(values: z.infer<typeof formSchema>) {
    onSave({
      ...values,
      paymentDate: values.paymentDate.toISOString(),
      id: isEditMode ? statementToEdit.id : undefined,
    });
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
          <DialogTitle>{isEditMode ? 'Cập nhật sao kê' : 'Thêm sao kê mới'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Cập nhật chi tiết cho mục sao kê.' : 'Điền chi tiết cho mục sao kê mới.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="loanCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã khoản vay</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="paymentDate"
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
                              format(field.value, "dd/MM/yyyy")
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
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="principal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gốc</FormLabel>
                    <FormControl>
                      <FormattedNumberInput {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="interest"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lãi vay</FormLabel>
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
                name="loanManagementFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phí quản lý khoản vay</FormLabel>
                    <FormControl>
                      <FormattedNumberInput {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="latePaymentPenalty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phí phạt trễ hạn</FormLabel>
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
                name="settlementFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phí tất toán</FormLabel>
                    <FormControl>
                      <FormattedNumberInput {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="surplusCollection"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thu dư</FormLabel>
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
                name="vatPayable"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thuế GTGT phải nộp</FormLabel>
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
              name="notes"
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
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Hủy</Button>
              <Button type="submit">Lưu</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
