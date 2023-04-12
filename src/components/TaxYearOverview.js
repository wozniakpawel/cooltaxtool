import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { calculateTaxes } from '../utils/TaxCalc';

const TaxYearOverview = ({ inputs }) => {
  const [plotData, setPlotData] = useState([]);

  useEffect(() => {
    const grossIncomes = Array.from({ length: 250 }, (_, i) => i * 1000);

    const percentageData = grossIncomes.map((grossIncome) => {
      const result = calculateTaxes(grossIncome, inputs);
      return {
        grossIncome: (result.grossIncome / grossIncome) * 100,
        personalAllowance: (result.personalAllowance / grossIncome) * 100,
        taxableIncome: (result.taxableIncome / grossIncome) * 100,
        incomeTax: (result.incomeTax / grossIncome) * 100,
        niContributions: (result.niContributions / grossIncome) * 100,
        studentLoanRepayments: (result.studentLoanRepayments / grossIncome) * 100,
        highIncomeChildBenefitCharge: (result.highIncomeChildBenefitCharge / grossIncome) * 100,
      };
    });

    setPlotData([
      { x: grossIncomes, y: percentageData.map((data) => data.grossIncome), type: 'scatter', mode: 'lines', marker: { color: 'blue' }, name: 'Gross Income' },
      { x: grossIncomes, y: percentageData.map((data) => data.personalAllowance), type: 'scatter', mode: 'lines', marker: { color: 'red' }, name: 'Personal Allowance' },
      { x: grossIncomes, y: percentageData.map((data) => data.taxableIncome), type: 'scatter', mode: 'lines', marker: { color: 'green' }, name: 'Taxable Income' },
      { x: grossIncomes, y: percentageData.map((data) => data.incomeTax), type: 'scatter', mode: 'lines', marker: { color: 'orange' }, name: 'Income Tax' },
      { x: grossIncomes, y: percentageData.map((data) => data.niContributions), type: 'scatter', mode: 'lines', marker: { color: 'purple' }, name: 'NI Contributions' },
      { x: grossIncomes, y: percentageData.map((data) => data.studentLoanRepayments), type: 'scatter', mode: 'lines', marker: { color: 'brown' }, name: 'Student Loan Repayments' },
      { x: grossIncomes, y: percentageData.map((data) => data.highIncomeChildBenefitCharge), type: 'scatter', mode: 'lines', marker: { color: 'pink' }, name: 'High Income Child Benefit Charge' },
    ]);
  }, [inputs]);

  return (
    <div className="TaxYearOverview">
      <Plot
        data={plotData}
        layout={{
          title: 'Gross Income vs Income Tax',
          xaxis: { title: 'Gross Income (£)' },
          yaxis: { title: 'Percentage of Income (%)' },
        }}
      />
    </div>
  );
};

export default TaxYearOverview;
