import React from 'react';
import { calculateTaxes } from '../utils/TaxCalc';
import '../App.css';

const TaxBreakdown = ({ inputs }) => {
    const results = calculateTaxes(inputs.grossIncome, inputs);

    function numberWithCommas(x) {
        return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(x);
    }

    function renderBreakDown(breakdown) {
        return breakdown.map((tax, i) => (
            <tr key={`it-${i}`}>
            <td style={{ paddingLeft: '2em' }}>{`${isNaN(tax.rate) ? tax.rate : (tax.rate * 100 + '%')}`}</td>
                <td className="number-cell breakdown-number">{numberWithCommas(tax.amount)}</td>
            </tr>
        ));
    }

    const boldText = { fontWeight: 'bold' };

    return (
        <div>
            <fieldset>
                <legend>Tax breakdown for {numberWithCommas(inputs.grossIncome)}</legend>

                {/* Income table */}
                <table style={{ marginBottom: '20px' }}>
                    <tbody>
                        <tr>
                            <td className="breakdown-description">Gross Income</td>
                            <td className="number-cell">{numberWithCommas(results.grossIncome)}</td>
                        </tr>
                        <tr>
                            <td className="breakdown-description">Adjusted Net Income</td>
                            <td className="number-cell">{numberWithCommas(results.adjustedNetIncome)}</td>
                        </tr>
                        <tr>
                            <td className="breakdown-description">Personal Allowance</td>
                            <td className="number-cell">{numberWithCommas(results.personalAllowance)}</td>
                        </tr>
                        <tr>
                            <td className="breakdown-description">Employer NI</td>
                            <td className="number-cell">{numberWithCommas(results.employerNI.total)}</td>
                        </tr>
                        {renderBreakDown(results.employerNI.breakdown)}
                    </tbody>
                </table>

                {/* Deductions table */}
                <table style={{ marginBottom: '20px' }}>
                    <thead>
                        <tr>
                            <th style={boldText}>You pay</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="breakdown-description">Income Tax</td>
                            <td className="number-cell">{numberWithCommas(results.incomeTax.total)}</td>
                        </tr>
                        {renderBreakDown(results.incomeTax.breakdown)}
                        <tr>
                            <td className="breakdown-description">Employee NI</td>
                            <td className="number-cell">{numberWithCommas(results.employeeNI.total)}</td>
                        </tr>
                        {renderBreakDown(results.employeeNI.breakdown)}
                        <tr>
                            <td className="breakdown-description">Student Loan</td>
                            <td className="number-cell">{numberWithCommas(results.studentLoanRepayments)}</td>
                        </tr>
                        <tr>
                            <td className="breakdown-description">Total</td>
                            <td className="number-cell">{numberWithCommas(results.combinedTaxes)}</td>
                        </tr>
                    </tbody>
                </table>

                {/* Final Results table */}
                <table style={{ marginBottom: '20px' }}>
                    <thead>
                        <tr>
                            <th style={boldText}>You keep</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="breakdown-description">Take Home Pay</td>
                            <td className="number-cell">{numberWithCommas(results.takeHomePay)}</td>
                        </tr>
                        <tr>
                            <td className="breakdown-description">Pension Pot</td>
                            <td className="number-cell">{numberWithCommas(results.pensionPot.total)}</td>
                        </tr>
                        {renderBreakDown(results.pensionPot.breakdown)}
                        <tr>
                            <td className="breakdown-description">Total</td>
                            <td className="number-cell">{numberWithCommas(results.yourMoney)}</td>
                        </tr>
                    </tbody>
                </table>
            </fieldset>
        </div>
    );
};

export default TaxBreakdown;