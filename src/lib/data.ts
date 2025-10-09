export type Loan = {
  loanCode: string;
  customer: {
    name: string;
    avatarUrl: string;
    avatarHint: string;
  };
  loanAmount: number;
  interestRate: number;
  loanDate: Date;
  dueDate: Date;
  status: 'Paid' | 'Pending' | 'Overdue';
};

export const loansData: Loan[] = [
  {
    loanCode: 'LN-001',
    customer: {
      name: 'Liam Johnson',
      avatarUrl: 'https://picsum.photos/seed/1/32/32',
      avatarHint: "man portrait"
    },
    loanAmount: 2500,
    interestRate: 5.5,
    loanDate: new Date(new Date().setDate(new Date().getDate() - 10)),
    dueDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    status: 'Pending',
  },
  {
    loanCode: 'LN-002',
    customer: {
      name: 'Olivia Smith',
      avatarUrl: 'https://picsum.photos/seed/2/32/32',
      avatarHint: "woman portrait"
    },
    loanAmount: 15000,
    interestRate: 4.2,
    loanDate: new Date('2023-05-20'),
    dueDate: new Date('2024-05-20'),
    status: 'Paid',
  },
  {
    loanCode: 'LN-003',
    customer: {
      name: 'Noah Williams',
      avatarUrl: 'https://picsum.photos/seed/3/32/32',
      avatarHint: "man face"
    },
    loanAmount: 750,
    interestRate: 10.0,
    loanDate: new Date('2024-01-10'),
    dueDate: new Date('2024-07-10'),
    status: 'Overdue',
  },
  {
    loanCode: 'LN-004',
    customer: {
      name: 'Emma Brown',
      avatarUrl: 'https://picsum.photos/seed/4/32/32',
      avatarHint: "woman face"
    },
    loanAmount: 5000,
    interestRate: 6.1,
    loanDate: new Date(), // Today
    dueDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    status: 'Pending',
  },
  {
    loanCode: 'LN-005',
    customer: {
      name: 'Oliver Jones',
      avatarUrl: 'https://picsum.photos/seed/5/32/32',
      avatarHint: "man smiling"
    },
    loanAmount: 120000,
    interestRate: 3.8,
    loanDate: new Date(new Date().setDate(new Date().getDate() - 35)),
    dueDate: new Date(new Date().setFullYear(new Date().getFullYear() + 5)),
    status: 'Pending',
  },
  {
    loanCode: 'LN-006',
    customer: {
      name: 'Ava Garcia',
      avatarUrl: 'https://picsum.photos/seed/6/32/32',
      avatarHint: "woman smiling"
    },
    loanAmount: 8500,
    interestRate: 7.2,
    loanDate: new Date(new Date().setDate(new Date().getDate() - 6)), 
    dueDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)),
    status: 'Pending',
  },
  {
    loanCode: 'LN-007',
    customer: {
      name: 'Elijah Miller',
      avatarUrl: 'https://picsum.photos/seed/7/32/32',
      avatarHint: "man glasses"
    },
    loanAmount: 200,
    interestRate: 15.0,
    loanDate: new Date('2023-11-01'),
    dueDate: new Date('2024-05-01'),
    status: 'Paid',
  },
  {
    loanCode: 'LN-008',
    customer: {
      name: 'Sophia Davis',
      avatarUrl: 'https://picsum.photos/seed/8/32/32',
      avatarHint: "woman professional"
    },
    loanAmount: 65000,
    interestRate: 4.9,
    loanDate: new Date(new Date().setDate(new Date().getDate() - 25)),
    dueDate: new Date(new Date().setFullYear(new Date().getFullYear() + 5)),
    status: 'Pending',
  },
  {
    loanCode: 'LN-009',
    customer: {
      name: 'James Rodriguez',
      avatarUrl: 'https://picsum.photos/seed/9/32/32',
      avatarHint: "man profile"
    },
    loanAmount: 1250,
    interestRate: 8.5,
    loanDate: new Date('2024-02-18'),
    dueDate: new Date('2024-08-18'),
    status: 'Pending',
  },
  {
    loanCode: 'LN-010',
    customer: {
      name: 'Isabella Martinez',
      avatarUrl: 'https://picsum.photos/seed/10/32/32',
      avatarHint: "woman profile"
    },
    loanAmount: 3000,
    interestRate: 5.0,
    loanDate: new Date(new Date().setDate(new Date().getDate() - 40)),
    dueDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    status: 'Overdue',
  },
   {
    loanCode: 'LN-011',
    customer: {
      name: 'William Hernandez',
      avatarUrl: 'https://picsum.photos/seed/11/32/32',
      avatarHint: "man business"
    },
    loanAmount: 18000,
    interestRate: 4.5,
    loanDate: new Date('2023-12-01'),
    dueDate: new Date('2024-12-01'),
    status: 'Pending',
  },
  {
    loanCode: 'LN-012',
    customer: {
      name: 'Mia Lopez',
      avatarUrl: 'https://picsum.photos/seed/12/32/32',
      avatarHint: "woman nature"
    },
    loanAmount: 400,
    interestRate: 12.0,
    loanDate: new Date(new Date().setDate(new Date().getDate() - 1)), // Yesterday
    dueDate: new Date(new Date().setMonth(new Date().getMonth() + 6)),
    status: 'Pending',
  },
];
