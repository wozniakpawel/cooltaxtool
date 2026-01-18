import { taxYears } from './TaxYears';
import { studentLoanOptions } from '../components/UserMenu';
import type {
    TaxYearConstants,
    TaxInputs,
    CalculationResult,
    TaxCalculationResult,
    BreakdownItem,
    StudentLoanPlan,
    ChildBenefitsInput,
    ChildBenefitRates,
    StudentLoanOption,
    PensionContributionsInput,
} from '../types/tax';


// ============================================================================
// Gross Earnings
// ============================================================================

// Gross Earnings = Salary + Bonuses + Other Income (Dividends, Rental Income, etc.)
export function calculateGrossEarnings(
    annualGrossSalary: number,
    annualGrossBonus: number
): CalculationResult {
    const total = annualGrossSalary + annualGrossBonus;
    const breakdown: BreakdownItem[] = [
        { rate: "Annual Gross Salary", amount: annualGrossSalary },
        { rate: "Annual Gross Bonus", amount: annualGrossBonus },
    ];

    return { total, breakdown };
}

// ============================================================================
// Pension Contributions
// ============================================================================

export function grossPensionContribution(
    contribution: number,
    taxReliefAtSource: boolean
): number {
    // Tax relief at source: contributions are grossed up by 100/80 = 1.25 (basic rate = 20%)
    const TAX_RELIEF_GROSS_UP_FACTOR = 1.25;
    return taxReliefAtSource ? contribution * TAX_RELIEF_GROSS_UP_FACTOR : contribution;
}

export function calculatePensionPot(
    grossEarnings: number,
    pensionContributions: PensionContributionsInput,
    autoEnrolmentAsSalarySacrifice: boolean,
    taxReliefAtSource: boolean
): { pensionPot: CalculationResult; incomeAfterSalarySacrifice: number } {
    // Apply salary sacrifice
    let incomeAfterSalarySacrifice = Math.max(0, grossEarnings - pensionContributions.salarySacrifice);

    // Calculate auto enrolment contribution
    const autoEnrolmentContribution = incomeAfterSalarySacrifice * (pensionContributions.autoEnrolment / 100);

    // Deduct auto enrolment from income if treated as salary sacrifice
    if (autoEnrolmentAsSalarySacrifice) {
        incomeAfterSalarySacrifice -= autoEnrolmentContribution;
    }

    // Calculate personal contribution with tax relief grossing
    const grossedPersonalContribution = grossPensionContribution(
        pensionContributions.personal,
        taxReliefAtSource
    );

    // Build pension pot result
    const total = pensionContributions.salarySacrifice + autoEnrolmentContribution + grossedPersonalContribution;
    const breakdown: BreakdownItem[] = [
        { rate: "Salary sacrifice", amount: pensionContributions.salarySacrifice },
        { rate: "Auto enrolment", amount: autoEnrolmentContribution },
        { rate: "Gross Personal", amount: grossedPersonalContribution },
    ];

    return {
        pensionPot: { total, breakdown },
        incomeAfterSalarySacrifice,
    };
}

// ============================================================================
// Tax Allowance
// ============================================================================

// Tax Allowance = Personal Allowance (tapered) + Blind Person's Allowance
export function calculateTaxAllowance(
    adjustedNetIncome: number,
    isBlind: boolean,
    constants: TaxYearConstants
): CalculationResult {
    const { basicAllowance, taperThreshold, blindPersonsAllowance } = constants.taxAllowance;
    const breakdown: BreakdownItem[] = [];

    // Personal allowance is reduced by £1 for every £2 of income above the taper threshold
    const PERSONAL_ALLOWANCE_TAPER_RATE = 0.5;


    // Calculate personal allowance with tapering
    let personalAllowance = basicAllowance;
    if (adjustedNetIncome > taperThreshold) {
        const reduction = Math.floor((adjustedNetIncome - taperThreshold) * PERSONAL_ALLOWANCE_TAPER_RATE);
        personalAllowance = Math.max(0, basicAllowance - reduction);
    }
    breakdown.push({ rate: "Personal Allowance", amount: personalAllowance });

    // Add blind person's allowance if applicable
    let blindAllowance = 0;
    if (isBlind) {
        blindAllowance = blindPersonsAllowance;
        breakdown.push({ rate: "Blind Person's Allowance", amount: blindAllowance });
    }

    const total = personalAllowance + blindAllowance;
    return { total, breakdown };
}

// ============================================================================
// Income Tax
// ============================================================================

