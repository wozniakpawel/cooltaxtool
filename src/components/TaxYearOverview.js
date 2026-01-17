import { useMemo } from "react";
import Chart from "react-apexcharts";
import { Container } from "react-bootstrap";
import { calculateTaxes } from "../utils/TaxCalc";
import {
  formatCurrency,
  formatPercent,
  getApexChartOptions,
} from "../utils/chartUtils";

const plotSettings = [
  { key: "adjustedNetIncome", color: "#3498db", label: "Adjusted Net Income" },
  { key: "taxAllowance", color: "#1abc9c", label: "Tax Allowance", amountOnly: true },
  { key: "taxableIncome", color: "#2980b9", label: "Taxable Income" },
  { key: "incomeTax", color: "#8e44ad", label: "Income Tax" },
  { key: "employeeNI", color: "#e74c3c", label: "Employee NI Contributions" },
  { key: "employerNI", color: "#d35400", label: "Employer NI Contributions" },
  { key: "studentLoanRepayments", color: "#f39c12", label: "Student Loan Repayments" },
  { key: "combinedTaxes", color: "#c0392b", label: "Combined taxes (IT, EE NI, SL)" },
  { key: "childBenefits", color: "#35cc71", label: "Child Benefits (incl. HICBC)", dashed: true },
  { key: "takeHomePay", color: "#2ecc71", label: "Take Home Pay" },
  { key: "pensionPot", color: "#27ae60", label: "Pension Pot" },
  { key: "yourMoney", color: "#16a085", label: "Your money (Pension Pot + Take Home)" },
  { key: "marginalCombinedTaxRate", color: "#f1c40f", label: "Marginal Combined Tax Rate", dashed: true, percentOnly: true },
];

const TaxYearOverview = (props) => {
  const chartData = useMemo(() => {
    const grossIncomes = Array.from(
      { length: 200 },
      (_, i) => (i * props.inputs.annualGrossIncomeRange) / 200
    );

    const data = grossIncomes.map((grossIncome) => {
      const { annualGrossIncome, taxAllowance, incomeTax, employeeNI, employerNI, pensionPot, studentLoanRepayments, childBenefits, ...rest } =
        calculateTaxes({
          ...props.inputs,
          annualGrossBonus: 0,
          annualGrossSalary: grossIncome,
        });
      return {
        annualGrossIncome: annualGrossIncome.total,
        taxAllowance: taxAllowance.total,
        incomeTax: incomeTax.total,
        employeeNI: employeeNI.total,
        employerNI: employerNI.total,
        pensionPot: pensionPot.total,
        studentLoanRepayments: studentLoanRepayments.total,
        childBenefits: childBenefits.total,
        ...rest,
      };
    });

    // Calculate marginal tax rate
    for (let i = 1; i < data.length; i++) {
      const deltaTaxes = data[i].combinedTaxes - data[i - 1].combinedTaxes;
      const deltaIncome = data[i].annualGrossIncome - data[i - 1].annualGrossIncome;
      data[i].marginalCombinedTaxRate = deltaIncome > 0 ? Math.ceil((deltaTaxes / deltaIncome) * 100) : 0;
    }
    data[0].marginalCombinedTaxRate = 0;

    return data;
  }, [props.inputs]);

  const percentageData = useMemo(() => {
    return chartData.map((d) => {
      const gross = d.annualGrossIncome || 1;
      const result = { annualGrossIncome: d.annualGrossIncome };
      plotSettings.forEach((s) => {
        if (!s.amountOnly) {
          result[s.key] = s.key === "marginalCombinedTaxRate"
            ? d[s.key]
            : Math.max(0, Math.min(100, (d[s.key] / gross) * 100));
        }
      });
      return result;
    });
  }, [chartData]);

  const visibleSettingsAmount = useMemo(() => {
    return plotSettings.filter((setting) => {
      if (setting.percentOnly) return false;
      if ((setting.key === "employeeNI" || setting.key === "employerNI") && props.inputs.noNI) return false;
      if (setting.key === "studentLoanRepayments" && props.inputs.studentLoan.length === 0) return false;
      if (setting.key === "childBenefits" && !props.inputs.childBenefits.childBenefitsTaken) return false;
      return true;
    });
  }, [props.inputs.noNI, props.inputs.studentLoan.length, props.inputs.childBenefits.childBenefitsTaken]);

  const visibleSettingsPercent = useMemo(() => {
    return plotSettings.filter((setting) => {
      if (setting.amountOnly) return false;
      if ((setting.key === "employeeNI" || setting.key === "employerNI") && props.inputs.noNI) return false;
      if (setting.key === "studentLoanRepayments" && props.inputs.studentLoan.length === 0) return false;
      if (setting.key === "childBenefits" && !props.inputs.childBenefits.childBenefitsTaken) return false;
      return true;
    });
  }, [props.inputs.noNI, props.inputs.studentLoan.length, props.inputs.childBenefits.childBenefitsTaken]);

  const buildSeries = (data, visibleSettings, xKey) => {
    return visibleSettings.map((setting) => ({
      name: setting.label,
      data: data.map((d) => ({ x: d[xKey], y: d[setting.key] })),
    }));
  };

  const buildOptions = (isPercentage, visibleSettings, xFormatter) => {
    const baseOptions = getApexChartOptions(props.theme, { isPercentage });

    return {
      ...baseOptions,
      colors: visibleSettings.map((s) => s.color),
      stroke: {
        ...baseOptions.stroke,
        dashArray: visibleSettings.map((s) => (s.dashed ? 5 : 0)),
      },
      tooltip: {
        ...baseOptions.tooltip,
        x: {
          formatter: xFormatter,
        },
        y: {
          formatter: (value) => (isPercentage ? formatPercent(value) : formatCurrency(value)),
        },
      },
    };
  };

  const percentOptions = buildOptions(
    true,
    visibleSettingsPercent,
    (value) => `Gross: ${formatCurrency(value)}`
  );

  const amountOptions = buildOptions(
    false,
    visibleSettingsAmount,
    (value) => `Gross: ${formatCurrency(value)}`
  );

  const percentSeries = buildSeries(percentageData, visibleSettingsPercent, "annualGrossIncome");
  const amountSeries = buildSeries(chartData, visibleSettingsAmount, "annualGrossIncome");

  return (
    <Container>
      <h5 className="text-center mt-3">Percentages of gross income</h5>
      <Chart
        options={percentOptions}
        series={percentSeries}
        type="line"
        height={350}
      />
      <h5 className="text-center mt-3">Annual total amounts</h5>
      <Chart
        options={amountOptions}
        series={amountSeries}
        type="line"
        height={350}
      />
    </Container>
  );
};

export default TaxYearOverview;
