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

  // Find gross income needed to match the purchasing power of someone at the cap
  // Uses binary search for stable result independent of chart range
  const equivalentGrossIncome = useMemo(() => {
    const getTakeHome = (gross) => calculateTaxes({
      ...props.inputs,
      annualGrossBonus: 0,
      annualGrossSalary: gross,
    }).takeHomePay;

    const takeHomeAtCap = getTakeHome(config.incomeCap);
    const priceMultiplier = config.maxHousePrice / discountedPrice;
    const targetTakeHome = takeHomeAtCap * priceMultiplier;

    // Binary search between cap and 1M with £100 precision (~14 iterations)
    let low = config.incomeCap;
    let high = 1000000;
    while (high - low > 100) {
      const mid = (low + high) / 2;
      if (getTakeHome(mid) < targetTakeHome) {
        low = mid;
      } else {
        high = mid;
      }
    }
    return Math.round(high / 1000) * 1000;
  }, [props.inputs, config.incomeCap, config.maxHousePrice, discountedPrice]);

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
  }, [props.inputs, config.incomeCap, config.maxHousePrice, discountedPrice]);

  const chartTitle = "Annual Take Home Pay as a % of the House Price"

  const series = [
    {
      name: chartTitle,
      data: chartData.map((d) => ({ x: d.grossIncome, y: d.percentOfHousePrice })),
    },
  ];

  const baseOptions = getApexChartOptions(props.theme, {
    isPercentage: false,
    xAxisTitle: "Gross Salary",
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
        text: chartTitle,
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
        {chartTitle}
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
          {equivalentGrossIncome && (
            <> To have the same purchasing power at full price, you'd need to earn approximately <strong>{formatCurrency(equivalentGrossIncome)}</strong> gross.</>
          )}
        </small>
      </Alert>
    </Container>
  );
};

export default FirstHomes;
