import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { calculateTaxes } from '../utils/TaxCalc';

const TaxYearOverview = ({ inputs }) => {
  const [percentagePlotData, setPercentagePlotData] = useState([]);
  const [amountPlotData, setAmountPlotData] = useState([]);

  useEffect(() => {
    const grossIncomes = Array.from({ length: 1000 }, (_, i) => i * 250);

    const taxData = grossIncomes.map((grossIncome) => {
      const { incomeTax, employeeNI, employerNI, ...rest } = calculateTaxes(grossIncome, inputs);
      return {
        incomeTax: incomeTax.total,
        employeeNI: employeeNI.total,
        employerNI: employerNI.total,
        ...rest
      };
    });
    
    const percentageData = taxData.map((result, index) => {
      const grossIncome = grossIncomes[index];
      return {
        adjustedNetIncome: (result.adjustedNetIncome / grossIncome) * 100,
        personalAllowance: (result.personalAllowance / grossIncome) * 100,
        taxableIncome: (result.taxableIncome / grossIncome) * 100,
        incomeTax: (result.incomeTax / grossIncome) * 100,
        employeeNI: (result.employeeNI / grossIncome) * 100,
        employerNI: (result.employerNI / grossIncome) * 100,
        studentLoanRepayments: (result.studentLoanRepayments / grossIncome) * 100,
        combinedTaxes: (result.combinedTaxes / grossIncome) * 100,
        takeHomePay: (result.takeHomePay / grossIncome) * 100,
        pensionPot: Math.min(100, (result.pensionPot / grossIncome) * 100),
        yourMoney: Math.min(100, (result.yourMoney / grossIncome) * 100),
      };
    });

    const marginalCombinedTaxes = [];
    for (let i = 1; i < taxData.length; i++) {
      const deltaTaxes = taxData[i].combinedTaxes - taxData[i - 1].combinedTaxes;
      const deltaIncome = grossIncomes[i] - grossIncomes[i - 1];
      marginalCombinedTaxes.push((deltaTaxes / deltaIncome) * 100);
    }

    const percentagePlotData = [
      { x: grossIncomes, y: percentageData.map((data) => data.adjustedNetIncome), type: 'scatter', mode: 'lines', marker: { color: 'yellow' }, name: 'Adjusted Net Income' },
      { x: grossIncomes, y: percentageData.map((data) => data.taxableIncome), type: 'scatter', mode: 'lines', marker: { color: 'pink' }, name: 'Taxable Income' },
      { x: grossIncomes, y: percentageData.map((data) => data.incomeTax), type: 'scatter', mode: 'lines', marker: { color: 'orange' }, name: 'Income Tax' },
      { x: grossIncomes, y: percentageData.map((data) => data.combinedTaxes), type: 'scatter', mode: 'lines', marker: { color: 'red' }, name: 'Combined taxes (IT, EE NI, SL)' },
      { x: grossIncomes, y: percentageData.map((data) => data.takeHomePay), type: 'scatter', mode: 'lines', marker: { color: 'black' }, name: 'Take Home Pay' },
      { x: grossIncomes, y: percentageData.map((data) => data.pensionPot), type: 'scatter', mode: 'lines', marker: { color: 'purple' }, name: 'Pension Pot' },
      { x: grossIncomes, y: percentageData.map((data) => data.yourMoney), type: 'scatter', mode: 'lines', marker: { color: 'magenta' }, name: 'Your money (Pension Pot + Take Home)' },
      { x: grossIncomes.slice(1), y: marginalCombinedTaxes, type: 'scatter', mode: 'lines', line: { dash: 'dash', color: 'blue' }, name: 'Marginal Combined Tax Rate' },
    ];
    
    const amountPlotData = [
      { x: grossIncomes, y: taxData.map((data) => data.adjustedNetIncome), type: 'scatter', mode: 'lines', marker: { color: 'yellow' }, name: 'Adjusted Net Income' },
      { x: grossIncomes, y: taxData.map((data) => data.personalAllowance), type: 'scatter', mode: 'lines', marker: { color: 'grey' }, name: 'Personal Allowance' },
      { x: grossIncomes, y: taxData.map((data) => data.taxableIncome), type: 'scatter', mode: 'lines', marker: { color: 'pink' }, name: 'Taxable Income' },
      { x: grossIncomes, y: taxData.map((data) => data.incomeTax), type: 'scatter', mode: 'lines', marker: { color: 'orange' }, name: 'Income Tax' },
      { x: grossIncomes, y: taxData.map((data) => data.combinedTaxes), type: 'scatter', mode: 'lines', marker: { color: 'red' }, name: 'Combined taxes (IT, EE NI, SL)' },
      { x: grossIncomes, y: taxData.map((data) => data.takeHomePay), type: 'scatter', mode: 'lines', marker: { color: 'black' }, name: 'Take Home Pay' },
      { x: grossIncomes, y: taxData.map((data) => data.pensionPot), type: 'scatter', mode: 'lines', marker: { color: 'purple' }, name: 'Pension Pot' },
      { x: grossIncomes, y: taxData.map((data) => data.yourMoney), type: 'scatter', mode: 'lines', marker: { color: 'magenta' }, name: 'Your money (Pension Pot + Take Home)' },
    ];

    if (!inputs.noNI) {
      percentagePlotData.push(
        { x: grossIncomes, y: percentageData.map((data) => data.employeeNI), type: 'scatter', mode: 'lines', marker: { color: 'violet' }, name: 'Employee NI Contributions' },
        { x: grossIncomes, y: percentageData.map((data) => data.employerNI), type: 'scatter', mode: 'lines', marker: { color: 'purple' }, name: 'Employer NI Contributions' },
      );
      amountPlotData.push(
        { x: grossIncomes, y: taxData.map((data) => data.employeeNI), type: 'scatter', mode: 'lines', marker: { color: 'violet' }, name: 'Employee NI Contributions' },
        { x: grossIncomes, y: taxData.map((data) => data.employerNI), type: 'scatter', mode: 'lines', marker: { color: 'purple' }, name: 'Employer NI Contributions' },
      );
    }

    if (inputs.studentLoan !== 'none') {
      percentagePlotData.push(
        { x: grossIncomes, y: percentageData.map((data) => data.studentLoanRepayments), type: 'scatter', mode: 'lines', marker: { color: 'brown' }, name: 'Student Loan Repayments' },
      );
      amountPlotData.push(
        { x: grossIncomes, y: taxData.map((data) => data.studentLoanRepayments), type: 'scatter', mode: 'lines', marker: { color: 'brown' }, name: 'Student Loan Repayments' },
      );
    }

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
