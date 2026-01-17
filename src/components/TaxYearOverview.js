import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Container } from "react-bootstrap";
import { calculateTaxes } from "../utils/TaxCalc";
import {
  formatCurrency,
  formatPercent,
  getChartTheme,
  getTooltipStyle,
  axisTickStyle,
  legendStyle,
  chartMargin,
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
  const [chartData, setChartData] = useState([]);

  const { isDark, axisColor, gridColor } = getChartTheme(props.theme);
  const tooltipStyle = getTooltipStyle(isDark);

  useEffect(() => {
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

    setChartData(data);
  }, [props.inputs]);

  const getPercentageData = (data) => {
    return data.map((d) => {
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
  };

  const getVisibleSettings = (isPercentage) => {
    return plotSettings.filter((setting) => {
      if (setting.amountOnly && isPercentage) return false;
      if (setting.percentOnly && !isPercentage) return false;
      if ((setting.key === "employeeNI" || setting.key === "employerNI") && props.inputs.noNI) return false;
      if (setting.key === "studentLoanRepayments" && props.inputs.studentLoan.length === 0) return false;
      if (setting.key === "childBenefits" && !props.inputs.childBenefits.childBenefitsTaken) return false;
      return true;
    });
  };

  const renderChart = (title, data, isPercentage) => (
    <>
      <h5 className="text-center mt-3">{title}</h5>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data} margin={chartMargin}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey="annualGrossIncome"
            tickFormatter={formatCurrency}
            stroke={axisColor}
            tick={axisTickStyle(axisColor)}
          />
          <YAxis
            tickFormatter={isPercentage ? formatPercent : formatCurrency}
            stroke={axisColor}
            tick={axisTickStyle(axisColor)}
            domain={isPercentage ? [0, 100] : undefined}
          />
          <Tooltip
            formatter={(value, name) => [isPercentage ? formatPercent(value) : formatCurrency(value), name]}
            labelFormatter={(label) => `Gross: ${formatCurrency(label)}`}
            {...tooltipStyle}
          />
          <Legend wrapperStyle={legendStyle} />
          {getVisibleSettings(isPercentage).map((setting) => (
            <Line
              key={setting.key}
              type="monotone"
              dataKey={setting.key}
              name={setting.label}
              stroke={setting.color}
              strokeDasharray={setting.dashed ? "5 5" : "0"}
              dot={false}
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </>
  );

  return (
    <Container>
      {renderChart("Percentages of gross income", getPercentageData(chartData), true)}
      {renderChart("Annual total amounts", chartData, false)}
    </Container>
  );
};

export default TaxYearOverview;
