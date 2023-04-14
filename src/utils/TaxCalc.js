import { taxYears } from './TaxYears';

// Calculate personal allowance taper
export function calculateTaperedPersonalAllowance(income, constants) {
    const { basicAllowance, taperThreshold } = constants.personalAllowance;
    if (income > taperThreshold) {
        const reduction = Math.floor((income - taperThreshold) / 2);
        return Math.max(0, basicAllowance - reduction);
    }
    return basicAllowance;
}

// Calculate income tax
export function calculateIncomeTax(taxableIncome, constants, residentInScotland = false) {
    const taxBands = residentInScotland ? constants.incomeTax.scotland : constants.incomeTax.restOfUK;

    let incomeTax = 0;
    let remainingIncome = taxableIncome;
    const incomeTaxBreakdown = [];

    let previousLimit = 0;

    taxBands.forEach(([currentRate, currentLimit]) => {
        if (remainingIncome > 0) {
            const range = currentLimit - previousLimit;
            const taxableAtCurrentRate = Math.min(remainingIncome, range);
            const taxAtCurrentRate = taxableAtCurrentRate * currentRate;
            incomeTax += taxAtCurrentRate;
            remainingIncome -= taxableAtCurrentRate;
            incomeTaxBreakdown.push({ rate: currentRate, amount: taxAtCurrentRate });
            previousLimit = currentLimit;
        }
    });

    return { total: incomeTax, breakdown: incomeTaxBreakdown };
};

// Calculate national insurance contributions (employee and employer)
export function calculateNationalInsurance(income, constants, employer=false, noNI=false) {
    if (noNI) return { total: 0, breakdown: [] };

    const { primaryThreshold, secondaryThreshold, upperEarningsLimit, employeeRates, employerRates } = constants.nationalInsurance;
    const firstThreshold = employer ? secondaryThreshold : primaryThreshold;
    const rates = employer ? employerRates : employeeRates;

    let remainingIncome = Math.max(0, income - firstThreshold);
    let nationalInsuranceTotal = 0;
    const nationalInsuranceBreakdown = [];

    if (remainingIncome > 0) {
        const incomeInFirstBand = Math.min(remainingIncome, upperEarningsLimit - firstThreshold);
        if (incomeInFirstBand > 0) {
            const niInFirstBand = incomeInFirstBand * rates[0];
            nationalInsuranceTotal += niInFirstBand;
            remainingIncome -= incomeInFirstBand;
            nationalInsuranceBreakdown.push({ rate: rates[0], amount: niInFirstBand });
        }
    }

    if (remainingIncome > 0) {
        const niInSecondBand = remainingIncome * rates[1];
        nationalInsuranceTotal += niInSecondBand;
        nationalInsuranceBreakdown.push({ rate: rates[1], amount: niInSecondBand });
    }

    return {
        total: nationalInsuranceTotal,
        breakdown: nationalInsuranceBreakdown,
    };
}

// Calculate student loan repayments
export function calculateStudentLoanRepayments(income, studentLoanPlan, constants) {
    const { defaultRate, postgradRate, thresholds } = constants.studentLoan;

    if (studentLoanPlan === 'none') return 0;

    const planThreshold = thresholds[studentLoanPlan];
    const rate = studentLoanPlan === 'postgrad' ? postgradRate : defaultRate;

    if (income <= planThreshold) return 0;

    return (income - planThreshold) * rate;
}


// Calculate the High Income Child Benefit Charge
export function calculateHighIncomeChildBenefitCharge(income, childBenefitAmount) {
    if (income > 50000) {
        const chargeRate = 0.01 * Math.min(Math.floor((income - 50000) / 100), 100);
        return childBenefitAmount * chargeRate;
    }
    return 0;
}

// Calculate the pension taper
export function calculatePensionTaper(income, pensionContributions) {
    // Add calculation logic here
}

// Calculate tax relief at source for a sipp contribution
export function calculateTaxReliefAtSource(income, sippContribution, constants) {
    // Add calculation logic here
}

// Calculate salary sacrifice
export function calculateSalarySacrifice(incomeAfterPensionContributions, salarySacrifice) {
    return Math.max(0, incomeAfterPensionContributions - salarySacrifice);
}

// Top-level function to calculate taxes
export function calculateTaxes(grossIncome, options) {
    const constants = taxYears[options.taxYear];
    const {
        pensionContributions: {
            autoEnrolment: { value: autoEnrolmentValue } = {},
            personal: { value: personalContributionValue } = {},
            salarySacrifice: { value: salarySacrificeValue } = {},
        } = {},
    } = options;

    // Calculate auto enrolment pension contribution
    const autoEnrolmentContribution = grossIncome * (autoEnrolmentValue / 100);

    // Calculate total pension contributions
    const totalPensionContributions = autoEnrolmentContribution + personalContributionValue;

    // Apply salary sacrifice
    const incomeAfterSalarySacrifice = calculateSalarySacrifice(grossIncome - totalPensionContributions, salarySacrificeValue);

    // Calculate personal allowance (considering taper)
    const personalAllowance = calculateTaperedPersonalAllowance(incomeAfterSalarySacrifice, constants);

    // Calculate taxable income
    const taxableIncome = Math.max(0, incomeAfterSalarySacrifice - personalAllowance);

    // Calculate income tax
    const incomeTax = calculateIncomeTax(taxableIncome, constants, options.residentInScotland);

    // Calculate employee national insurance contributions
    const employeeNI = calculateNationalInsurance(incomeAfterSalarySacrifice, constants, false, options.noNI);

    // Calculate employer national insurance contributions
    const employerNI = calculateNationalInsurance(incomeAfterSalarySacrifice, constants, true, options.noNI);

    // Calculate student loan repayments
    const studentLoanRepayments = calculateStudentLoanRepayments(incomeAfterSalarySacrifice, options.studentLoan, constants);

    // Calculate High Income Child Benefit Charge (if required)
    const highIncomeChildBenefitCharge = options.childBenefitAmount
        ? calculateHighIncomeChildBenefitCharge(incomeAfterSalarySacrifice, options.childBenefitAmount)
        : 0;

    // Calculate combined taxes
    const combinedTaxes = incomeTax.total + employeeNI.total + studentLoanRepayments + highIncomeChildBenefitCharge;

    // Calculate take-home pay
    const takeHomePay = incomeAfterSalarySacrifice - combinedTaxes;

    // Return all calculated values
    return {
        grossIncome,
        personalAllowance,
        taxableIncome,
        incomeTax,
        employeeNI,
        employerNI,
        studentLoanRepayments,
        highIncomeChildBenefitCharge,
        combinedTaxes,
        takeHomePay
    };
}

// Calculate the difference in taxes with and without a voluntary pension contribution
export const calculateTaxSavings = (grossIncome, inputs, voluntaryPensionContribution) => {
    const { pensionContributions } = inputs;

    const defaultInputs = {
        ...inputs,
        pensionContributions: {
            ...pensionContributions,
            personal: {
                ...pensionContributions.personal,
                value: voluntaryPensionContribution,
            },
        },
    };

    const defaultTaxes = calculateTaxes(grossIncome, defaultInputs);
    const currentTaxes = calculateTaxes(grossIncome, inputs);

    const taxSavings = currentTaxes.combinedTaxes - defaultTaxes.combinedTaxes;

    return {
        taxSavings,
        defaultTaxes,
        currentTaxes,
    };
};
