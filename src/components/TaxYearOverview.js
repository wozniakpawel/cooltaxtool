import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { calculateTaxes } from '../utils/TaxCalc';

const plotSettings = [
  { key: 'adjustedNetIncome', color: '#f1c40f', label: 'Adjusted Net Income' },
  { key: 'personalAllowance', color: '#95a5a6', label: 'Personal Allowance' },
  { key: 'taxableIncome', color: '#e74c3c', label: 'Taxable Income' },
  { key: 'incomeTax', color: '#e67e22', label: 'Income Tax' },
  { key: 'employeeNI', color: '#9b59b6', label: 'Employee NI Contributions' },
  { key: 'employerNI', color: '#8e44ad', label: 'Employer NI Contributions' },
  { key: 'studentLoanRepayments', color: '#34495e', label: 'Student Loan Repayments' },
  { key: 'combinedTaxes', color: '#c0392b', label: 'Combined taxes (IT, EE NI, SL)' },
  { key: 'takeHomePay', color: '#27ae60', label: 'Take Home Pay' },
  { key: 'pensionPot', color: '#2980b9', label: 'Pension Pot' },
  { key: 'yourMoney', color: '#3498db', label: 'Your money (Pension Pot + Take Home)' },
  { key: 'marginalCombinedTaxRate', color: '#2c3e50', label: 'Marginal Combined Tax Rate', dashed: true },
];

const TaxYearOverview = ({ inputs }) => {
  const [percentagePlotData, setPercentagePlotData] = useState([]);
  const [amountPlotData, setAmountPlotData] = useState([]);

  useEffect(() => {
    const grossIncomes = Array.from({ length: 1000 }, (_, i) => i * 250);

    const taxData = grossIncomes.map((grossIncome) => {
      const { incomeTax, employeeNI, employerNI, pensionPot, ...rest } = calculateTaxes(grossIncome, inputs);
      return {
        incomeTax: incomeTax.total,
        employeeNI: employeeNI.total,
        employerNI: employerNI.total,
        pensionPot: pensionPot.total,
        ...rest
      };
    });

    const marginalCombinedTaxes = [];
    for (let i = 1; i < taxData.length; i++) {
      const deltaTaxes = taxData[i].combinedTaxes - taxData[i - 1].combinedTaxes;
      const deltaIncome = grossIncomes[i] - grossIncomes[i - 1];
      marginalCombinedTaxes.push((deltaTaxes / deltaIncome) * 100);
    }

    const createPlotData = (grossIncomes, dataArray, isPercentage = false) => {
      return plotSettings.map((setting) => {
        if (
          (setting.key === 'employeeNI' || setting.key === 'employerNI') && inputs.noNI ||
          (setting.key === 'studentLoanRepayments' && inputs.studentLoan === 'none') ||
          (setting.key === 'personalAllowance' && isPercentage) ||
          (setting.key === 'marginalCombinedTaxRate' && !isPercentage)
        ) {
          return null;
        }
        if (setting.key === 'marginalCombinedTaxRate' && isPercentage) {
          return {
            x: grossIncomes.slice(1),
            y: marginalCombinedTaxes,
            type: 'scatter',
            mode: 'lines',
            line: { dash: setting.dashed ? 'dash' : null, color: setting.color },
            name: setting.label,
          };
        }
        return {
          x: grossIncomes,
          y: dataArray.map((data) => {
            const value = isPercentage ? (data[setting.key] / data['grossIncome']) * 100 : data[setting.key];
            return isPercentage ? Math.min(100, value) : value;
          }),
          type: 'scatter',
          mode: 'lines',
          marker: { color: setting.color },
          name: setting.label,
        };
      }).filter((data) => data !== null);
    };

    const amountPlotData = createPlotData(grossIncomes, taxData);
    const percentagePlotData = createPlotData(grossIncomes, taxData, true);

    setPercentagePlotData(percentagePlotData);
    setAmountPlotData(amountPlotData);
  }, [inputs]);

  return (
    <div className="TaxYearOverview">
      <Plot
        data={percentagePlotData}
        layout={{
          title: 'Percentages of gross income',
          hovermode: 'x',
          xaxis: { title: 'Annual Gross Income (£)' },
          yaxis: { title: 'Percentage of Income (%)' },
        }}
      />

      <Plot
        data={amountPlotData}
        layout={{
          title: 'Annual total amounts',
          hovermode: 'x',
          xaxis: { title: 'Annual Gross Income (£)' },
          yaxis: { title: 'Annual Total Amount (£)' },
        }}
      />

    </div>
  );
};

export default TaxYearOverview;
