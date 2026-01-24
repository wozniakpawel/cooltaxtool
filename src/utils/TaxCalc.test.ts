import {
  calculateGrossEarnings,
  calculateTaxAllowance,
  calculateIncomeTax,
  calculateNationalInsurance,
  calculateStudentLoanRepayments,
  calculateChildBenefits,
  grossPensionContribution,
  calculateTaxes,
} from './TaxCalc';
import { taxYears } from './TaxYears';
import type { TaxInputs } from '../types/tax';

// Use 2024/25 tax year for consistent test results
const constants = taxYears['2024/25'];

describe('calculateGrossEarnings', () => {
  it('should calculate total gross earnings from salary and bonus', () => {
    const result = calculateGrossEarnings(50000, 5000);
    expect(result.total).toBe(55000);
    expect(result.breakdown).toHaveLength(2);
  });

  it('should handle zero values', () => {
    const result = calculateGrossEarnings(0, 0);
    expect(result.total).toBe(0);
  });

  it('should handle salary only', () => {
    const result = calculateGrossEarnings(30000, 0);
    expect(result.total).toBe(30000);
  });
});

describe('calculateTaxAllowance', () => {
  it('should return full personal allowance for low income', () => {
    const result = calculateTaxAllowance(30000, false, constants);
    expect(result.total).toBe(12570);
  });

  it('should taper personal allowance above £100,000', () => {
    // At £110,000: reduction = (110000 - 100000) * 0.5 = £5,000
    // Allowance = 12570 - 5000 = £7,570
    const result = calculateTaxAllowance(110000, false, constants);
    expect(result.total).toBe(7570);
  });

  it('should reduce personal allowance to zero at £125,140', () => {
    const result = calculateTaxAllowance(125140, false, constants);
    expect(result.total).toBe(0);
  });

  it('should add blind persons allowance when blind', () => {
    const result = calculateTaxAllowance(30000, true, constants);
    expect(result.total).toBe(12570 + 3070); // 15640 for 2024/25
    expect(result.breakdown).toHaveLength(2);
  });

  it('should taper personal allowance but keep blind allowance', () => {
    const result = calculateTaxAllowance(125140, true, constants);
    // Personal allowance tapered to 0, but blind allowance remains
    expect(result.total).toBe(3070);
  });
});

describe('calculateIncomeTax', () => {
  describe('rest of UK', () => {
    it('should calculate zero tax for zero taxable income', () => {
      const result = calculateIncomeTax(0, constants, false);
      expect(result.total).toBe(0);
    });

    it('should calculate basic rate tax only', () => {
      // £20,000 taxable income at 20%
      const result = calculateIncomeTax(20000, constants, false);
      expect(result.total).toBe(4000);
    });

    it('should calculate mixed basic and higher rate tax', () => {
      // £50,000 taxable income
      // First £37,700 at 20% = £7,540
      // Remaining £12,300 at 40% = £4,920
      // Total = £12,460
      const result = calculateIncomeTax(50000, constants, false);
      expect(result.total).toBe(12460);
    });

    it('should calculate tax including additional rate', () => {
      // £150,000 taxable income
      // First £37,700 at 20% = £7,540
      // Next £87,440 (to £125,140) at 40% = £34,976
      // Remaining £24,860 at 45% = £11,187
      // Total = £53,703
      const result = calculateIncomeTax(150000, constants, false);
      expect(result.total).toBe(53703);
    });
  });

  describe('Scotland', () => {
    it('should use Scottish tax bands', () => {
      // £30,000 taxable income in Scotland
      // Starter rate: £2,306 at 19% = £438.14
      // Basic rate: next £11,685 (to £13,991) at 20% = £2,337
      // Intermediate: next £16,009 (to £30,000) at 21% = £3,361.89
      // Total ≈ £6,137.03
      const result = calculateIncomeTax(30000, constants, true);
      expect(result.total).toBeCloseTo(6137.03, 0);
    });
  });
});