export function calculateIncomeTax(
    taxableIncome: number,
    constants: TaxYearConstants,
    residentInScotland: boolean
): CalculationResult {
    const taxBands = residentInScotland ? constants.incomeTax.scotland : constants.incomeTax.restOfUK;
    const breakdown: BreakdownItem[] = [];
    let total = 0;

    let remainingIncome = taxableIncome;
    let previousLimit = 0;

    for (const [rate, upperLimit] of taxBands) {
        if (remainingIncome <= 0) break;

        const bandWidth = upperLimit - previousLimit;
        const taxableInBand = Math.min(remainingIncome, bandWidth);
        const taxInBand = taxableInBand * rate;

        total += taxInBand;
        remainingIncome -= taxableInBand;
        breakdown.push({ rate, amount: taxInBand });

        previousLimit = upperLimit;
    }

    return { total, breakdown };
}

// ============================================================================
// National Insurance
// ============================================================================

export function calculateNationalInsurance(
    income: number,
    constants: TaxYearConstants,
    isEmployer: boolean,
    noNI: boolean
): CalculationResult {
    if (noNI) {
        return { total: 0, breakdown: [] };
    }

    const { primaryThreshold, secondaryThreshold, upperEarningsLimit, employeeRates, employerRates } = constants.nationalInsurance;
    const threshold = isEmployer ? secondaryThreshold : primaryThreshold;
    const rates = isEmployer ? employerRates : employeeRates;
    const breakdown: BreakdownItem[] = [];

    let remainingIncome = Math.max(0, income - threshold);
    let total = 0;

    // First band: threshold to upper earnings limit
    if (remainingIncome > 0) {
        const incomeInFirstBand = Math.min(remainingIncome, upperEarningsLimit - threshold);
        if (incomeInFirstBand > 0) {
            const niInFirstBand = incomeInFirstBand * rates[0];
            total += niInFirstBand;
            remainingIncome -= incomeInFirstBand;
            breakdown.push({ rate: rates[0], amount: niInFirstBand });
        }
    }

    // Second band: above upper earnings limit
    if (remainingIncome > 0) {
        const niInSecondBand = remainingIncome * rates[1];
        total += niInSecondBand;
        breakdown.push({ rate: rates[1], amount: niInSecondBand });
    }

    return { total, breakdown };
}

// ============================================================================
// Student Loan Repayments
// ============================================================================

export function calculateStudentLoanRepayments(
    income: number,
    studentLoanPlans: StudentLoanPlan[],
    constants: TaxYearConstants
): CalculationResult {
    const { defaultRate, postgradRate, thresholds } = constants.studentLoan;
    const breakdown: BreakdownItem[] = [];

    if (studentLoanPlans.length === 0) {
        return { total: 0, breakdown };
    }

    const hasPostgrad = studentLoanPlans.includes("postgrad");
    // Filter postgraduate plan and sort the rest in ascending order of thresholds
    const nonPostgradPlans = studentLoanPlans
        .filter((plan): plan is Exclude<StudentLoanPlan, 'postgrad'> => plan !== "postgrad")
        .sort((a, b) => thresholds[a] - thresholds[b]);

    // Calculate repayments for non-postgraduate plans
    // If you selected multiple non-postgraduate plans,
    // you will still pay the same you would with only one non-postgraduate plan
    // but the payments will be split between the plans based on their thresholds
    let nonPostgradTotal: number = 0;
    nonPostgradPlans.forEach((plan, index) => {
        const option = (studentLoanOptions as StudentLoanOption[]).find(o => o.plan === plan);
        const planThreshold = thresholds[plan];
        const nextThreshold = index < nonPostgradPlans.length - 1
            ? thresholds[nonPostgradPlans[index + 1]]
            : Infinity;

        const amount = income <= planThreshold
            ? 0
            : (Math.min(income, nextThreshold) - planThreshold) * defaultRate;

        nonPostgradTotal += amount;
        breakdown.push({ rate: option?.label ?? plan, amount });
    });

    const flooredNonPostgradTotal = Math.floor(nonPostgradTotal);

    // Floor non-postgrad total and adjust breakdown to match
    let adjustment = nonPostgradTotal - flooredNonPostgradTotal;

    // Work backward through breakdown, subtracting adjustment from last items
    for (let i = breakdown.length - 1; i >= 0 && adjustment > 0; i--) {
        if (breakdown[i].amount > 0) {
            const deduction = Math.min(breakdown[i].amount, adjustment);
            breakdown[i].amount -= deduction;
            adjustment -= deduction;
        }
    }

    // Calculate repayments for postgraduate plan
    // Postgraduate plan repayments are paid on top of all the other plans
    let postgradTotal: number = 0;
    if (hasPostgrad) {
        const option = (studentLoanOptions as StudentLoanOption[]).find(o => o.plan === "postgrad");
        postgradTotal = income <= thresholds["postgrad"] ? 0 : Math.floor((income - thresholds["postgrad"]) * postgradRate);
        breakdown.push({ rate: option?.label ?? "Postgraduate", amount: postgradTotal });
    }

    return {
        total: flooredNonPostgradTotal + postgradTotal,
        breakdown,
    };
}

