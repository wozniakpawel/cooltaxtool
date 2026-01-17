import { useMemo } from "react";
import Chart from "react-apexcharts";
import { calculateAnnualGrossIncome, calculateTaxes } from "../../utils/TaxCalc";
import {
  formatCurrency,
  formatPercent,
  getApexChartOptions,
} from "../../utils/chartUtils";

const TaxSavingsVsPensionContributions = (props) => {
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

  const options = useMemo(() => {
    const baseOptions = getApexChartOptions(props.theme, { isPercentage: true });

    return {
      ...baseOptions,
      colors: ["#2ecc71", "#3498db"],
      tooltip: {
        ...baseOptions.tooltip,
        x: {
          formatter: (value) => `Pension Contribution: ${formatCurrency(value)}`,
        },
        y: {
          formatter: (value) => formatPercent(value),
        },
      },
    };
  }, [props.theme]);

  const series = [
    {
      name: "Tax Savings as % of contributions",
      data: chartData.map((d) => ({ x: d.pensionContribution, y: d.taxSavingsPercentage })),
    },
    {
      name: "Effective Tax Rate",
      data: chartData.map((d) => ({ x: d.pensionContribution, y: d.effectiveTaxRate })),
    },
  ];

  return (
    <>
      <h5 className="text-center mt-3">Tax Savings and Effective Tax Rate vs Pension Contributions</h5>
      <Chart
        options={options}
        series={series}
        type="line"
        height={350}
      />
    </>
  );
};

export default TaxSavingsVsPensionContributions;
