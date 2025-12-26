
export enum CalculationType {
  TIME = 'TIME',
  CONTRIBUTION = 'CONTRIBUTION'
}

export enum PeriodType {
  YEARS = 'YEARS',
  MONTHS = 'MONTHS'
}

export enum InterestRateType {
  ANNUAL = 'ANNUAL',
  MONTHLY = 'MONTHLY'
}

export interface SimulationResult {
  totalFinal: number;
  totalInvested: number;
  totalInterest: number;
  monthlyContribution: number;
  periodInMonths: number;
  history: MonthlyData[];
  annualHistory: AnnualData[];
}

export interface MonthlyData {
  month: number;
  totalAccumulated: number;
  totalInvested: number;
  totalInterest: number;
}

export interface AnnualData {
  year: number;
  annualInvestment: number;
  annualInterest: number;
  totalInvested: number;
  totalInterest: number;
  totalAccumulated: number;
}