// ============================================================================
// Child Benefits
// ============================================================================

export function calculateChildBenefits(
    adjustedNetIncome: number,
    childBenefits: ChildBenefitsInput,
    childBenefitRates: ChildBenefitRates
): CalculationResult {
    if (!childBenefits.childBenefitsTaken) {
        return { total: 0, breakdown: [] };
    }

    const { firstChildRate, additionalChildRate } = childBenefitRates;

    // Calculate annual benefit amounts
    const firstChildAmount = firstChildRate * 52;
    const additionalChildrenAmount = (childBenefits.numberOfChildren - 1) * additionalChildRate * 52;
    const childBenefitAmount = firstChildAmount + additionalChildrenAmount;

    // High Income Child Benefit Charge
    const HICBC_THRESHOLD = 50000; // High Income Child Benefit Charge threshold

    let HICBC = 0;
    if (adjustedNetIncome > HICBC_THRESHOLD) {
        const incomeExcess = adjustedNetIncome - HICBC_THRESHOLD;
        const chargePercentage = Math.min(100, Math.floor(incomeExcess / 100));
        HICBC = -(childBenefitAmount * chargePercentage) / 100;
    }

    return {
        total: childBenefitAmount + HICBC,
        breakdown: [
            { rate: "Child Benefits", amount: childBenefitAmount },
            { rate: "HICBC", amount: HICBC },
        ],
    };
}

// ============================================================================
// Main Calculation
// ============================================================================

export function calculateTaxes(inputs: TaxInputs): TaxCalculationResult {
    const constants = taxYears[inputs.taxYear];

    // 1. Calculate gross earnings (salary + bonus)
    const grossEarnings = calculateGrossEarnings(inputs.annualGrossSalary, inputs.annualGrossBonus);

    // 2. Calculate pension contributions and income after salary sacrifice
    const { pensionPot, incomeAfterSalarySacrifice } = calculatePensionPot(
        grossEarnings.total,
        inputs.pensionContributions,
        inputs.autoEnrolmentAsSalarySacrifice,
        inputs.taxReliefAtSource
    );

    // 3. Calculate adjusted net income (used for allowance tapering and HICBC)
    const adjustedNetIncome = Math.max(0, grossEarnings.total - pensionPot.total);

    // 4. Calculate tax allowance (considering personal allowance taper and blind person's allowance)
    const taxAllowance = calculateTaxAllowance(adjustedNetIncome, inputs.blind, constants);

    // 5. Calculate taxable income
    const taxableIncome = Math.max(0, adjustedNetIncome - taxAllowance.total);

    // 6. Calculate income tax
    const incomeTax = calculateIncomeTax(taxableIncome, constants, inputs.residentInScotland);

    // 7. Calculate National Insurance (based on income after salary sacrifice)
    const employeeNI = calculateNationalInsurance(incomeAfterSalarySacrifice, constants, false, inputs.noNI);
    const employerNI = calculateNationalInsurance(incomeAfterSalarySacrifice, constants, true, inputs.noNI);

    // 8. Calculate student loan repayments (based on income after salary sacrifice)
    const studentLoanRepayments = calculateStudentLoanRepayments(incomeAfterSalarySacrifice, inputs.studentLoan, constants);

    // 9. Calculate total deductions
    const combinedTaxes = incomeTax.total + employeeNI.total + studentLoanRepayments.total;

    // 10. Calculate child benefits (depends on adjusted net income for HICBC)
    const childBenefits = calculateChildBenefits(adjustedNetIncome, inputs.childBenefits, constants.childBenefitRates);

    // 11. Calculate final amounts
    const takeHomePay = adjustedNetIncome - combinedTaxes;
    const yourMoney = pensionPot.total + takeHomePay + childBenefits.total;

    return {
        grossEarnings,
        adjustedNetIncome,
        taxAllowance,
        taxableIncome,
        incomeTax,
        employeeNI,
        employerNI,
        studentLoanRepayments,
        combinedTaxes,
        childBenefits,
        takeHomePay,
        pensionPot,
        yourMoney,
    };
}
