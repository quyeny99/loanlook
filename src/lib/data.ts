export type Loan = {
  loanCode: string;
  applicationCode: string;
  customer: {
    name: string;
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
  collateral: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  loanDate: Date; 
};

export const loansData: Loan[] = [
  {
    loanCode: 'LN-001',
    applicationCode: 'APP-0123',
    customer: {
      name: 'Liam Johnson',
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
    collateral: 0,
    status: 'Pending',
    loanDate: new Date(new Date().setDate(new Date().getDate() - 10)),
  },
  {
    loanCode: 'LN-002',
    applicationCode: 'APP-0124',
    customer: {
      name: 'Olivia Smith',
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
    collateral: 1,
    status: 'Paid',
    loanDate: new Date('2023-05-20'),
  },
  {
    loanCode: 'LN-003',
    applicationCode: 'APP-0125',
    customer: {
      name: 'Noah Williams',
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
    collateral: 0,
    status: 'Overdue',
    loanDate: new Date('2024-01-10'),
  },
    {
    loanCode: 'LN-004',
    applicationCode: 'APP-0126',
    customer: {
      name: 'Emma Brown',
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
    collateral: 1,
    status: 'Pending',
    loanDate: new Date(),
  },
  {
    loanCode: 'LN-005',
    applicationCode: 'APP-0127',
    customer: {
      name: 'Oliver Jones',
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
    collateral: 2,
    status: 'Pending',
    loanDate: new Date(new Date().setDate(new Date().getDate() - 35)),
  },
];
