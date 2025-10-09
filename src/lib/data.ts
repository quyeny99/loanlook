export type Loan = {
  code: string;
  application__code: string;
  customer__fullname: string;
  product__name: string;
  valid_from: string;
  valid_to: string;
  product__currency__code: string;
  disbursement: number;
  outstanding: number;
  due_amount: number;
  due_date: string;
  itr_next_date: string;
  prin_next_date: string;
  collat_count: number;
  status__name: string;
  create_time: string; 
};

export const loansData: Loan[] = [];
