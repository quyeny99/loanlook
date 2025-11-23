import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { USER_ROLES } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const hasRole = (role: string, roles: string[]) => roles.includes(role);

// Permission utilities
export const canView = (role: string | null | undefined): boolean => {
  if (!role) return false;
  const validRoles: string[] = [
    USER_ROLES.USER,
    USER_ROLES.CS,
    USER_ROLES.CA,
    USER_ROLES.SHAREHOLDER,
    USER_ROLES.ADMIN,
    USER_ROLES.ACCOUNTANT,
  ];
  return validRoles.includes(role);
};

export const canCreate = (role: string | null | undefined): boolean => {
  if (!role) return false;
  // shareholder và user chỉ xem, không được create
  const restrictedRoles: string[] = [USER_ROLES.SHAREHOLDER, USER_ROLES.USER];
  return !restrictedRoles.includes(role);
};

export const canUpdate = (role: string | null | undefined): boolean => {
  if (!role) return false;
  // shareholder và user chỉ xem, không được update
  const restrictedRoles: string[] = [USER_ROLES.SHAREHOLDER, USER_ROLES.USER];
  return !restrictedRoles.includes(role);
};

export const canDelete = (role: string | null | undefined): boolean => {
  if (!role) return false;
  // shareholder và user chỉ xem, không được delete
  const restrictedRoles: string[] = [USER_ROLES.SHAREHOLDER, USER_ROLES.USER];
  return !restrictedRoles.includes(role);
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
    case "/dashboard": {
      const allowedRoles: string[] = [
        USER_ROLES.SHAREHOLDER,
        USER_ROLES.ADMIN,
        USER_ROLES.ACCOUNTANT,
      ];
      return allowedRoles.includes(role);
    }
    case "/reports/daily":
    case "/reports/monthly":
    case "/reports/date-range": {
      const allowedRoles: string[] = [
        USER_ROLES.USER,
        USER_ROLES.ADMIN,
        USER_ROLES.SHAREHOLDER,
        USER_ROLES.ACCOUNTANT,
      ];
      return allowedRoles.includes(role);
    }
    case "/reports/statement": {
      const allowedRoles: string[] = [
        USER_ROLES.USER,
        USER_ROLES.ADMIN,
        USER_ROLES.SHAREHOLDER,
        USER_ROLES.ACCOUNTANT,
      ];
      return allowedRoles.includes(role);
    }
    case "/service-fees": {
      const allowedRoles: string[] = [
        USER_ROLES.USER,
        USER_ROLES.ADMIN,
        USER_ROLES.SHAREHOLDER,
        USER_ROLES.ACCOUNTANT,
      ];
      return allowedRoles.includes(role);
    }
    case "/blacklist": {
      const allowedRoles: string[] = [
        USER_ROLES.CS,
        USER_ROLES.CA,
        USER_ROLES.ADMIN,
        USER_ROLES.SHAREHOLDER,
      ];
      return allowedRoles.includes(role);
    }
    case "/overdue": {
      const allowedRoles: string[] = [
        USER_ROLES.CA,
        USER_ROLES.ADMIN,
        USER_ROLES.SHAREHOLDER,
      ];
      return allowedRoles.includes(role);
    }
    case "/profiles":
      return role === USER_ROLES.ADMIN;
    case "/exclude-disbursement": {
      const allowedRoles: string[] = [USER_ROLES.ADMIN, USER_ROLES.ACCOUNTANT];
      return allowedRoles.includes(role);
    }
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
  const allowedRoles: string[] = [USER_ROLES.CA, USER_ROLES.ADMIN];
  return allowedRoles.includes(role);
};

// Overdue loans permissions
export const canManageOverdue = (role: string | null | undefined): boolean => {
  if (!role) return false;
  // CA và admin có toàn quyền
  const allowedRoles: string[] = [USER_ROLES.CA, USER_ROLES.ADMIN];
  return allowedRoles.includes(role);
};

// Reports permissions - Admin and Accountant can view all summary cards
export const canViewAllReports = (role: string | null | undefined): boolean => {
  if (!role) return false;
  return role === USER_ROLES.ADMIN || role === USER_ROLES.ACCOUNTANT;
};
