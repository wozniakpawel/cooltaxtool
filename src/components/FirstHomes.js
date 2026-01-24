import { useMemo } from "react";
import Chart from "react-apexcharts";
import { Container, Alert } from "react-bootstrap";
import { calculateTaxes } from "../utils/TaxCalc";
import {
  formatCurrency,
  formatPercent,
  getApexChartOptions,
} from "../utils/chartUtils";

const DISCOUNT_RATE = 0.5;

const FIRST_HOMES_CONFIG = {
  london: {
    maxHousePrice: 420000,
    incomeCap: 90000,
  },
  outsideLondon: {
    maxHousePrice: 250000,
    incomeCap: 80000,
  },
};

const FirstHomes = (props) => {
  const isLondon = props.inputs.firstHomesLondon;
  const config = isLondon ? FIRST_HOMES_CONFIG.london : FIRST_HOMES_CONFIG.outsideLondon;
  const discountedPrice = config.maxHousePrice * DISCOUNT_RATE;

  const chartData = useMemo(() => {
    const grossIncomes = Array.from(
      { length: 200 },
      (_, i) => (i * props.inputs.grossEarningsRange) / 200
    );

    return grossIncomes.map((grossIncome) => {
      const taxResult = calculateTaxes({
        ...props.inputs,
        annualGrossBonus: 0,
        annualGrossSalary: grossIncome,
      });

      const takeHomePay = taxResult.takeHomePay;
      const isEligible = grossIncome <= config.incomeCap;
      // Key insight: house price depends on eligibility
      const housePrice = isEligible ? discountedPrice : config.maxHousePrice;
      const percentOfHousePrice = (takeHomePay / housePrice) * 100;

      return {
        grossIncome,
        takeHomePay,
        housePrice,
        percentOfHousePrice,
        isEligible,
      };
    });
  }, [props.inputs, config.incomeCap, config.maxHousePrice, discountedPrice, props.inputs.grossEarningsRange]);

  const series = [
    {
      name: "Take Home Pay (% of House Price)",
      data: chartData.map((d) => ({ x: d.grossIncome, y: d.percentOfHousePrice })),
    },
  ];

  const baseOptions = getApexChartOptions(props.theme, {
    isPercentage: false,
    xAxisTitle: "Gross Salary",
    yAxisTitle: "Take Home Pay (% of House Price)",
  });

  const options = {
    ...baseOptions,
    colors: ["#2ecc71"],
    stroke: {
      ...baseOptions.stroke,
      width: 2,
    },
    yaxis: {
      ...baseOptions.yaxis,
      labels: {
        ...baseOptions.yaxis.labels,
        formatter: formatPercent,
      },
      min: 0,
      max: undefined,
      title: {
        text: "Take Home Pay (% of House Price)",
        style: baseOptions.yaxis.title?.style,
      },
    },
    xaxis: {
      ...baseOptions.xaxis,
      title: {
        text: "Annual Gross Salary",
        style: baseOptions.xaxis.title?.style,
      },
    },
    tooltip: {
      ...baseOptions.tooltip,
      x: {
        formatter: (value) => `Gross Salary: ${formatCurrency(value)}`,
      },
      y: {
        formatter: (value, { dataPointIndex }) => {
          const data = chartData[dataPointIndex];
          if (!data) return formatPercent(value);
          return `${formatPercent(value)} of ${formatCurrency(data.housePrice)}`;
        },
      },
    },
    annotations: {
      xaxis: [
        {
          x: config.incomeCap,
          borderColor: "#e74c3c",
          strokeDashArray: 0,
          label: {
            borderColor: "#e74c3c",
            style: {
              color: "#fff",
              background: "#e74c3c",
            },
            text: `Income Cap: ${formatCurrency(config.incomeCap)}`,
            position: "top",
          },
        },
      ],
    },
  };

  return (
    <Container>
      <h5 className="text-center mt-3">
        First Homes Scheme - {isLondon ? "London" : "Outside London"}
      </h5>

      <Alert variant="info" className="mt-2">
        <strong>First Homes Scheme</strong>
        <ul className="mb-0 mt-2">
          <li>Eligible (≤{formatCurrency(config.incomeCap)}): House price {formatCurrency(discountedPrice)} ({DISCOUNT_RATE * 100}% off {formatCurrency(config.maxHousePrice)})</li>
          <li>Ineligible (&gt;{formatCurrency(config.incomeCap)}): Full price {formatCurrency(config.maxHousePrice)}</li>
          <li>Must be a first-time buyer, 18+, with mortgage for at least 50% of discounted price</li>
        </ul>
      </Alert>

      <h6 className="text-center mt-3">
        Take Home Pay as % of House Price
      </h6>
      <Chart
        options={options}
        series={series}
        type="line"
        height={400}
      />

      <Alert variant="warning" className="mt-3">
        <small>
          <strong>Note:</strong> Above {formatCurrency(config.incomeCap)}, you lose eligibility and must pay full price ({formatCurrency(config.maxHousePrice)} instead of {formatCurrency(discountedPrice)}), causing the dramatic drop in the chart.
        </small>
      </Alert>
    </Container>
  );
};

export default FirstHomes;
