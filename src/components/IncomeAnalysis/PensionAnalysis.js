import React, { useState, useEffect } from "react";
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

const TaxSavingsVsPensionContributions = (props) => {
  const [chartData, setChartData] = useState([]);

  const isDark = props.theme === "dark";
  const axisColor = isDark ? "#fff" : "#666";
  const gridColor = isDark ? "#555" : "#ccc";

  useEffect(() => {
    const annualGrossIncome = calculateAnnualGrossIncome(
      props.inputs.annualGrossSalary,
      props.inputs.annualGrossBonus
    ).total;

    const pensionContributions = Array.from(
      { length: 200 },
      (_, i) => (i * annualGrossIncome) / 200
    );

    const data = pensionContributions.map((pensionContribution) => {
      const inputsWithVoluntaryPension = {
        ...props.inputs,
        pensionContributions: {
          ...props.inputs.pensionContributions,
          personal: pensionContribution,
        },
      };

      const inputsWithoutVoluntaryPension = {
        ...props.inputs,
        pensionContributions: {
          ...props.inputs.pensionContributions,
          personal: 0,
        },
      };

      const taxesWithVoluntaryPension = calculateTaxes(inputsWithVoluntaryPension);
      const taxesWithoutVoluntaryPension = calculateTaxes(inputsWithoutVoluntaryPension);

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

    setChartData(data);
  }, [props.inputs]);

  const formatCurrency = (value) => `£${value.toLocaleString()}`;
  const formatPercent = (value) => `${value.toFixed(1)}%`;

  return (
    <>
      <h5 className="text-center mt-3">Tax Savings and Effective Tax Rate vs Pension Contributions</h5>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey="pensionContribution"
            tickFormatter={formatCurrency}
            stroke={axisColor}
            tick={{ fill: axisColor, fontSize: 12 }}
          />
          <YAxis
            tickFormatter={formatPercent}
            stroke={axisColor}
            tick={{ fill: axisColor, fontSize: 12 }}
            domain={[0, 100]}
          />
          <Tooltip
            formatter={(value, name) => [formatPercent(value), name]}
            labelFormatter={(label) => `Pension Contribution: ${formatCurrency(label)}`}
            contentStyle={{
              backgroundColor: isDark ? "#333" : "#fff",
              border: `1px solid ${isDark ? "#555" : "#ccc"}`,
              color: isDark ? "#fff" : "#333",
              fontSize: 11,
              padding: "4px 8px",
              maxHeight: 200,
              overflowY: "auto",
            }}
            itemStyle={{ padding: 0, margin: 0, lineHeight: 1.2 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
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
