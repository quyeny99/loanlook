
"use client"

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
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

const formSchema = z.object({
  paymentDate: z.date({
    required_error: "Payment date is required.",
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
  children: React.ReactNode;
  onSave: (data: Omit<Statement, 'id'>) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

export function AddStatementDialog({ children, onSave, isOpen, setIsOpen }: AddStatementDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
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

  function onSubmit(values: z.infer<typeof formSchema>) {
    onSave({
      ...values,
      paymentDate: values.paymentDate.toISOString(),
    });
    setIsOpen(false);
    form.reset();
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Statement</DialogTitle>
          <DialogDescription>
            Fill in the details for the new statement entry.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
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
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
