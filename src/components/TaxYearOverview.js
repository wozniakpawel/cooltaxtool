import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { calculateTaxes } from '../utils/TaxCalc';

const TaxYearOverview = ({ inputs }) => {
  const [plotData, setPlotData] = useState([]);

  useEffect(() => {
    const grossIncomes = Array.from({ length: 250 }, (_, i) => i * 1000);

    const taxData = grossIncomes.map((grossIncome) => {
      return calculateTaxes(grossIncome, inputs);
    });

    const percentageData = taxData.map((result, index) => {
      const grossIncome = grossIncomes[index];
      return {
        incomeTax: (result.incomeTax / grossIncome) * 100,
        employeeNI: (result.employeeNI / grossIncome) * 100,
        employerNI: (result.employerNI / grossIncome) * 100,
        studentLoanRepayments: (result.studentLoanRepayments / grossIncome) * 100,
        highIncomeChildBenefitCharge: (result.highIncomeChildBenefitCharge / grossIncome) * 100,
        combinedTaxes: (result.combinedTaxes / grossIncome) * 100,
      };
    });

    const marginalCombinedTaxes = [];
    for (let i = 1; i < taxData.length; i++) {
      const deltaTaxes = taxData[i].combinedTaxes - taxData[i - 1].combinedTaxes;
      const deltaIncome = grossIncomes[i] - grossIncomes[i - 1];
      marginalCombinedTaxes.push((deltaTaxes / deltaIncome) * 100);
    }

    setPlotData([
      { x: grossIncomes, y: percentageData.map((data) => data.incomeTax), type: 'scatter', mode: 'lines', marker: { color: 'orange' }, name: 'Income Tax' },
      { x: grossIncomes, y: percentageData.map((data) => data.employeeNI), type: 'scatter', mode: 'lines', marker: { color: 'purple' }, name: 'Employee NI Contributions' },
      { x: grossIncomes, y: percentageData.map((data) => data.employerNI), type: 'scatter', mode: 'lines', marker: { color: 'purple' }, name: 'Employer NI Contributions' },
      { x: grossIncomes, y: percentageData.map((data) => data.studentLoanRepayments), type: 'scatter', mode: 'lines', marker: { color: 'brown' }, name: 'Student Loan Repayments' },
      { x: grossIncomes, y: percentageData.map((data) => data.highIncomeChildBenefitCharge), type: 'scatter', mode: 'lines', marker: { color: 'pink' }, name: 'High Income Child Benefit Charge' },
      { x: grossIncomes, y: percentageData.map((data) => data.combinedTaxes), type: 'scatter', mode: 'lines', marker: { color: 'red' }, name: 'Combined taxes (IT, EE NI, SLR)' },
      { x: grossIncomes.slice(1), y: marginalCombinedTaxes, type: 'scatter', mode: 'lines', marker: { color: 'blue' }, name: 'Marginal Combined Tax Rate' },
    ]);
  }, [inputs]);

  return (
    <div className="TaxYearOverview">
      <Plot
        data={plotData}
        layout={{
          title: 'Gross Income vs Income Tax',
          hovermode: 'x',
          xaxis: { title: 'Gross Income (£)' },
          yaxis: { title: 'Percentage of Income (%)' },
        }}
      />
    </div>
  );
};

export default TaxYearOverview;
