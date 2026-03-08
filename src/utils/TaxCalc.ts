import { taxYears } from './TaxYears';
import { studentLoanOptions } from './studentLoanOptions';
import type {
    TaxYearConstants,
    TaxInputs,
    CalculationResult,
    TaxCalculationResult,
    BreakdownItem,
    StudentLoanPlan,
    ChildBenefitsInput,
    ChildBenefitRates,
    HICBCConstants,
    PensionContributionsInput,
} from '../types/tax';


// ============================================================================
// Gross Earnings
// ============================================================================

// Gross Earnings = Salary + Bonuses + Other Income (Dividends, Rental Income, etc.)
export function calculateAnnualGrossIncome(
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
        const option = studentLoanOptions.find(o => o.plan === plan);
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
        const option = studentLoanOptions.find(o => o.plan === "postgrad");
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

export interface ChildBenefitsResult {
    childBenefits: CalculationResult;
    hicbc: number;
}

export function calculateChildBenefits(
    adjustedNetIncome: number,
    childBenefits: ChildBenefitsInput,
    childBenefitRates: ChildBenefitRates,
    hicbc: HICBCConstants
): ChildBenefitsResult {
    const { firstChildRate, additionalChildRate } = childBenefitRates;

    if (childBenefits.mode === 'off') {
        return {
            childBenefits: { total: 0, breakdown: [] },
            hicbc: 0,
        };
    }

    // Calculate annual benefit amounts
    const firstChildAmount = firstChildRate * 52;
    const additionalChildrenAmount = (childBenefits.numberOfChildren - 1) * additionalChildRate * 52;
    const childBenefitAmount = firstChildAmount + additionalChildrenAmount;

    let hicbcCharge = 0;
    if (adjustedNetIncome > hicbc.threshold) {
        const incomeExcess = adjustedNetIncome - hicbc.threshold;
        const chargePercentage = Math.min(100, Math.floor(incomeExcess / hicbc.taperDivisor));
        hicbcCharge = (childBenefitAmount * chargePercentage) / 100;
    }

    const showBenefits = childBenefits.mode === 'self';

    return {
        childBenefits: {
            total: showBenefits ? childBenefitAmount : 0,
            breakdown: showBenefits ? [
                { rate: "Child Benefits", amount: childBenefitAmount },
            ] : [],
        },
        hicbc: hicbcCharge,
    };
}

// ============================================================================
// Main Calculation
// ============================================================================

export function calculateTaxes(inputs: TaxInputs): TaxCalculationResult {
    const constants = taxYears[inputs.taxYear];
    if (!constants) {
        throw new Error(`Unsupported tax year: "${inputs.taxYear}". Available: ${Object.keys(taxYears).join(', ')}`);
    }

    const pensionContributions = inputs.pensionEnabled
        ? inputs.pensionContributions
        : { autoEnrolment: 0, salarySacrifice: 0, personal: 0 };
    const autoEnrolmentAsSalarySacrifice = inputs.pensionEnabled
        ? inputs.autoEnrolmentAsSalarySacrifice
        : true;
    const taxReliefAtSource = inputs.pensionEnabled
        ? inputs.taxReliefAtSource
        : true;
    const studentLoan = inputs.studentLoanEnabled
        ? inputs.studentLoan
        : [];

    // 1. Calculate gross income (salary + bonus)
    const annualGrossIncome = calculateAnnualGrossIncome(inputs.annualGrossSalary, inputs.annualGrossBonus);

    // 2. Apply salary sacrifice
    let incomeAfterSalarySacrifice = Math.max(0, annualGrossIncome.total - pensionContributions.salarySacrifice);

    // 3. Calculate auto enrolment pension contributions
    const autoEnrolmentContribution = incomeAfterSalarySacrifice * (pensionContributions.autoEnrolment / 100);

    // Deduct auto enrolment contributions from gross income, but only if they are salary sacrificed
    if (autoEnrolmentAsSalarySacrifice)
        incomeAfterSalarySacrifice -= autoEnrolmentContribution;

    // 4. Calculate personal pension contribution (with tax relief at source)
    const grossedPersonalContribution = grossPensionContribution(pensionContributions.personal, taxReliefAtSource);

    // 5. Calculate how much you will have in your pension pot at the end of the tax year
    const pensionPot: CalculationResult = {
        total: pensionContributions.salarySacrifice + autoEnrolmentContribution + grossedPersonalContribution,
        breakdown: [
            { rate: "Salary sacrifice", amount: pensionContributions.salarySacrifice },
            { rate: "Auto enrolment", amount: autoEnrolmentContribution },
            { rate: "Gross Personal", amount: grossedPersonalContribution },
        ],
    };

    // 6. Calculate adjusted net income
    const adjustedNetIncome = Math.max(0, annualGrossIncome.total - pensionPot.total);

    // 7. Calculate employee national insurance contributions
    const employeeNI = calculateNationalInsurance(incomeAfterSalarySacrifice, constants, false, inputs.noNI);

    // 8. Calculate employer national insurance contributions
    const employerNI = calculateNationalInsurance(incomeAfterSalarySacrifice, constants, true, inputs.noNI);

    // 9. Calculate student loan repayments
    const studentLoanRepayments = calculateStudentLoanRepayments(incomeAfterSalarySacrifice, studentLoan, constants);

    // 10. Calculate tax allowance (considering personal allowance taper and blind person's allowance)
    const taxAllowance = calculateTaxAllowance(adjustedNetIncome, inputs.blind, constants);

    // 11. Calculate taxable income
    const taxableIncome = Math.max(0, adjustedNetIncome - taxAllowance.total);

    // 12. Calculate income tax
    const incomeTax = calculateIncomeTax(taxableIncome, constants, inputs.residentInScotland);

    // 13. Calculate child benefits and HICBC
    const childBenefitsResult = calculateChildBenefits(adjustedNetIncome, inputs.childBenefits, constants.childBenefitRates, constants.hicbc);

    // 14. Calculate combined taxes (including HICBC)
    const combinedTaxes = incomeTax.total + employeeNI.total + studentLoanRepayments.total + childBenefitsResult.hicbc;

    // 15. Calculate how much you actually keep
    // Pension amounts the employee pays out of remaining income (not already deducted via salary sacrifice)
    const netPensionDeductions =
        (autoEnrolmentAsSalarySacrifice ? 0 : autoEnrolmentContribution)
        + pensionContributions.personal;

    const takeHomePay = Math.max(0, incomeAfterSalarySacrifice - netPensionDeductions - combinedTaxes);
    const yourMoney = pensionPot.total + takeHomePay + childBenefitsResult.childBenefits.total;

    return {
        annualGrossIncome,
        adjustedNetIncome,
        taxAllowance,
        taxableIncome,
        incomeTax,
        employeeNI,
        employerNI,
        studentLoanRepayments,
        combinedTaxes,
        hicbc: childBenefitsResult.hicbc,
        childBenefits: childBenefitsResult.childBenefits,
        takeHomePay,
        pensionPot,
        yourMoney,
    };
}
