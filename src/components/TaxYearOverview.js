import React, { useState, useEffect } from "react";
import Plot from "react-plotly.js";
import { Container } from "react-bootstrap";
import { calculateTaxes } from "../utils/TaxCalc";

const plotSettings = [
  { key: "adjustedNetIncome", color: "#3498db", label: "Adjusted Net Income" },
  { key: "personalAllowance", color: "#1abc9c", label: "Personal Allowance" },
  { key: "taxableIncome", color: "#2980b9", label: "Taxable Income" },
  { key: "incomeTax", color: "#8e44ad", label: "Income Tax" },
  { key: "employeeNI", color: "#e74c3c", label: "Employee NI Contributions" },
  { key: "employerNI", color: "#d35400", label: "Employer NI Contributions" },
  {
    key: "studentLoanRepayments",
    color: "#f39c12",
    label: "Student Loan Repayments",
  },
  {
    key: "combinedTaxes",
    color: "#c0392b",
    label: "Combined taxes (IT, EE NI, SL)",
  },
  { key: "takeHomePay", color: "#2ecc71", label: "Take Home Pay" },
  { key: "pensionPot", color: "#27ae60", label: "Pension Pot" },
  {
    key: "yourMoney",
    color: "#16a085",
    label: "Your money (Pension Pot + Take Home)",
  },
  {
    key: "marginalCombinedTaxRate",
    color: "#f1c40f",
    label: "Marginal Combined Tax Rate",
    dashed: true,
  },
];

const TaxYearOverview = (props) => {
  const [percentagePlotData, setPercentagePlotData] = useState([]);
  const [amountPlotData, setAmountPlotData] = useState([]);

  useEffect(() => {
    const grossIncomes = Array.from(
      { length: 1000 },
      (_, i) => (i * props.inputs.salaryRange) / 1000
    );

    const taxData = grossIncomes.map((grossIncome) => {
      const { incomeTax, employeeNI, employerNI, pensionPot, studentLoanRepayments, ...rest } =
        calculateTaxes(grossIncome, props.inputs);
      return {
        incomeTax: incomeTax.total,
        employeeNI: employeeNI.total,
        employerNI: employerNI.total,
        pensionPot: pensionPot.total,
        studentLoanRepayments: studentLoanRepayments.total,
        ...rest,
      };
    });

    const marginalCombinedTaxes = [];
    for (let i = 1; i < taxData.length; i++) {
      const deltaTaxes =
        taxData[i].combinedTaxes - taxData[i - 1].combinedTaxes;
      const deltaIncome = grossIncomes[i] - grossIncomes[i - 1];
      marginalCombinedTaxes.push(Math.ceil((deltaTaxes / deltaIncome) * 100));
    }

    const createPlotData = (grossIncomes, dataArray, isPercentage = false) => {
      return plotSettings
        .map((setting) => {
          if (
            ((setting.key === "employeeNI" || setting.key === "employerNI") &&
              props.inputs.noNI) ||
            (setting.key === "studentLoanRepayments" &&
              props.inputs.studentLoan === []) ||
            (setting.key === "personalAllowance" && isPercentage) ||
            (setting.key === "marginalCombinedTaxRate" && !isPercentage)
          ) {
            return null;
          }

          const hoverTemplate = isPercentage ? "%{y:.1f}%" : "£%{y:,.2f}";

          if (setting.key === "marginalCombinedTaxRate" && isPercentage) {
            return {
              x: grossIncomes.slice(1),
              y: marginalCombinedTaxes,
              type: "scatter",
              mode: "lines",
              line: { dash: "dash", color: setting.color },
              name: setting.label,
              hovertemplate: hoverTemplate,
            };
          }
          return {
            x: grossIncomes,
            y: dataArray.map((data) => {
              const value = isPercentage
                ? (data[setting.key] / data["grossIncome"]) * 100
                : data[setting.key];
              return isPercentage ? Math.max(0, Math.min(100, value)) : value;
            }),
            type: "scatter",
            mode: "lines",
            marker: { color: setting.color },
            name: setting.label,
            hovertemplate: hoverTemplate,
          };
        })
        .filter((data) => data !== null);
    };

    const amountPlotData = createPlotData(grossIncomes, taxData);
    const percentagePlotData = createPlotData(grossIncomes, taxData, true);

    setPercentagePlotData(percentagePlotData);
    setAmountPlotData(amountPlotData);
  }, [props.inputs]);

  return (
    <Container>
      <Plot
        data={percentagePlotData}
        layout={props.plotThemer({
          hovermode: "x",
          title: "Percentages of gross income",
          xaxis: { title: "Annual Gross Income (£)" },
          yaxis: { title: "Percentage of Income (%)" },
        })}
      />

      <Plot
        data={amountPlotData}
        layout={props.plotThemer({
          hovermode: "x",
          title: "Annual total amounts",
          xaxis: { title: "Annual Gross Income (£)" },
          yaxis: { title: "Annual Total Amount (£)" },
        })}
      />
    </Container>
  );
};

export default TaxYearOverview;
