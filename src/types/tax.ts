// Student loan plan types
export type StudentLoanPlan = 'plan1' | 'plan2' | 'plan4' | 'plan5' | 'postgrad';

export interface StudentLoanOption {
  plan: StudentLoanPlan;
  label: string;
}

// Tax year constants types
export interface ChildBenefitRates {
  firstChildRate: number;
  additionalChildRate: number;
}

export interface TaxAllowanceConstants {
  basicAllowance: number;
  taperThreshold: number;
  blindPersonsAllowance: number;
}

export interface NationalInsuranceConstants {
  lowerEarningsLimit: number;
  primaryThreshold: number;
  secondaryThreshold: number;
  upperEarningsLimit: number;
  employerRates: [number, number];
  employeeRates: [number, number];
}

export interface StudentLoanThresholds {
  plan1: number;
  plan2: number;
  plan4: number;
  plan5: number;
  postgrad: number;
}

export interface StudentLoanConstants {
  defaultRate: number;
  postgradRate: number;
  thresholds: StudentLoanThresholds;
}

// Tax band: [rate, upper limit]
export type TaxBand = [number, number];

export interface IncomeTaxConstants {
  scotland: TaxBand[];
  restOfUK: TaxBand[];
}

export interface TaxYearConstants {
  childBenefitRates: ChildBenefitRates;
  taxAllowance: TaxAllowanceConstants;
  nationalInsurance: NationalInsuranceConstants;
  studentLoan: StudentLoanConstants;
  incomeTax: IncomeTaxConstants;
}

export type TaxYearKey = string;

export type TaxYearsData = Record<TaxYearKey, TaxYearConstants>;

// User input types
export interface ChildBenefitsInput {
  childBenefitsTaken: boolean;
  numberOfChildren: number;
}

export interface PensionContributionsInput {
  autoEnrolment: number;
  salarySacrifice: number;
  personal: number;
}

export type ActiveTab = 'taxYearOverview' | 'incomeAnalysis' | 'firstHomes';

export interface TaxInputs {
  taxYear: TaxYearKey;
  studentLoan: StudentLoanPlan[];
  annualGrossSalary: number;
  annualGrossBonus: number;
  grossEarningsRange: number;
  residentInScotland: boolean;
  noNI: boolean;
  blind: boolean;
  childBenefits: ChildBenefitsInput;
  pensionContributions: PensionContributionsInput;
  autoEnrolmentAsSalarySacrifice: boolean;
  taxReliefAtSource: boolean;
  activeTab: ActiveTab;
  firstHomesLondon: boolean;
}

// Calculation result types
export interface BreakdownItem {
  rate: string | number;
  amount: number;
}

export interface CalculationResult {
  total: number;
  breakdown: BreakdownItem[];
}

export interface TaxCalculationResult {
  grossEarnings: CalculationResult;
  adjustedNetIncome: number;
  taxAllowance: CalculationResult;
  taxableIncome: number;
  incomeTax: CalculationResult;
  employeeNI: CalculationResult;
  employerNI: CalculationResult;
  studentLoanRepayments: CalculationResult;
  combinedTaxes: number;
  childBenefits: CalculationResult;
  takeHomePay: number;
  pensionPot: CalculationResult;
  yourMoney: number;
}