describe('calculateNationalInsurance', () => {
  describe('employee NI', () => {
    it('should return zero for income below threshold', () => {
      const result = calculateNationalInsurance(10000, constants, false, false);
      expect(result.total).toBe(0);
    });

    it('should calculate NI for income in first band', () => {
      // £30,000 income
      // Above primary threshold (£12,570) up to UEL (£50,270)
      // £17,430 at 8% = £1,394.40
      const result = calculateNationalInsurance(30000, constants, false, false);
      expect(result.total).toBeCloseTo(1394.40, 2);
    });

    it('should calculate NI for income above UEL', () => {
      // £60,000 income
      // £12,570 to £50,270 = £37,700 at 8% = £3,016
      // £50,270 to £60,000 = £9,730 at 2% = £194.60
      // Total = £3,210.60
      const result = calculateNationalInsurance(60000, constants, false, false);
      expect(result.total).toBeCloseTo(3210.60, 2);
    });

    it('should return zero when noNI is true', () => {
      const result = calculateNationalInsurance(60000, constants, false, true);
      expect(result.total).toBe(0);
    });
  });

  describe('employer NI', () => {
    it('should use employer rates and thresholds', () => {
      // £30,000 income
      // Above secondary threshold (£9,100) up to UEL (£50,270)
      // £20,900 at 13.8% = £2,884.20
      const result = calculateNationalInsurance(30000, constants, true, false);
      expect(result.total).toBeCloseTo(2884.20, 2);
    });
  });
});

describe('calculateStudentLoanRepayments', () => {
  it('should return zero for no plans', () => {
    const result = calculateStudentLoanRepayments(50000, [], constants);
    expect(result.total).toBe(0);
    expect(result.breakdown).toHaveLength(0);
  });

  it('should calculate Plan 1 repayments', () => {
    // £50,000 income, Plan 1 threshold £24,990
    // (50000 - 24990) * 0.09 = £2,250.90, floored = £2,250
    const result = calculateStudentLoanRepayments(50000, ['plan1'], constants);
    expect(result.total).toBe(2250);
  });

  it('should calculate Plan 2 repayments', () => {
    // £50,000 income, Plan 2 threshold £27,295
    // (50000 - 27295) * 0.09 = £2,043.45, floored = £2,043
    const result = calculateStudentLoanRepayments(50000, ['plan2'], constants);
    expect(result.total).toBe(2043);
  });

  it('should calculate postgraduate loan repayments', () => {
    // £50,000 income, Postgrad threshold £21,000
    // (50000 - 21000) * 0.06 = £1,740
    const result = calculateStudentLoanRepayments(50000, ['postgrad'], constants);
    expect(result.total).toBe(1740);
  });

  it('should stack postgraduate with other plans', () => {
    // Plan 2: £2,043 + Postgrad: £1,740 = £3,783
    const result = calculateStudentLoanRepayments(50000, ['plan2', 'postgrad'], constants);
    expect(result.total).toBe(2043 + 1740);
  });

  it('should return zero for income below threshold', () => {
    const result = calculateStudentLoanRepayments(20000, ['plan2'], constants);
    expect(result.total).toBe(0);
  });
});

describe('calculateChildBenefits', () => {
  const childBenefitsInput = { childBenefitsTaken: true, numberOfChildren: 2 };

  it('should return zero when not claiming', () => {
    const result = calculateChildBenefits(50000, { childBenefitsTaken: false, numberOfChildren: 2 }, constants.childBenefitRates);
    expect(result.total).toBe(0);
  });

  it('should calculate full benefits below £50,000', () => {
    // First child: 25.60 * 52 = £1,331.20
    // Additional child: 16.95 * 52 = £881.40
    // Total = £2,212.60
    const result = calculateChildBenefits(40000, childBenefitsInput, constants.childBenefitRates);
    expect(result.total).toBeCloseTo(2212.60, 2);
  });

  it('should apply HICBC above £50,000', () => {
    // At £55,000: excess = £5,000
    // Charge percentage = floor(5000/100) = 50%
    // Benefits = £2,212.60, HICBC = -£1,106.30
    // Net = £1,106.30
    const result = calculateChildBenefits(55000, childBenefitsInput, constants.childBenefitRates);
    expect(result.total).toBeCloseTo(1106.30, 2);
  });

  it('should return zero net benefits at £60,000+', () => {
    // At £60,000+: charge percentage = 100%
    // HICBC claws back all benefits
    const result = calculateChildBenefits(60000, childBenefitsInput, constants.childBenefitRates);
    expect(result.total).toBe(0);
  });
});

