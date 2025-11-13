export type Adjustment = {
  date: string;
  type: string;
  amount: number;
  reason: string;
  related_ln_code: string;
  related_ap_code: string;
  reference_month: string;
};

export const adjustments: Adjustment[] = [
  // --- Trường hợp Phan Văn Hoàng ---
  {
    date: "2025-08-21",
    type: "service_fee",
    amount: -10000000,
    reason:
      "Sai kỳ ghi nhận phí dịch vụ, thực tế thuộc ngày 07/09/2025 (Phan Văn Hoàng)",
    related_ln_code: "LN200825013",
    related_ap_code: "AP200825493",
    reference_month: "2025-08",
  },
  {
    date: "2025-09-07",
    type: "service_fee",
    amount: 10000000,
    reason:
      "Điều chỉnh lại phí dịch vụ do ghi sai kỳ 21/08/2025 (Phan Văn Hoàng)",
    related_ln_code: "LN200825013",
    related_ap_code: "AP200825493",
    reference_month: "2025-09",
  },
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
  },
  {
    date: "2025-10-01",
    type: "disbursement",
    amount: -10000000,
    reason: "Điều chỉnh trừ giải ngân đã ghi sai kỳ 01/10/2025 (Vũ Ngọc Hải).",
    related_ln_code: "LN280925004",
    related_ap_code: "AP2909251395",
    reference_month: "2025-10",
  },
  {
    date: "2025-09-30",
    type: "service_fee",
    amount: 1000000,
    reason:
      "Phí dịch vụ thực tế ngày 30/09/2025, nhưng hệ thống ghi nhận 01/10/2025. Cộng vào kỳ 09/2025.",
    related_ln_code: "LN280925004",
    related_ap_code: "AP2909251395",
    reference_month: "2025-09",
  },
  {
    date: "2025-10-01",
    type: "service_fee",
    amount: -1000000,
    reason:
      "Điều chỉnh trừ phí dịch vụ đã ghi sai kỳ 01/10/2025 (Vũ Ngọc Hải).",
    related_ln_code: "LN280925004",
    related_ap_code: "AP2909251395",
    reference_month: "2025-10",
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
  },
  {
    date: "2025-09-30",
    type: "service_fee",
    amount: 1200000,
    reason:
      "Phí dịch vụ thực tế ngày 30/09/2025, nhưng hệ thống ghi nhận 01/10/2025. Cộng vào kỳ 09/2025.",
    related_ln_code: "LN300925002",
    related_ap_code: "AP3009251405",
    reference_month: "2025-09",
  },
  {
    date: "2025-10-01",
    type: "service_fee",
    amount: -1200000,
    reason:
      "Điều chỉnh trừ phí dịch vụ đã ghi sai kỳ 01/10/2025 (Nguyễn Khắc Trường).",
    related_ln_code: "LN300925002",
    related_ap_code: "AP300925002",
    reference_month: "2025-10",
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
  },
  // {
  //   date: "2025-10-12",
  //   type: "monthly_fee",
  //   amount: -720432,
  //   reason: "Trừ phí hàng tháng do khách hàng hủy khoản vay ngay sau khi giải ngân (Tú Oanh).",
  //   related_ln_code: "LN090925002",
  //   related_ap_code: "AP1009251154",
  //   reference_month: "2025-10"
  // },
  //  {
  //   date: "2025-10-12",
  //   type: "monthly_fee",
  //   amount: -48000,
  //   reason: "Trừ phí hàng tháng do khách hàng hủy khoản vay ngay sau khi giải ngân (Tú Oanh).",
  //   related_ln_code: "LN090925002",
  //   related_ap_code: "AP1009251154",
  //   reference_month: "2025-10"
  // },
  // {
  //   date: "2025-10-12",
  //   type: "monthly_interest",
  //   amount: -180174,
  //   reason: "Trừ lãi hàng tháng do khách hàng hủy khoản vay ngay sau khi giải ngân (Tú Oanh).",
  //   related_ln_code: "LN090925002",
  //   related_ap_code: "AP1009251154",
  //   reference_month: "2025-10"
  // },
  // {
  //   date: "2025-10-12",
  //   type: "monthly_interest",
  //   amount: -8000,
  //   reason: "Trừ lãi hàng tháng do khách hàng hủy khoản vay ngay sau khi giải ngân (Tú Oanh).",
  //   related_ln_code: "LN090925002",
  //   related_ap_code: "AP1009251154",
  //   reference_month: "2025-10"
  // }
];
