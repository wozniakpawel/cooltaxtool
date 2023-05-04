import React, { useState, useEffect } from "react";
import Plot from "react-plotly.js";
import { Container } from "react-bootstrap";
import { calculateTaxes } from "../../utils/TaxCalc";

const TaxSavingsVsPensionContributions = (props) => {
  const [taxSavingsPlotData, setTaxSavingsPlotData] = useState([]);

  useEffect(() => {
    const pensionContributions = Array.from(
      { length: 1000 },
      (_, i) => (i * props.inputs.grossIncome) / 1000
    );

    const taxSavingsData = pensionContributions.map((pensionContribution) => {
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

      const taxesWithVoluntaryPension = calculateTaxes(
        props.inputs.grossIncome,
        inputsWithVoluntaryPension
      );
      const taxesWithoutVoluntaryPension = calculateTaxes(
        props.inputs.grossIncome,
        inputsWithoutVoluntaryPension
      );

      const taxSavings =
        taxesWithoutVoluntaryPension.combinedTaxes -
        taxesWithVoluntaryPension.combinedTaxes;
      const taxSavingsPercentage = Math.max(
        0,
        Math.min(100, (taxSavings / pensionContribution) * 100)
      );
      const effectiveTaxRate = Math.max(
        0,
        Math.min(
          100,
          (taxesWithVoluntaryPension.combinedTaxes / props.inputs.grossIncome) *
            100
        )
      );

      return { pensionContribution, taxSavingsPercentage, effectiveTaxRate };
    });

    const taxSavingsPlot = {
      x: taxSavingsData.map((data) => data.pensionContribution),
      y: taxSavingsData.map((data) => data.taxSavingsPercentage),
      type: "scatter",
      mode: "lines",
      marker: { color: "#2ecc71" },
      name: "Tax Savings (%)",
      hovertemplate: "%{y:.1f}%",
    };

    const effectiveTaxRatePlot = {
      x: taxSavingsData.map((data) => data.pensionContribution),
      y: taxSavingsData.map((data) => data.effectiveTaxRate),
      type: "scatter",
      mode: "lines",
      marker: { color: "#3498db" },
      name: "Effective Tax Rate (%)",
      hovertemplate: "%{y:.1f}%",
    };

    setTaxSavingsPlotData([taxSavingsPlot, effectiveTaxRatePlot]);
  }, [props.inputs]);

  return (
      <Plot
        data={taxSavingsPlotData}
        layout={props.plotThemer({
          hovermode: "x",
          title: "Tax Savings and Effective Tax Rate vs Pension Contributions",
          xaxis: { title: "Pension Contributions (£)" },
          yaxis: { title: "Percentage (%)" },
        })}
      />
  );
};

export default TaxSavingsVsPensionContributions;
