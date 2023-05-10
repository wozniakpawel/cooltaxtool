import { taxYears } from './TaxYears';
import { studentLoanOptions } from '../components/UserMenu';

// Calculate allowance (considering personal allowance with taper & blind person's allowance)
export function calculateAllowance(income, isBlind, constants) {
    const {
        basicAllowance,
        taperThreshold,
        blindPersonsAllowance,
    } = constants.personalAllowance;

    let allowance = basicAllowance;

    if (income > taperThreshold) {
        const reduction = Math.floor((income - taperThreshold) / 2);
        allowance = Math.max(0, basicAllowance - reduction);
    }

    if (isBlind) {
        allowance += blindPersonsAllowance;
    }

    return allowance;
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
export function calculateStudentLoanRepayments(income, studentLoanPlans, constants) {
    const { defaultRate, postgradRate, thresholds } = constants.studentLoan;
    let total = 0;
    const breakdown = [];

    if (studentLoanPlans.length === 0) {
        return {
            total,
            breakdown,
        };
    }

    studentLoanPlans.forEach(plan => {
        const planThreshold = thresholds[plan];
        const option = studentLoanOptions.find(option => option.plan === plan);
        const rate = plan === "postgrad" ? postgradRate : defaultRate;
        const amount = (income <= planThreshold) ? 0 : Math.floor((income - planThreshold) * rate);

        total += amount;
        breakdown.push({ rate: option.label, amount });
    });

    return {
        total,
        breakdown,
    };
}

export function calculateChildBenefits(adjustedNetIncome, childBenefits, childBenefitRates) {
    const HICBCThreshold = 50000;
    const { firstChildRate, additionalChildRate } = childBenefitRates;

    if (!childBenefits.childBenefitsTaken) {
        return {
            total: 0,
            breakdown: [],
        };
    }

    const firstChildAmount = firstChildRate * 52;
    const additionalChildrenAmount = (childBenefits.numberOfChildren - 1) * additionalChildRate * 52;
    const childBenefitAmount = firstChildAmount + additionalChildrenAmount;

    let HICBC = 0;
    if (adjustedNetIncome > HICBCThreshold) {
        const incomeExcess = adjustedNetIncome - HICBCThreshold;
        const chargePercentage = Math.min(100, Math.floor(incomeExcess / 100));
        HICBC = (childBenefitAmount * chargePercentage) / 100;
    }

    const total = childBenefitAmount - HICBC;

    return {
        total,
        breakdown: [
            { rate: "Child Benefits", amount: childBenefitAmount },
            { rate: "HICBC", amount: HICBC },
        ],
    };
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
    const studentLoanRepayments = calculateStudentLoanRepayments(incomeAfterSalarySacrifice, options.studentLoan, constants);

    // 5. Determine the personal allowance (considering taper and blind person's allowance)
    const personalAllowance = calculateAllowance(adjustedNetIncome, options.blind, constants);

    // 6. Calculate taxable income
    const taxableIncome = Math.max(0, adjustedNetIncome - personalAllowance);

    // 7. Calculate income tax
    const incomeTax = calculateIncomeTax(taxableIncome, constants, options.residentInScotland);

    // 8. Calculate combined taxes
    const combinedTaxes = incomeTax.total + employeeNI.total + studentLoanRepayments.total;

    // Calculate child benefits
    const childBenefits = calculateChildBenefits(adjustedNetIncome, options.childBenefits, constants.childBenefitRates);

    // 9. Calculate how much you actually keep
    const takeHomePay = adjustedNetIncome - combinedTaxes;
    const yourMoney = pensionPot.total + takeHomePay + childBenefits.total;

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
        childBenefits,
        takeHomePay,
        pensionPot,
        yourMoney,
    };
}
