export type Loan = {
  loanCode: string;
  applicationCode: string;
  customer: {
    name: string;
    avatarUrl: string;
    avatarHint: string;
    phone: string;
  };
  product: string;
  fromDate: Date;
  toDate: Date;
  currency: string;
  disbursed: number;
  outstanding: number;
  dueAmount: number;
  dueDate: Date;
  interestDate: Date;
  principalDate: Date;
  interestPaymentTerm: string;
  principalRepaymentTerm: string;
  collateral: string;
  profit: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  note: string;
  interestRate: number; // Keep for sorting if needed, though not in new table
  loanDate: Date; // Keep for filtering, can be same as fromDate
};

export const loansData: Loan[] = [
  {
    loanCode: 'LN-001',
    applicationCode: 'APP-0123',
    customer: {
      name: 'Liam Johnson',
      avatarUrl: 'https://picsum.photos/seed/1/32/32',
      avatarHint: "man portrait",
      phone: '555-0101'
    },
    product: 'Personal Loan',
    fromDate: new Date(new Date().setDate(new Date().getDate() - 10)),
    toDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    currency: 'USD',
    disbursed: 2500,
    outstanding: 2500,
    dueAmount: 100.50,
    dueDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    interestDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    principalDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    interestPaymentTerm: 'Monthly',
    principalRepaymentTerm: 'Monthly',
    collateral: 'No',
    profit: 0,
    status: 'Pending',
    note: '',
    interestRate: 5.5,
    loanDate: new Date(new Date().setDate(new Date().getDate() - 10)),
  },
  {
    loanCode: 'LN-002',
    applicationCode: 'APP-0124',
    customer: {
      name: 'Olivia Smith',
      avatarUrl: 'https://picsum.photos/seed/2/32/32',
      avatarHint: "woman portrait",
      phone: '555-0102'
    },
    product: 'Mortgage',
    fromDate: new Date('2023-05-20'),
    toDate: new Date('2024-05-20'),
    currency: 'USD',
    disbursed: 15000,
    outstanding: 0,
    dueAmount: 0,
    dueDate: new Date('2024-05-20'),
    interestDate: new Date('2024-05-20'),
    principalDate: new Date('2024-05-20'),
    interestPaymentTerm: 'Monthly',
    principalRepaymentTerm: 'Monthly',
    collateral: 'Yes',
    profit: 1500,
    status: 'Paid',
    note: 'Early repayment',
    interestRate: 4.2,
    loanDate: new Date('2023-05-20'),
  },
  {
    loanCode: 'LN-003',
    applicationCode: 'APP-0125',
    customer: {
      name: 'Noah Williams',
      avatarUrl: 'https://picsum.photos/seed/3/32/32',
      avatarHint: "man face",
      phone: '555-0103'
    },
    product: 'Payday Loan',
    fromDate: new Date('2024-01-10'),
    toDate: new Date('2024-07-10'),
    currency: 'USD',
    disbursed: 750,
    outstanding: 800,
    dueAmount: 800,
    dueDate: new Date('2024-07-10'),
    interestDate: new Date('2024-02-10'),
    principalDate: new Date('2024-07-10'),
    interestPaymentTerm: 'On-Maturity',
    principalRepaymentTerm: 'On-Maturity',
    collateral: 'No',
    profit: -50,
    status: 'Overdue',
    note: 'Contacted customer',
    interestRate: 10.0,
    loanDate: new Date('2024-01-10'),
  },
    {
    loanCode: 'LN-004',
    applicationCode: 'APP-0126',
    customer: {
      name: 'Emma Brown',
      avatarUrl: 'https://picsum.photos/seed/4/32/32',
      avatarHint: "woman face",
      phone: '555-0104'
    },
    product: 'Auto Loan',
    fromDate: new Date(),
    toDate: new Date(new Date().setFullYear(new Date().getFullYear() + 3)),
    currency: 'USD',
    disbursed: 5000,
    outstanding: 5000,
    dueAmount: 152.20,
    dueDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    interestDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    principalDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    interestPaymentTerm: 'Monthly',
    principalRepaymentTerm: 'Monthly',
    collateral: 'Yes',
    profit: 0,
    status: 'Pending',
    note: 'Awaiting first payment',
    interestRate: 6.1,
    loanDate: new Date(),
  },
  {
    loanCode: 'LN-005',
    applicationCode: 'APP-0127',
    customer: {
      name: 'Oliver Jones',
      avatarUrl: 'https://picsum.photos/seed/5/32/32',
      avatarHint: "man smiling",
      phone: '555-0105'
    },
    product: 'Business Loan',
    fromDate: new Date(new Date().setDate(new Date().getDate() - 35)),
    toDate: new Date(new Date().setFullYear(new Date().getFullYear() + 5)),
    currency: 'USD',
    disbursed: 120000,
    outstanding: 118500,
    dueAmount: 2500,
    dueDate: new Date(new Date().setFullYear(new Date().getFullYear() + 5)),
    interestDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    principalDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    interestPaymentTerm: 'Quarterly',
    principalRepaymentTerm: 'Quarterly',
    collateral: 'Yes',
    profit: 1500,
    status: 'Pending',
    note: '',
    interestRate: 3.8,
    loanDate: new Date(new Date().setDate(new Date().getDate() - 35)),
  },
];
