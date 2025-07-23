export const baseWage = 2340000;
export const regionalMinimum = 4960000; // Region 1

export const insuranceRate = {
  employee: {
    social: 0.08,
    health: 0.015,
    unemployment: 0.01
  },
  employer: {
    social: 0.175,
    health: 0.03,
    unemployment: 0.01
  }
};

export const taxRate = [
  { max: 5000000, rate: 0.05, reduce: 0 },
  { max: 10000000, rate: 0.10, reduce: 250000 },
  { max: 18000000, rate: 0.15, reduce: 750000 },
  { max: 32000000, rate: 0.20, reduce: 1650000 },
  { max: 52000000, rate: 0.25, reduce: 3250000 },
  { max: 80000000, rate: 0.30, reduce: 5850000 },
  { max: Infinity, rate: 0.35, reduce: 9850000 }
];

export const unionFee = 0.02;
export const personalDeduction = 11000000;