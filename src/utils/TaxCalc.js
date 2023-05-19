import { taxYears } from './TaxYears';
import { studentLoanOptions } from '../components/UserMenu';

// Gross Income = Salary + Bonuses + Other Income (Dividends, Rental Income, etc.)
export function calculateAnnualGrossIncome(annualGrossSalary, annualGrossBonus) {
    return {
        total: annualGrossSalary + annualGrossBonus,
        breakdown: [
            { rate: "Annual Gross Salary", amount: annualGrossSalary },
            { rate: "Annual Gross Bonus", amount: annualGrossBonus },
        ]
    }
}

// Tax Allowance = Personal Allowance (tapered) + Blind Person's Allowance
export function calculateTaxAllowance(income, isBlind, constants) {
    const {
        basicAllowance,
        taperThreshold,
        blindPersonsAllowance,
    } = constants.taxAllowance;

    const breakdown = [];

    let personalAllowance = basicAllowance;
    if (income > taperThreshold) {
        const reduction = Math.floor((income - taperThreshold) / 2);
        personalAllowance = Math.max(0, basicAllowance - reduction);
    }
    breakdown.push({ rate: "Personal Allowance", amount: personalAllowance });

    let blindAllowance = 0;
    if (isBlind) {
        blindAllowance = blindPersonsAllowance;
        breakdown.push({ rate: "Blind Person's Allowance", amount: blindAllowance })
    }

    let total = personalAllowance + blindAllowance;
    return { total, breakdown }
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
    let nonPostgradTotal = 0;
    const breakdown = [];

    if (studentLoanPlans.length === 0) {
        return {
            total,
            breakdown,
        };
    }

    // Filter postgraduate plan and sort the rest in ascending order of thresholds
    const nonPostgradPlans = studentLoanPlans
        .filter(plan => plan !== "postgrad")
        .sort((a, b) => thresholds[a] - thresholds[b]);

    // Calculate repayments for non-postgraduate plans
    // If you selected multiple non-postgraduate plans,
    // you will still pay the same you would with only one non-postgraduate plan
    // but the payments will be split between the plans based on their thresholds
    nonPostgradPlans.forEach((plan, index) => {
        const option = studentLoanOptions.find(option => option.plan === plan);
        let amount;

        if (index === nonPostgradPlans.length - 1) {
            amount = (income <= thresholds[plan]) ? 0 : ((income - thresholds[plan]) * defaultRate);
        } else {
            amount = (income <= thresholds[plan]) ? 0 : ((Math.min(income, thresholds[nonPostgradPlans[index + 1]]) - thresholds[plan]) * defaultRate);
        }

        nonPostgradTotal += amount;
        breakdown.push({ rate: option.label, amount });
    });

    // round down the total amount for non-postgrad plans and adjust the last plan
    // Loop backward through the breakdown array (from the last non-postgrad plan to the first one)
    // until you finds a plan with an amount greater than 0. Then, try to deduct the adjustment
    // from this amount. If the adjustment is greater than the amount, deduct the whole amount
    // from the adjustment and set the amount to 0. Then, continue to the previous plan.
    // Carry on until the adjustment has been completely deducted or all the plans have been processed.
    let adjustment = nonPostgradTotal - Math.floor(nonPostgradTotal);
    for (let i = breakdown.length - 1; i >= 0; i--) {
        if (breakdown[i].amount > 0) {
            if (breakdown[i].amount >= adjustment) {
                breakdown[i].amount -= adjustment;
                nonPostgradTotal -= adjustment;
                adjustment = 0;
                break;
            } else {
                adjustment -= breakdown[i].amount;
                nonPostgradTotal -= breakdown[i].amount;
                breakdown[i].amount = 0;
            }
        }
    }

    total += Math.floor(nonPostgradTotal);

    // Calculate repayments for postgraduate plan
    // Postgraduate plan repayments are paid on top of all the other plans
    if (studentLoanPlans.includes("postgrad")) {
        const option = studentLoanOptions.find(option => option.plan === "postgrad");
        const amount = (income <= thresholds["postgrad"]) ? 0 : Math.floor((income - thresholds["postgrad"]) * postgradRate);
        total += amount;
        breakdown.push({ rate: option.label, amount });
    }

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
        HICBC = - (childBenefitAmount * chargePercentage) / 100;
    }

    const total = childBenefitAmount + HICBC;

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

// Top-level function to calculate taxes
export function calculateTaxes(inputs) {
    const constants = taxYears[inputs.taxYear];

    const annualGrossIncome = calculateAnnualGrossIncome(inputs.annualGrossSalary, inputs.annualGrossBonus);

    // Apply salary sacrifice
    let incomeAfterSalarySacrifice = Math.max(0, annualGrossIncome.total - inputs.pensionContributions.salarySacrifice);

    // Calculate auto enrolment pension contributions
    const autoEnrolmentContribution = incomeAfterSalarySacrifice * (inputs.pensionContributions.autoEnrolment / 100);

    // Deduct auto enrolment contributions from gross income, but only if they are salary sacrificed
    if (inputs.autoEnrolmentAsSalarySacrifice)
        incomeAfterSalarySacrifice -= autoEnrolmentContribution;

    // Calculate personal pension contribution (with tax relief at source)
    const grossedPersonalContribution = grossManualPensionContributions(inputs.pensionContributions.personal, inputs.taxReliefAtSource);

    // Calculate how much you will have in your pension pot at the end of the tax year
    const pensionPot = {
        total: inputs.pensionContributions.salarySacrifice + autoEnrolmentContribution + grossedPersonalContribution,
        breakdown: [
            { rate: "Salary sacrifice", amount: inputs.pensionContributions.salarySacrifice },
            { rate: "Auto enrolment", amount: autoEnrolmentContribution },
            { rate: "Gross Personal", amount: grossedPersonalContribution },
        ],
    };

    // Calculate adjusted net income
    const adjustedNetIncome = Math.max(0, annualGrossIncome.total - pensionPot.total);

    // Calculate employee national insurance contributions
    const employeeNI = calculateNationalInsurance(incomeAfterSalarySacrifice, constants, false, inputs.noNI);

    // Calculate employer national insurance contributions
    const employerNI = calculateNationalInsurance(incomeAfterSalarySacrifice, constants, true, inputs.noNI);

    // Calculate student loan repayments
    const studentLoanRepayments = calculateStudentLoanRepayments(incomeAfterSalarySacrifice, inputs.studentLoan, constants);

    // Determine the tax allowance (considering personal allowance taper and blind person's allowance)
    const taxAllowance = calculateTaxAllowance(adjustedNetIncome, inputs.blind, constants);

    // Calculate taxable income
    const taxableIncome = Math.max(0, adjustedNetIncome - taxAllowance.total);

    // Calculate income tax
    const incomeTax = calculateIncomeTax(taxableIncome, constants, inputs.residentInScotland);

    // Calculate combined taxes
    const combinedTaxes = incomeTax.total + employeeNI.total + studentLoanRepayments.total;

    // Calculate child benefits
    const childBenefits = calculateChildBenefits(adjustedNetIncome, inputs.childBenefits, constants.childBenefitRates);

    // Calculate how much you actually keep
    const takeHomePay = adjustedNetIncome - combinedTaxes;
    const yourMoney = pensionPot.total + takeHomePay + childBenefits.total;

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
        childBenefits,
        takeHomePay,
        pensionPot,
        yourMoney,
    };
}
