import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { calculateTaxes } from '../utils/TaxCalc';

const TaxYearOverview = ({ inputs }) => {
  const [plotData, setPlotData] = useState([]);
  console.log("aaaaa", inputs);

  useEffect(() => {
    const grossIncomes = Array.from({ length: 101 }, (_, i) => i * 1000);
    const incomeTaxes = grossIncomes.map((grossIncome) =>
      calculateTaxes(grossIncome, inputs),
    );

    setPlotData([
      {
        x: grossIncomes,
        y: incomeTaxes,
        type: 'scatter',
        mode: 'lines',
        marker: { color: 'blue' },
      },
    ]);
  }, [inputs]);

  return (
    <div className="TaxYearOverview">
      <Plot
        data={plotData}
        layout={{
          title: 'Gross Income vs Income Tax',
          xaxis: { title: 'Gross Income (£)' },
          yaxis: { title: 'Income Tax (£)' },
        }}
      />
    </div>
  );
};

export default TaxYearOverview;
