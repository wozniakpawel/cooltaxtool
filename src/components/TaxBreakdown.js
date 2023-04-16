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
                <td style={{ paddingLeft: '2em' }}>{`${(tax.rate * 100).toFixed(0)}%`}</td>
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
                <table>
                    <tbody>
                        <tr>
                            <td>Gross Income</td>
                            <td className="number-cell">{numberWithCommas(results.grossIncome)}</td>
                        </tr>
                        <tr>
                            <td>Adjusted Net Income</td>
                            <td className="number-cell">{numberWithCommas(results.adjustedNetIncome)}</td>
                        </tr>
                        <tr>
                            <td>Personal Allowance</td>
                            <td className="number-cell">{numberWithCommas(results.personalAllowance)}</td>
                        </tr>
                        <tr>
                            <td>Employer NI</td>
                            <td className="number-cell">{numberWithCommas(results.employerNI.total)}</td>
                        </tr>
                        {renderBreakDown(results.employerNI.breakdown)}
                    </tbody>
                </table>

                {/* Deductions table */}
                <table>
                    <thead>
                        <tr>
                            <th style={boldText}>You pay</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Income Tax</td>
                            <td className="number-cell">{numberWithCommas(results.incomeTax.total)}</td>
                        </tr>
                        {renderBreakDown(results.incomeTax.breakdown)}
                        <tr>
                            <td>Employee NI</td>
                            <td className="number-cell">{numberWithCommas(results.employeeNI.total)}</td>
                        </tr>
                        {renderBreakDown(results.employeeNI.breakdown)}
                        <tr>
                            <td>Student Loan</td>
                            <td className="number-cell">{numberWithCommas(results.studentLoanRepayments)}</td>
                        </tr>
                        <tr>
                            <td>Total</td>
                            <td className="number-cell">{numberWithCommas(results.combinedTaxes)}</td>
                        </tr>
                    </tbody>
                </table>

                {/* Final Results table */}
                <table>
                    <thead>
                        <tr>
                        <th style={boldText}>You keep</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Take Home Pay</td>
                            <td className="number-cell">{numberWithCommas(results.takeHomePay)}</td>
                        </tr>
                        <tr>
                            <td>Pension Pot</td>
                            <td className="number-cell">{numberWithCommas(results.pensionPot)}</td>
                        </tr>
                        <tr>
                            <td>Total</td>
                            <td className="number-cell">{numberWithCommas(results.yourMoney)}</td>
                        </tr>
                    </tbody>
                </table>
            </fieldset>
        </div>
    );
};

export default TaxBreakdown;