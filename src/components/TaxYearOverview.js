import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { calculateTaxes } from '../utils/TaxCalc';

const TaxYearOverview = ({ inputs }) => {
  const [plotData, setPlotData] = useState([]);

  useEffect(() => {
    const grossIncomes = Array.from({ length: 250 }, (_, i) => i * 1000);
  
    const grossIncomeValues = [];
    const personalAllowanceValues = [];
    const taxableIncomeValues = [];
    const incomeTaxValues = [];
    const niContributionsValues = [];
    const studentLoanRepaymentsValues = [];
    const highIncomeChildBenefitChargeValues = [];
  
    grossIncomes.forEach((grossIncome) => {
      const result = calculateTaxes(grossIncome, inputs);
      grossIncomeValues.push(result.grossIncome);
      personalAllowanceValues.push(result.personalAllowance);
      taxableIncomeValues.push(result.taxableIncome);
      incomeTaxValues.push(result.incomeTax);
      niContributionsValues.push(result.niContributions);
      studentLoanRepaymentsValues.push(result.studentLoanRepayments);
      highIncomeChildBenefitChargeValues.push(result.highIncomeChildBenefitCharge);
    });
  
    setPlotData([
      { x: grossIncomes, y: grossIncomeValues, type: 'scatter', mode: 'lines', marker: { color: 'blue' }, name: 'Gross Income' },
      { x: grossIncomes, y: personalAllowanceValues, type: 'scatter', mode: 'lines', marker: { color: 'red' }, name: 'Personal Allowance' },
      { x: grossIncomes, y: taxableIncomeValues, type: 'scatter', mode: 'lines', marker: { color: 'green' }, name: 'Taxable Income' },
      { x: grossIncomes, y: incomeTaxValues, type: 'scatter', mode: 'lines', marker: { color: 'orange' }, name: 'Income Tax' },
      { x: grossIncomes, y: niContributionsValues, type: 'scatter', mode: 'lines', marker: { color: 'purple' }, name: 'NI Contributions' },
      { x: grossIncomes, y: studentLoanRepaymentsValues, type: 'scatter', mode: 'lines', marker: { color: 'brown' }, name: 'Student Loan Repayments' },
      { x: grossIncomes, y: highIncomeChildBenefitChargeValues, type: 'scatter', mode: 'lines', marker: { color: 'pink' }, name: 'High Income Child Benefit Charge' },
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
