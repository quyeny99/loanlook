import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const hasRole = (role: string, roles: string[]) => roles.includes(role);

// Permission utilities
export const canView = (role: string | null | undefined): boolean => {
  if (!role) return false;
  return ["user", "cs", "ca", "shareholder", "admin", "accountant"].includes(
    role
  );
};

export const canCreate = (role: string | null | undefined): boolean => {
  if (!role) return false;
  // shareholder và user chỉ xem, không được create
  return !["shareholder", "user"].includes(role);
};

export const canUpdate = (role: string | null | undefined): boolean => {
  if (!role) return false;
  // shareholder và user chỉ xem, không được update
  return !["shareholder", "user"].includes(role);
};

export const canDelete = (role: string | null | undefined): boolean => {
  if (!role) return false;
  // shareholder và user chỉ xem, không được delete
  return !["shareholder", "user"].includes(role);
};

// Page access utilities
export const canAccessPage = (
  role: string | null | undefined,
  page: string
): boolean => {
  if (!role) return false;

  switch (page) {
    case "/":
      return true; // All users can access home page
    case "/dashboard":
      return ["shareholder", "admin", "accountant"].includes(role);
    case "/reports/daily":
    case "/reports/monthly":
    case "/reports/date-range":
      return ["user", "admin", "shareholder", "accountant"].includes(role);
    case "/reports/statement":
      return ["user", "admin", "shareholder", "accountant"].includes(role);
    case "/service-fees":
      return ["user", "admin", "shareholder", "accountant"].includes(role);
    case "/blacklist":
      return ["cs", "ca", "admin", "shareholder"].includes(role);
    case "/overdue":
      return ["ca", "admin", "shareholder"].includes(role);
    case "/profiles":
      return role === "admin";
    default:
      return false;
  }
};

// Blacklist permissions
export const canManageBlacklist = (
  role: string | null | undefined
): boolean => {
  if (!role) return false;
  // CS chỉ xem, CA và admin có toàn quyền
  return ["ca", "admin"].includes(role);
};

// Overdue loans permissions
export const canManageOverdue = (role: string | null | undefined): boolean => {
  if (!role) return false;
  // CA và admin có toàn quyền
  return ["ca", "admin"].includes(role);
};
