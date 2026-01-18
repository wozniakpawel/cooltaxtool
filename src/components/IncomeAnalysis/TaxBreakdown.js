import React from "react";
import { calculateTaxes } from "../../utils/TaxCalc";
import { Table, Card } from "react-bootstrap";
import { numberWithCommas } from "../../utils/DisplayFormat";

const TaxBreakdown = (props) => {
  const results = calculateTaxes(props.inputs);

  function renderSingleValue(name, value) {
    return (
      <tr>
        <td>{name}</td>
        <td className="text-end">
          {numberWithCommas(value)}
        </td>
      </tr>
    )
  }

  function renderBreakDown(name, value) {
    return (
      <>
        {renderSingleValue(name, value.total)}
        {value.breakdown.map((tax, i) => (
          <tr key={`it-${i}`}>
            <td className="small" style={{ paddingLeft: "2em" }}>{`${isNaN(tax.rate) ? tax.rate : (tax.rate * 100).toFixed(2) + "%"
              }`}</td>
            <td className="text-end small" style={{ paddingRight: "2em" }}>{numberWithCommas(tax.amount)}</td>
          </tr>
        ))}
      </>
    );
  }

  return (
    <Card>
      <Card.Body>
        <Card.Title>
          Tax breakdown
        </Card.Title>

        <Table size="sm">
          <tbody>
            {renderBreakDown("Gross Earnings", results.grossEarnings)}
            {renderSingleValue("Adjusted Net Income", results.adjustedNetIncome)}
            {renderBreakDown("Tax Allowance", results.taxAllowance)}
            {renderBreakDown("Employer NI", results.employerNI)}
          </tbody>
        </Table>

        <Table size="sm" variant="danger" style={{ color: "#000" }}>
          <thead>
            <tr>
              <th>Total you pay</th>
              <td style={{ fontWeight: "bold" }} className="text-end">
                {numberWithCommas(results.combinedTaxes)}
              </td>
            </tr>
          </thead>
          <tbody>
            {renderBreakDown("Income Tax", results.incomeTax)}
            {renderBreakDown("Employee NI", results.employeeNI)}
            {renderBreakDown("Student Loan", results.studentLoanRepayments)}
          </tbody>
        </Table>

        <Table size="sm" variant="success" style={{ color: "#000" }}>
          <thead>
            <tr>
              <th>Total you keep</th>
              <td style={{ fontWeight: "bold" }} className="text-end">
                {numberWithCommas(results.yourMoney)}
              </td>
            </tr>
          </thead>
          <tbody>
            {renderSingleValue("Take Home Pay", results.takeHomePay)}
            {renderBreakDown("Pension Pot", results.pensionPot)}
            {renderBreakDown("Child Benefits", results.childBenefits)}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

export default TaxBreakdown;
