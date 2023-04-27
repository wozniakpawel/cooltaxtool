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
export function calculateIncomeTax(taxableIncome, constants, residentInScotland) {
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
export function calculateNationalInsurance(income, constants, employer, noNI) {
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

// Calculate the pension taper
// export function calculatePensionTaper(income, pensionContributions, constants) {
//     const { taperThreshold, taperRate } = constants.pensionTaper;
//     if (income > taperThreshold) {
//         const reduction = Math.floor((income - taperThreshold) * taperRate);
//         return Math.max(0, pensionContributions - reduction);
//     }
//     return pensionContributions;
// }

// Calculate personal pension contribution value, depending if the tax is relieved at source
export function grossManualPensionContributions(personalContribution, taxReliefAtSource) {
    return taxReliefAtSource ? personalContribution * 1.25 : personalContribution;
}

// Work out adjusted net income & the pension pot value at the end of the tax year
export function calculatePension(grossIncome, pensionContributions, autoEnrolmentAsSalarySacrifice, taxReliefAtSource) {
    const { autoEnrolment, personal, salarySacrifice } = pensionContributions;

    // 1. Apply salary sacrifice
    let incomeAfterSalarySacrifice = Math.max(0, grossIncome - salarySacrifice);

    // 2. Calculate auto enrolment pension contributions
    const autoEnrolmentContribution = incomeAfterSalarySacrifice * (autoEnrolment / 100);

    // 3. Deduct auto enrolment contributions from gross income, but only if they are salary sacrificed
    if (autoEnrolmentAsSalarySacrifice)
        incomeAfterSalarySacrifice -= autoEnrolmentContribution;

    // 4. Calculate personal pension contribution (with tax relief at source)
    const grossedPersonalContribution = grossManualPensionContributions(personal, taxReliefAtSource);

    // 5. Calculate how much you will have in your pension pot at the end of the tax year
    const pensionPot = {
        total: salarySacrifice + autoEnrolmentContribution + grossedPersonalContribution,
        breakdown: [
            { rate: "Salary sacrifice", amount: salarySacrifice },
            { rate: "Auto enrolment", amount: autoEnrolmentContribution },
            { rate: "Gross Personal", amount: grossedPersonalContribution },
        ],
    };

    // 6. Calculate adjusted net income
    const adjustedNetIncome = Math.max(0, grossIncome - pensionPot.total);

    return { incomeAfterSalarySacrifice, adjustedNetIncome, pensionPot };
}

// Top-level function to calculate taxes
export function calculateTaxes(grossIncome, options) {
    const constants = taxYears[options.taxYear];

    // 1. Calculate the adjusted net income, and the pension pot value at the end of the tax year
    const { incomeAfterSalarySacrifice, adjustedNetIncome, pensionPot } = calculatePension(grossIncome, options.pensionContributions, options.autoEnrolmentAsSalarySacrifice, options.taxReliefAtSource);

    // 2. Calculate employee national insurance contributions
    const employeeNI = calculateNationalInsurance(incomeAfterSalarySacrifice, constants, false, options.noNI);

    // 3. Calculate employer national insurance contributions
    const employerNI = calculateNationalInsurance(incomeAfterSalarySacrifice, constants, true, options.noNI);

    // 4. Calculate student loan repayments
    const studentLoanRepayments = Math.round(calculateStudentLoanRepayments(incomeAfterSalarySacrifice, options.studentLoan, constants));

    // 5. Determine the personal allowance (considering taper)
    const personalAllowance = calculateTaperedPersonalAllowance(adjustedNetIncome, constants);

    // 6. Calculate taxable income
    const taxableIncome = Math.max(0, adjustedNetIncome - personalAllowance);

    // 7. Calculate income tax
    const incomeTax = calculateIncomeTax(taxableIncome, constants, options.residentInScotland);

    // 8. Calculate combined taxes
    const combinedTaxes = incomeTax.total + employeeNI.total + studentLoanRepayments;

    // 9. Calculate how much you actually keep
    const takeHomePay = adjustedNetIncome - combinedTaxes;
    const yourMoney = pensionPot.total + takeHomePay;

    return {
        grossIncome,
        adjustedNetIncome,
        personalAllowance,
        taxableIncome,
        incomeTax,
        employeeNI,
        employerNI,
        studentLoanRepayments,
        combinedTaxes,
        takeHomePay,
        pensionPot,
        yourMoney,
    };
}
