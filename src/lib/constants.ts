export type Adjustment = {
  date: string;
  type: string;
  amount: number;
  reason: string;
  related_ln_code: string;
  related_ap_code: string;
  reference_month: string;
  fullname: string;
  approve_term: number;
  commission: number;
  country: number;
  country__name: string;
  country__en: string;
  legal_type__name: string;
  legal_type__code: string;
  province: string;
  product__type__en: string;
  source__name: string;
  id: number;
};

export const adjustments: Adjustment[] = [
  // --- Trường hợp Vũ Ngọc Hải ---
  {
    date: "2025-09-30",
    type: "disbursement",
    amount: 10000000,
    reason:
      "Giải ngân thực tế 30/09/2025, nhưng hệ thống ghi nhận 01/10/2025. Cộng vào kỳ 09/2025.",
    related_ln_code: "LN280925004",
    related_ap_code: "AP2909251395",
    reference_month: "2025-09",
    fullname: "Vũ Ngọc Hải",
    id: 2119,
    approve_term: 6,
    commission: 0,
    country: 3,
    country__name: "Đài Loan",
    country__en: "Taiwan",
    legal_type__name: "Căn cước công dân",
    legal_type__code: "CCCD",
    province: "Tân Bắc",
    product__type__en: "Pawning",
    source__name: "Website",
  },
  {
    date: "2025-10-01",
    type: "disbursement",
    amount: -10000000,
    reason: "Điều chỉnh trừ giải ngân đã ghi sai kỳ 01/10/2025 (Vũ Ngọc Hải).",
    related_ln_code: "LN280925004",
    related_ap_code: "AP2909251395",
    fullname: "Vũ Ngọc Hải",
    reference_month: "2025-10",
    approve_term: 6,
    commission: 0,
    country: 3,
    country__name: "Đài Loan",
    country__en: "Taiwan",
    legal_type__name: "Căn cước công dân",
    province: "Tân Bắc",
    product__type__en: "Pawning",
    source__name: "Website",
    legal_type__code: "CCCD",
    id: 2120,
  },

  // --- Trường hợp Nguyễn Khắc Trường ---
  {
    date: "2025-09-30",
    type: "disbursement",
    amount: 12000000,
    reason:
      "Giải ngân thực tế 30/09/2025, nhưng hệ thống ghi nhận 01/10/2025. Cộng vào kỳ 09/2025.",
    related_ln_code: "LN300925002",
    related_ap_code: "AP3009251405",
    reference_month: "2025-09",
    fullname: "Nguyễn Khắc Trường",
    id: 2124,
    approve_term: 6,
    commission: 0,
    country: 3,
    country__name: "Đài Loan",
    country__en: "Taiwan",
    legal_type__name: "Căn cước công dân",
    province: "Yilan",
    product__type__en: "Pawning",
    source__name: "Website",
    legal_type__code: "CCCD",
  },
  {
    date: "2025-10-01",
    type: "disbursement",
    amount: -12000000,
    reason:
      "Điều chỉnh trừ giải ngân đã ghi sai kỳ 01/10/2025 (Nguyễn Khắc Trường).",
    related_ln_code: "LN300925002",
    related_ap_code: "AP3009251405",
    reference_month: "2025-10",
    fullname: "Nguyễn Khắc Trường",
    id: 2125,
    approve_term: 6,
    commission: 0,
    country: 3,
    country__name: "Đài Loan",
    country__en: "Taiwan",
    legal_type__name: "Căn cước công dân",
    province: "Yilan",
    product__type__en: "Pawning",
    source__name: "Website",
    legal_type__code: "CCCD",
  },
  // --- Trường hợp Tú Oanh ---
  {
    date: "2025-09-10",
    type: "disbursement",
    amount: -15000000,
    reason:
      "Đã giải ngân nhưng khách hàng muốn hủy khoản vay, trừ vào kỳ 09/2025 (Tú Oanh).",
    related_ln_code: "LN090925002",
    related_ap_code: "AP1009251154",
    reference_month: "2025-09",
    fullname: "Tú Oanh",
    id: 1656,
    approve_term: 3,
    commission: 0,
    country: 1,
    country__name: "Việt Nam",
    country__en: "Vietnam",
    legal_type__name: "Hộ chiếu",
    province: "Singapore",
    product__type__en: "Unsecured Loan",
    source__name: "Website",
    legal_type__code: "HC",
  },
];