describe('grossPensionContribution', () => {
  it('should gross up contributions with tax relief at source', () => {
    // £800 contribution becomes £1,000 with 25% tax relief
    const result = grossPensionContribution(800, true);
    expect(result).toBe(1000);
  });

  it('should not gross up contributions without tax relief at source', () => {
    const result = grossPensionContribution(800, false);
    expect(result).toBe(800);
  });
});

describe('calculateTaxes', () => {
  const baseInputs: TaxInputs = {
    taxYear: '2024/25',
    studentLoan: [],
    annualGrossSalary: 50000,
    annualGrossBonus: 0,
    grossEarningsRange: 150000,
    residentInScotland: false,
    noNI: false,
    blind: false,
    childBenefits: { childBenefitsTaken: false, numberOfChildren: 1 },
    pensionContributions: { autoEnrolment: 0, salarySacrifice: 0, personal: 0 },
    autoEnrolmentAsSalarySacrifice: true,
    taxReliefAtSource: true,
    activeTab: 'taxYearOverview',
    firstHomesLondon: false,
  };

  it('should calculate taxes for a basic salary', () => {
    const result = calculateTaxes(baseInputs);

    expect(result.grossEarnings.total).toBe(50000);
    expect(result.adjustedNetIncome).toBe(50000);
    expect(result.taxAllowance.total).toBe(12570);
    expect(result.taxableIncome).toBe(37430);
    // Tax: 37430 at 20% = £7,486
    expect(result.incomeTax.total).toBe(7486);
  });

  it('should reduce taxable income with salary sacrifice pension', () => {
    const inputs: TaxInputs = {
      ...baseInputs,
      pensionContributions: { ...baseInputs.pensionContributions, salarySacrifice: 5000 },
    };
    const result = calculateTaxes(inputs);

    expect(result.adjustedNetIncome).toBe(45000);
    expect(result.pensionPot.total).toBe(5000);
  });

  it('should calculate combined taxes correctly', () => {
    const result = calculateTaxes(baseInputs);

    const expectedCombined = result.incomeTax.total + result.employeeNI.total + result.studentLoanRepayments.total;
    expect(result.combinedTaxes).toBe(expectedCombined);
  });

  it('should calculate take home pay correctly', () => {
    const result = calculateTaxes(baseInputs);

    const expectedTakeHome = result.adjustedNetIncome - result.combinedTaxes;
    expect(result.takeHomePay).toBe(expectedTakeHome);
  });

  it('should handle Scottish tax rates', () => {
    const inputs: TaxInputs = { ...baseInputs, residentInScotland: true };
    const resultScotland = calculateTaxes(inputs);
    const resultEngland = calculateTaxes(baseInputs);

    // Scottish rates are generally higher for same income
    expect(resultScotland.incomeTax.total).not.toBe(resultEngland.incomeTax.total);
  });

  it('should handle student loan repayments', () => {
    const inputs: TaxInputs = { ...baseInputs, studentLoan: ['plan2'] };
    const result = calculateTaxes(inputs);

    expect(result.studentLoanRepayments.total).toBeGreaterThan(0);
    expect(result.combinedTaxes).toBeGreaterThan(calculateTaxes(baseInputs).combinedTaxes);
  });

  it('should handle child benefits with HICBC', () => {
    const inputs: TaxInputs = {
      ...baseInputs,
      annualGrossSalary: 55000,
      childBenefits: { childBenefitsTaken: true, numberOfChildren: 2 },
    };
    const result = calculateTaxes(inputs);

    // Should have partial child benefits due to HICBC
    expect(result.childBenefits.total).toBeGreaterThan(0);
    expect(result.childBenefits.total).toBeLessThan(2500); // Less than full amount
  });
});
