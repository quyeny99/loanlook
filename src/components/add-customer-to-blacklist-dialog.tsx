"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/context/AuthContext";
import type { BlacklistedCustomer } from "@/lib/data";
import { useEffect } from "react";

const formSchema = z.object({
  customer_id: z.string().min(1, "Customer ID là bắt buộc."),
  name: z.string().min(1, "Tên khách hàng là bắt buộc."),
  phone: z.string().optional(),
  reason: z.string().min(1, "Lý do blacklist là bắt buộc."),
});

type AddCustomerToBlacklistDialogProps = {
  onSave: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  customerToEdit?: BlacklistedCustomer | null;
};

export function AddCustomerToBlacklistDialog({
  onSave,
  isOpen,
  setIsOpen,
  customerToEdit,
}: AddCustomerToBlacklistDialogProps) {
  const { toast } = useToast();
  const { loginId } = useAuth();
  const isEditMode = !!customerToEdit;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customer_id: "",
      name: "",
      phone: "",
      reason: "",
    },
  });

  useEffect(() => {
    if (isEditMode && customerToEdit) {
      form.reset({
        customer_id: customerToEdit.customer_id,
        name: customerToEdit.name,
        phone: customerToEdit.phone || "",
        reason: customerToEdit.reason,
      });
    } else {
      form.reset({
        customer_id: "",
        name: "",
        phone: "",
        reason: "",
      });
    }
  }, [customerToEdit, isEditMode, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const userId = loginId || localStorage.getItem("userId");
      if (!userId) {
        toast({
          title: "Error",
          description: "User ID not found. Please log in again.",
          variant: "destructive",
        });
        return;
      }

      // Get user info from localStorage (saved during login, no API call needed)
      const userInfoString = localStorage.getItem("userInfo");
      let blacklistedByName = "Unknown";
      if (userInfoString) {
        try {
          const userInfo = JSON.parse(userInfoString);
          blacklistedByName =
            userInfo.fullname || userInfo.username || "Unknown";
        } catch (e) {
          console.error("Failed to parse user info", e);
        }
      }

      const supabase = createClient();
      let error;

      if (isEditMode && customerToEdit) {
        // Update existing customer
        const { error: updateError } = await supabase
          .from("blacklisted_customers")
          .update({
            customer_id: values.customer_id,
            name: values.name,
            phone: values.phone || null,
            reason: values.reason,
          })
          .eq("id", customerToEdit.id);

        error = updateError;
      } else {
        // Insert new customer
        const { error: insertError } = await supabase
          .from("blacklisted_customers")
          .insert({
            customer_id: values.customer_id,
            name: values.name,
            phone: values.phone || null,
            reason: values.reason,
            blacklisted_by: userId,
            blacklisted_by_name: blacklistedByName,
          });

        error = insertError;
      }

      if (error) {
        console.error(
          `Error ${isEditMode ? "updating" : "adding"} customer to blacklist:`,
          error
        );
        toast({
          title: "Error",
          description:
            error.message ||
            `Failed to ${isEditMode ? "update" : "add"} customer to blacklist.`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: `Customer has been ${
          isEditMode ? "updated" : "added to blacklist"
        }.`,
      });

      form.reset();
      setIsOpen(false);
      onSave();
    } catch (error) {
      console.error("Failed to add customer to blacklist:", error);
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
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditMode
              ? "Cập nhật khách hàng trong Blacklist"
              : "Thêm khách hàng vào Blacklist"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Cập nhật thông tin khách hàng trong danh sách blacklist."
              : "Nhập thông tin khách hàng để thêm vào danh sách blacklist."}
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
              name="customer_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer ID *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Nhập Customer ID"
                      disabled={isEditMode}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên khách hàng *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Tên khách hàng" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Số điện thoại" />
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
                  <FormLabel>Lý do blacklist *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Nhập lý do blacklist khách hàng..."
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
                {isEditMode ? "Cập nhật" : "Thêm vào Blacklist"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
