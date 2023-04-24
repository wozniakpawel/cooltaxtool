import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { Container } from 'react-bootstrap';
import { calculateTaxes } from '../utils/TaxCalc';

const TaxSavingsVsPensionContributions = ({ inputs }) => {
  const [taxSavingsPlotData, setTaxSavingsPlotData] = useState([]);

  useEffect(() => {
    const pensionContributions = Array.from({ length: 1000 }, (_, i) => i * inputs.grossIncome / 1000);

    const taxSavingsData = pensionContributions.map((pensionContribution) => {
      const inputsWithVoluntaryPension = {
        ...inputs,
        pensionContributions: {
          ...inputs.pensionContributions,
          personal: pensionContribution,
        },
      };

      const taxesWithVoluntaryPension = calculateTaxes(inputs.grossIncome, inputsWithVoluntaryPension);
      const taxesWithoutVoluntaryPension = calculateTaxes(inputs.grossIncome, inputs);

      const taxSavings = taxesWithoutVoluntaryPension.combinedTaxes - taxesWithVoluntaryPension.combinedTaxes;
      const taxSavingsPercentage = Math.max(0, Math.min(100, (taxSavings / pensionContribution) * 100));
      const effectiveTaxRate = Math.max(0, Math.min(100, (taxesWithVoluntaryPension.combinedTaxes / inputs.grossIncome) * 100));

      return { pensionContribution, taxSavingsPercentage, effectiveTaxRate };
    });

    const taxSavingsPlot = {
      x: taxSavingsData.map((data) => data.pensionContribution),
      y: taxSavingsData.map((data) => data.taxSavingsPercentage),
      type: 'scatter',
      mode: 'lines',
      marker: { color: '#2ecc71' },
      name: 'Tax Savings (%)',
      hovertemplate: '%{y:.1f}%',
    };

    const effectiveTaxRatePlot = {
      x: taxSavingsData.map((data) => data.pensionContribution),
      y: taxSavingsData.map((data) => data.effectiveTaxRate),
      type: 'scatter',
      mode: 'lines',
      marker: { color: '#3498db' },
      name: 'Effective Tax Rate (%)',
      hovertemplate: '%{y:.1f}%',
    };

    setTaxSavingsPlotData([taxSavingsPlot, effectiveTaxRatePlot]);
  }, [inputs]);

  return (
    <Container fluid>
      <Plot
        data={taxSavingsPlotData}
        layout={{
          hovermode: 'x',
          title: 'Tax Savings and Effective Tax Rate vs Pension Contributions',
          xaxis: { title: 'Pension Contributions (£)' },
          yaxis: { title: 'Percentage (%)' },
        }}
      />
    </Container>
  );
};

export default TaxSavingsVsPensionContributions;
