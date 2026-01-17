import { useMemo } from "react";
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
import { calculateAnnualGrossIncome, calculateTaxes } from "../../utils/TaxCalc";
import {
  formatCurrency,
  formatPercent,
  getChartTheme,
  getTooltipStyle,
  axisTickStyle,
  legendStyle,
  chartMargin,
} from "../../utils/chartUtils";

const TaxSavingsVsPensionContributions = (props) => {
  const { isDark, axisColor, gridColor } = getChartTheme(props.theme);
  const tooltipStyle = getTooltipStyle(isDark);

  const chartData = useMemo(() => {
    const annualGrossIncome = calculateAnnualGrossIncome(
      props.inputs.annualGrossSalary,
      props.inputs.annualGrossBonus
    ).total;

    // Calculate baseline taxes once (without voluntary pension)
    const taxesWithoutVoluntaryPension = calculateTaxes({
      ...props.inputs,
      pensionContributions: {
        ...props.inputs.pensionContributions,
        personal: 0,
      },
    });

    const pensionContributions = Array.from(
      { length: 200 },
      (_, i) => (i * annualGrossIncome) / 200
    );

    return pensionContributions.map((pensionContribution) => {
      const taxesWithVoluntaryPension = calculateTaxes({
        ...props.inputs,
        pensionContributions: {
          ...props.inputs.pensionContributions,
          personal: pensionContribution,
        },
      });

      const taxSavings =
        taxesWithoutVoluntaryPension.combinedTaxes -
        taxesWithVoluntaryPension.combinedTaxes;
      const taxSavingsPercentage = pensionContribution > 0
        ? Math.max(0, Math.min(100, (taxSavings / pensionContribution) * 100))
        : 0;
      const effectiveTaxRate = Math.max(
        0,
        Math.min(
          100,
          (taxesWithVoluntaryPension.combinedTaxes / annualGrossIncome) * 100
        )
      );

      return {
        pensionContribution,
        taxSavingsPercentage,
        effectiveTaxRate,
      };
    });
  }, [props.inputs]);

  return (
    <>
      <h5 className="text-center mt-3">Tax Savings and Effective Tax Rate vs Pension Contributions</h5>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData} margin={chartMargin}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey="pensionContribution"
            tickFormatter={formatCurrency}
            stroke={axisColor}
            tick={axisTickStyle(axisColor)}
          />
          <YAxis
            tickFormatter={formatPercent}
            stroke={axisColor}
            tick={axisTickStyle(axisColor)}
            domain={[0, 100]}
          />
          <Tooltip
            formatter={(value, name) => [formatPercent(value), name]}
            labelFormatter={(label) => `Pension Contribution: ${formatCurrency(label)}`}
            {...tooltipStyle}
          />
          <Legend wrapperStyle={legendStyle} />
          <Line
            type="monotone"
            dataKey="taxSavingsPercentage"
            name="Tax Savings as % of contributions"
            stroke="#2ecc71"
            dot={false}
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="effectiveTaxRate"
            name="Effective Tax Rate"
            stroke="#3498db"
            dot={false}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </>
  );
};

export default TaxSavingsVsPensionContributions;
