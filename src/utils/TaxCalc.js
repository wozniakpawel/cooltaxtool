export const fetchTaxConstants = (taxYear, residentInScotland) => {
    // Define tax constants based on the tax year and residency status
    const taxConstants = {
        '2023/24': {
            scotland: {
                personalAllowance: 12570,
                personalAllowanceTaper: 100000,
                personalAllowanceReductionRate: 0.5,
                basicRateLimit: 37700,
                higherRateLimit: 125140,
                basicRate: 0.20,
                higherRate: 0.40,
                additionalRate: 0.45,
                niPrimaryThreshold: 12570,
                niUpperLimit: 50270,
                niRate1: 0.12,
                niRate2: 0.02,
                studentLoanPlan2Threshold: 27295,
                studentLoanPlan2Rate: 0.09,
            },
            restOfUK: {
                personalAllowance: 12570,
                personalAllowanceTaper: 100000,
                personalAllowanceReductionRate: 0.5,
                basicRateLimit: 37700,
                higherRateLimit: 125140,
                basicRate: 0.20,
                higherRate: 0.40,
                additionalRate: 0.45,
                niPrimaryThreshold: 12570,
                niUpperLimit: 50270,
                niRate1: 0.12,
                niRate2: 0.02,
                studentLoanPlan2Threshold: 27295,
                studentLoanPlan2Rate: 0.09,
            },
        },
        // Add more tax years if needed
    };

    return residentInScotland ? taxConstants[taxYear].scotland : taxConstants[taxYear].restOfUK;
};

// Calculate personal allowance taper
export function calculatePersonalAllowanceTaper(income, constants) {
    if (income > constants.personalAllowanceTaper) {
        const reduction = Math.floor((income - constants.personalAllowanceTaper) / 2);
        return Math.max(0, constants.personalAllowance - reduction);
    }
    return constants.personalAllowance;
}

// Calculate income tax
export function calculateIncomeTax(taxableIncome, constants) {
    let taxDue = 0;

    if (taxableIncome > 0) {
        const basicRateTaxableIncome = Math.min(taxableIncome, constants.basicRateLimit);
        taxDue += basicRateTaxableIncome * constants.basicRate;
        taxableIncome -= basicRateTaxableIncome;
    }

    if (taxableIncome > 0) {
        const higherRateTaxableIncome = Math.min(taxableIncome, constants.higherRateLimit - constants.basicRateLimit);
        taxDue += higherRateTaxableIncome * constants.higherRate;
        taxableIncome -= higherRateTaxableIncome;
    }

    if (taxableIncome > 0) {
        taxDue += taxableIncome * constants.additionalRate;
    }

    return taxDue;
}

// Calculate national insurance contributions
export function calculateNationalInsurance(income, constants) {
    let contributions = 0;

    if (income > constants.niPrimaryThreshold) {
        const niRate1Income = Math.min(income - constants.niPrimaryThreshold, constants.niUpperLimit - constants.niPrimaryThreshold);
        contributions += niRate1Income * constants.niRate1;
        income -= niRate1Income;
    }

    if (income > constants.niUpperLimit) {
        contributions += (income - constants.niUpperLimit) * constants.niRate2;
    }

    return contributions;
}

// Calculate student loan repayments (plan 1 and 2)
export function calculateStudentLoanRepayments(income, plan, constants) {
    let repayments = 0;

    if (plan === "plan1") {
        // Add plan1 constants and calculation logic here
    } else if (plan === "plan2") {
        if (income > constants.studentLoanPlan2Threshold) {
            repayments = (income - constants.studentLoanPlan2Threshold) * constants.studentLoanPlan2Rate;
        }
    }

    return repayments;
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
export function calculateSalarySacrifice(income, salarySacrifice) {
    return Math.max(0, income - salarySacrifice);
}

// Top-level function to calculate taxes
export function calculateTaxes(grossIncome, taxYear, options = {}) {
    const region = options.residentInScotland ? 'scotland' : 'restOfUK';
    const constants = fetchTaxConstants(taxYear, region);
    if (!constants) throw new Error(`Tax year ${taxYear} not supported`);
  
    // Apply salary sacrifice
    const incomeAfterSalarySacrifice = calculateSalarySacrifice(grossIncome, options.salarySacrifice || 0);

    // Calculate personal allowance (considering taper)
    const personalAllowance = calculatePersonalAllowanceTaper(incomeAfterSalarySacrifice, constants);

    // Calculate taxable income
    const taxableIncome = Math.max(0, incomeAfterSalarySacrifice - personalAllowance);

    // Calculate income tax
    const incomeTax = calculateIncomeTax(taxableIncome, constants);

    // Calculate national insurance contributions
    const niContributions = calculateNationalInsurance(incomeAfterSalarySacrifice, constants);

    // Calculate student loan repayments
    const studentLoanRepayments = calculateStudentLoanRepayments(incomeAfterSalarySacrifice, options.studentLoanPlan, constants);

    // Calculate High Income Child Benefit Charge (if required)
    const highIncomeChildBenefitCharge = options.childBenefitAmount
        ? calculateHighIncomeChildBenefitCharge(incomeAfterSalarySacrifice, options.childBenefitAmount)
        : 0;

    // Calculate pension taper, tax relief, etc. (if required)

    // Return all calculated values
    return {
        grossIncome,
        personalAllowance,
        taxableIncome,
        incomeTax,
        niContributions,
        studentLoanRepayments,
        highIncomeChildBenefitCharge,
    };
}
