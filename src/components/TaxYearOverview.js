// src/components/TaxYearOverview.js

import React, { useContext, useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import { calculateIncomeTax } from '../utils/TaxCalc';
import TaxDataContext from '../context/TaxDataContext';

const TaxYearOverview = ({ userInputs }) => {
  const { taxData } = useContext(TaxDataContext);
  const [plotData, setPlotData] = useState([]);

  useEffect(() => {
    const grossIncomes = Array.from({ length: 101 }, (_, i) => i * 1000); // Gross incomes from 0 to 100,000 with step of 1,000
    const incomeTaxes = grossIncomes.map((grossIncome) =>
      calculateIncomeTax(grossIncome, taxData),
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
  }, [taxData, userInputs]);

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
