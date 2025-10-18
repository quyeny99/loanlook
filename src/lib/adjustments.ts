
export type Adjustment = {
    code: string;
    amount: number;
    reason: string;
};

export const adjustments: Adjustment[] = [
    {
        code: "AP200825493",
        amount: -10000000,
        reason: "Không tính phí thẩm định do bên kế toán đã thay đổi tài khoản ngân hàng"
    },
    {
        code: "AP0409251058",
        amount: 25000,
        reason: "Do hệ thống tính sai phí dịch vụ phí thực cần trừ là 375,000 nhưng hệ thống tính là 350,000"
    },
    {
        code: "AP1009251154",
        amount: -1500000,
        reason: "Đã giải ngân đơn vay nhưng khách hàng hủy nên hoàn trả lại phí dịch vụ"
    }
];
