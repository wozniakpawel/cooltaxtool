import { taxConstants } from './TaxConstants';

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
    const taxBreakdown = {};

    let previousLimit = 0;

    taxBands.forEach(([rate, limit]) => {
        if (remainingIncome > 0) {
            const range = limit - previousLimit;
            const taxableAtCurrentRate = Math.min(remainingIncome, range);
            const taxAtCurrentRate = taxableAtCurrentRate * rate;
            incomeTax += taxAtCurrentRate;
            remainingIncome -= taxableAtCurrentRate;

            taxBreakdown[rate] = (taxBreakdown[rate] || 0) + taxAtCurrentRate;

            previousLimit = limit;
        }
    });

    return { total: incomeTax, breakdown: taxBreakdown };
};

// Calculate employee national insurance contributions
export function calculateEmployeeNI(income, constants) {
    const { lowerEarningsLimit, primaryThreshold, upperEarningsLimit, employeeRates } = constants.nationalInsurance;

    let remainingIncome = Math.max(0, income - lowerEarningsLimit);
    let employeeNITotal = 0;
    const employeeNIBreakdown = [];

    if (remainingIncome > 0) {
        const incomeInFirstBand = Math.min(remainingIncome, upperEarningsLimit - primaryThreshold);
        if (incomeInFirstBand > 0) {
            const niInFirstBand = incomeInFirstBand * employeeRates[0];
            employeeNITotal += niInFirstBand;
            remainingIncome -= incomeInFirstBand;
            employeeNIBreakdown.push({ rate: employeeRates[0], amount: niInFirstBand });
        }
    }

    if (remainingIncome > upperEarningsLimit) {
        const incomeInSecondBand = remainingIncome - upperEarningsLimit;
        const niInSecondBand = incomeInSecondBand * employeeRates[1];
        employeeNITotal += niInSecondBand;
        employeeNIBreakdown.push({ rate: employeeRates[1], amount: niInSecondBand });
    }

    return {
        total: employeeNITotal,
        breakdown: employeeNIBreakdown
    };
}

// Calculate employer national insurance contributions
export function calculateEmployerNI(income, constants) {
    const { secondaryThreshold, upperEarningsLimit, employerRates } = constants.nationalInsurance;
  
    let remainingIncome = Math.max(0, income - secondaryThreshold);
    let employerNITotal = 0;
    const employerNIBreakdown = [];
  
    if (remainingIncome > 0) {
      const incomeInFirstBand = Math.min(remainingIncome, upperEarningsLimit - secondaryThreshold);
      if (incomeInFirstBand > 0) {
        const niInFirstBand = incomeInFirstBand * employerRates[0];
        employerNITotal += niInFirstBand;
        remainingIncome -= incomeInFirstBand;
        employerNIBreakdown.push({ rate: employerRates[0], amount: niInFirstBand });
      }
    }
  
    if (remainingIncome > upperEarningsLimit) {
      const incomeInSecondBand = remainingIncome - upperEarningsLimit;
      const niInSecondBand = incomeInSecondBand * employerRates[1];
      employerNITotal += niInSecondBand;
      employerNIBreakdown.push({ rate: employerRates[1], amount: niInSecondBand });
    }
  
    return {
      total: employerNITotal,
      breakdown: employerNIBreakdown,
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
export function calculateSalarySacrifice(income, salarySacrifice) {
    return Math.max(0, income - salarySacrifice);
}

// Top-level function to calculate taxes
export function calculateTaxes(grossIncome, options) {
    const constants = taxConstants[options.taxYear];

    // Apply salary sacrifice
    const incomeAfterSalarySacrifice = calculateSalarySacrifice(grossIncome, options.salarySacrifice || 0);

    // Calculate personal allowance (considering taper)
    const personalAllowance = calculateTaperedPersonalAllowance(incomeAfterSalarySacrifice, constants);

    // Calculate taxable income
    const taxableIncome = Math.max(0, incomeAfterSalarySacrifice - personalAllowance);

    // Calculate income tax
    const { total: incomeTax, breakdown: incomeTaxBreakdown } = calculateIncomeTax(taxableIncome, constants, options.residentInScotland);

    // Calculate employee national insurance contributions
    const { total: employeeNI, breakdown: employeeNIBreakdown } = calculateEmployeeNI(incomeAfterSalarySacrifice, constants);

    // Calculate employer national insurance contributions
    const { total: employerNI, breakdown: employerNIBreakdown } = calculateEmployerNI(incomeAfterSalarySacrifice, constants);

    // Calculate student loan repayments
    const studentLoanRepayments = calculateStudentLoanRepayments(incomeAfterSalarySacrifice, options.studentLoan, constants);

    // Calculate High Income Child Benefit Charge (if required)
    const highIncomeChildBenefitCharge = options.childBenefitAmount
        ? calculateHighIncomeChildBenefitCharge(incomeAfterSalarySacrifice, options.childBenefitAmount)
        : 0;

    // Calculate combined taxes
    const combinedTaxes = incomeTax + employeeNI + studentLoanRepayments + highIncomeChildBenefitCharge;

    // Calculate take-home pay
    const takeHomePay = grossIncome - combinedTaxes;

    // Return all calculated values
    return {
        grossIncome,
        personalAllowance,
        taxableIncome,
        incomeTax,
        incomeTaxBreakdown,
        employeeNI,
        employeeNIBreakdown,
        employerNI,
        employerNIBreakdown,
        studentLoanRepayments,
        highIncomeChildBenefitCharge,
        combinedTaxes,
        takeHomePay
    };
}

export const calculateTaxSavings = (grossIncome, inputs, voluntaryPensionContribution) => {
    // Calculate taxes without voluntary pension contribution
    const taxesWithoutVoluntaryPension = calculateTaxes(grossIncome, inputs);

    // Update the inputs object to include the voluntary pension contribution
    const updatedInputs = {
        ...inputs,
        pensionContributions: {
            ...inputs.pensionContributions,
            personal: { value: voluntaryPensionContribution, type: '%' },
        },
    };

    // Calculate taxes with voluntary pension contribution
    const taxesWithVoluntaryPension = calculateTaxes(grossIncome, updatedInputs);

    // Calculate tax savings
    const taxSavings = {
        incomeTax: taxesWithoutVoluntaryPension.incomeTax - taxesWithVoluntaryPension.incomeTax,
        employeeNI: taxesWithoutVoluntaryPension.employeeNI - taxesWithVoluntaryPension.employeeNI,
        employerNI: taxesWithoutVoluntaryPension.employerNI - taxesWithVoluntaryPension.employerNI,
    };

    return taxSavings;
};
