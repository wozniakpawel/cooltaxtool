import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { calculateTaxes } from '../utils/TaxCalc';

const TaxYearOverview = ({ inputs }) => {
  const [percentagePlotData, setPercentagePlotData] = useState([]);
  const [amountPlotData, setAmountPlotData] = useState([]);

  useEffect(() => {
    const grossIncomes = Array.from({ length: 1000 }, (_, i) => i * 250);

    const taxData = grossIncomes.map((grossIncome) => {
      return calculateTaxes(grossIncome, inputs);
    });

    const percentageData = taxData.map((result, index) => {
      const grossIncome = grossIncomes[index];
      return {
        incomeTax: (result.incomeTax.total / grossIncome) * 100,
        employeeNI: (result.employeeNI.total / grossIncome) * 100,
        employerNI: (result.employerNI.total / grossIncome) * 100,
        studentLoanRepayments: (result.studentLoanRepayments / grossIncome) * 100,
        combinedTaxes: (result.combinedTaxes / grossIncome) * 100,
        takeHomePay: (result.takeHomePay / grossIncome) * 100
      };
    });

    const marginalCombinedTaxes = [];
    for (let i = 1; i < taxData.length; i++) {
      const deltaTaxes = taxData[i].combinedTaxes - taxData[i - 1].combinedTaxes;
      const deltaIncome = grossIncomes[i] - grossIncomes[i - 1];
      marginalCombinedTaxes.push((deltaTaxes / deltaIncome) * 100);
    }

    const percentagePlotData = [
      { x: grossIncomes, y: percentageData.map((data) => data.incomeTax), type: 'scatter', mode: 'lines', marker: { color: 'orange' }, name: 'Income Tax' },
      { x: grossIncomes, y: percentageData.map((data) => data.combinedTaxes), type: 'scatter', mode: 'lines', marker: { color: 'red' }, name: 'Combined taxes (IT, EE NI, SL)' },
      { x: grossIncomes, y: percentageData.map((data) => data.takeHomePay), type: 'scatter', mode: 'lines', marker: { color: 'black' }, name: 'Take Home Pay' },
      { x: grossIncomes.slice(1), y: marginalCombinedTaxes, type: 'scatter', mode: 'lines', marker: { color: 'blue' }, name: 'Marginal Combined Tax Rate' },
    ];

    const amountPlotData = [
      { x: grossIncomes, y: taxData.map((data) => data.incomeTax.total), type: 'scatter', mode: 'lines', marker: { color: 'orange' }, name: 'Income Tax' },
      { x: grossIncomes, y: taxData.map((data) => data.combinedTaxes), type: 'scatter', mode: 'lines', marker: { color: 'red' }, name: 'Combined taxes (IT, EE NI, SL)' },
      { x: grossIncomes, y: taxData.map((data) => data.takeHomePay), type: 'scatter', mode: 'lines', marker: { color: 'black' }, name: 'Take Home Pay' },
    ];

    if (!inputs.noNI) {
      percentagePlotData.push(
        { x: grossIncomes, y: percentageData.map((data) => data.employeeNI), type: 'scatter', mode: 'lines', marker: { color: 'purple' }, name: 'Employee NI Contributions' },
        { x: grossIncomes, y: percentageData.map((data) => data.employerNI), type: 'scatter', mode: 'lines', marker: { color: 'purple' }, name: 'Employer NI Contributions' },
      );
      amountPlotData.push(
        { x: grossIncomes, y: taxData.map((data) => data.employeeNI.total), type: 'scatter', mode: 'lines', marker: { color: 'purple' }, name: 'Employee NI Contributions' },
        { x: grossIncomes, y: taxData.map((data) => data.employerNI.total), type: 'scatter', mode: 'lines', marker: { color: 'purple' }, name: 'Employer NI Contributions' },
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
          title: 'Taxes as a percentage of gross income',
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
