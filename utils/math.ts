
import { CalculationType, SimulationResult, MonthlyData, AnnualData } from '../types';

const TARGET_GOAL = 1000000;

export const calculateCompoundInterest = (
  type: CalculationType,
  initialValue: number,
  monthlyContribution: number,
  interestRate: number,
  isRateAnnual: boolean,
  period: number,
  isPeriodYears: boolean
): SimulationResult => {
  
  // Normalize interest rate
  const monthlyRate = isRateAnnual 
    ? Math.pow(1 + interestRate / 100, 1 / 12) - 1 
    : interestRate / 100;

  let months = isPeriodYears ? period * 12 : period;
  let contribution = monthlyContribution;

  if (type === CalculationType.TIME) {
    // Calculate how many months to reach TARGET_GOAL
    // n = log((FV*i + PMT) / (PV*i + PMT)) / log(1 + i)
    if (monthlyRate === 0) {
      months = Math.ceil((TARGET_GOAL - initialValue) / contribution);
    } else {
      const numerator = TARGET_GOAL * monthlyRate + contribution;
      const denominator = initialValue * monthlyRate + contribution;
      months = Math.ceil(Math.log(numerator / denominator) / Math.log(1 + monthlyRate));
    }
  } else {
    // Calculate monthly contribution needed for TARGET_GOAL in a set time
    // PMT = (FV - PV*(1+i)^n) / (((1+i)^n - 1) / i)
    if (monthlyRate === 0) {
      contribution = (TARGET_GOAL - initialValue) / months;
    } else {
      const pow = Math.pow(1 + monthlyRate, months);
      contribution = (TARGET_GOAL - initialValue * pow) / ((pow - 1) / monthlyRate);
    }
  }

  // Safety checks
  if (isNaN(months) || months < 0) months = 0;
  if (isNaN(contribution) || contribution < 0) contribution = 0;

  const history: MonthlyData[] = [];
  let currentAccumulated = initialValue;
  let currentInvested = initialValue;
  let currentInterest = 0;

  // Add month 0
  history.push({
    month: 0,
    totalAccumulated: initialValue,
    totalInvested: initialValue,
    totalInterest: 0
  });

  for (let m = 1; m <= months; m++) {
    const interestOfMonth = currentAccumulated * monthlyRate;
    currentInterest += interestOfMonth;
    currentInvested += contribution;
    currentAccumulated = currentAccumulated + interestOfMonth + contribution;

    history.push({
      month: m,
      totalAccumulated: currentAccumulated,
      totalInvested: currentInvested,
      totalInterest: currentInterest
    });
  }

  // Generate Annual History
  const annualHistory: AnnualData[] = [];
  for (let y = 1; y <= Math.ceil(months / 12); y++) {
    const monthIdx = Math.min(y * 12, months);
    const prevMonthIdx = Math.max(0, (y - 1) * 12);
    
    const dataAtEnd = history[monthIdx];
    const dataAtStart = history[prevMonthIdx];

    annualHistory.push({
      year: y,
      annualInvestment: dataAtEnd.totalInvested - dataAtStart.totalInvested,
      annualInterest: dataAtEnd.totalInterest - dataAtStart.totalInterest,
      totalInvested: dataAtEnd.totalInvested,
      totalInterest: dataAtEnd.totalInterest,
      totalAccumulated: dataAtEnd.totalAccumulated
    });
  }

  return {
    totalFinal: currentAccumulated,
    totalInvested: currentInvested,
    totalInterest: currentInterest,
    monthlyContribution: contribution,
    periodInMonths: months,
    history,
    annualHistory
  };
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};
