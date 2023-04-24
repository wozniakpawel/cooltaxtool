import React from 'react';
import { calculateTaxes } from '../utils/TaxCalc';
import { Container, Table, Card } from 'react-bootstrap';

const TaxBreakdown = ({ inputs }) => {
    const results = calculateTaxes(inputs.grossIncome, inputs);

    function numberWithCommas(x) {
        return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(x);
    }

    function renderBreakDown(breakdown) {
        return breakdown.map((tax, i) => (
            <tr key={`it-${i}`}>
                <td className="small" style={{ paddingLeft: '2em' }}>{`${isNaN(tax.rate) ? tax.rate : ((tax.rate * 100).toFixed(2) + '%')}`}</td>
                <td className="text-end small">{numberWithCommas(tax.amount)}</td>
            </tr>
        ));
    }

    return (
        <Container>
            <Card>
                <Card.Body>
                    <Card.Title>Tax breakdown for {numberWithCommas(inputs.grossIncome)}</Card.Title>

                    <Table size="sm">
                        <tbody>
                            <tr>
                                <td>Gross Income</td>
                                <td className="text-end">{numberWithCommas(results.grossIncome)}</td>
                            </tr>
                            <tr>
                                <td>Adjusted Net Income</td>
                                <td className="text-end">{numberWithCommas(results.adjustedNetIncome)}</td>
                            </tr>
                            <tr>
                                <td>Personal Allowance</td>
                                <td className="text-end">{numberWithCommas(results.personalAllowance)}</td>
                            </tr>
                            <tr>
                                <td>Employer NI</td>
                                <td className="text-end">{numberWithCommas(results.employerNI.total)}</td>
                            </tr>
                            {renderBreakDown(results.employerNI.breakdown)}
                        </tbody>
                    </Table>

                    <Table size="sm" variant="danger">
                        <thead>
                            <tr>
                                <th>You pay</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Income Tax</td>
                                <td className="text-end">{numberWithCommas(results.incomeTax.total)}</td>
                            </tr>
                            {renderBreakDown(results.incomeTax.breakdown)}
                            <tr>
                                <td>Employee NI</td>
                                <td className="text-end">{numberWithCommas(results.employeeNI.total)}</td>
                            </tr>
                            {renderBreakDown(results.employeeNI.breakdown)}
                            <tr>
                                <td>Student Loan</td>
                                <td className="text-end">{numberWithCommas(results.studentLoanRepayments)}</td>
                            </tr>
                            <tr>
                                <td>Total</td>
                                <td className="text-end">{numberWithCommas(results.combinedTaxes)}</td>
                            </tr>
                        </tbody>
                    </Table>

                    <Table size="sm" variant="success">
                        <thead>
                            <tr>
                                <th>You keep</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Take Home Pay</td>
                                <td className="text-end">{numberWithCommas(results.takeHomePay)}</td>
                            </tr>
                            <tr>
                                <td>Pension Pot</td>
                                <td className="text-end">{numberWithCommas(results.pensionPot.total)}</td>
                            </tr>
                            {renderBreakDown(results.pensionPot.breakdown)}
                            <tr>
                                <td>Total</td>
                                <td className="text-end">{numberWithCommas(results.yourMoney)}</td>
                            </tr>
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default TaxBreakdown;
