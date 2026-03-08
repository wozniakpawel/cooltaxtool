import type { ReactNode } from "react";
import { useMemo } from "react";
import { calculateTaxes } from "../../utils/TaxCalc";
import { Table, Card } from "react-bootstrap";
import { formatCurrencyPrecise } from "../../utils/chartUtils";
import type { TaxInputs, CalculationResult } from "../../types/tax";
import InfoPopover from '../InfoPopover';
import explanations from '../../utils/explanations';

interface TaxBreakdownProps {
  inputs: TaxInputs;
}

const TaxBreakdown = (props: TaxBreakdownProps) => {
  const results = useMemo(() => calculateTaxes(props.inputs), [props.inputs]);

  function renderSingleValue(name: ReactNode, value: number) {
    return (
      <tr>
        <td>{name}</td>
        <td className="text-end">
          {formatCurrencyPrecise(value)}
        </td>
      </tr>
    )
  }

  function renderBreakDown(name: ReactNode, value: CalculationResult) {
    return (
      <>
        {renderSingleValue(name, value.total)}
        {value.breakdown.map((tax, i) => (
          <tr key={`it-${i}`}>
            <td className="small" style={{ paddingLeft: "2em" }}>{`${typeof tax.rate === 'string' ? tax.rate : (tax.rate * 100).toFixed(2) + "%"
              }`}</td>
            <td className="text-end small" style={{ paddingRight: "2em" }}>{formatCurrencyPrecise(tax.amount)}</td>
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
            {renderBreakDown(<>Annual Gross Income <InfoPopover {...explanations.result_annualGrossIncome} /></>, results.annualGrossIncome)}
            {renderSingleValue(<>Adjusted Net Income <InfoPopover {...explanations.result_adjustedNetIncome} /></>, results.adjustedNetIncome)}
            {renderBreakDown(<>Tax Allowance <InfoPopover {...explanations.result_taxAllowance} /></>, results.taxAllowance)}
            {renderBreakDown(<>Employer NI <InfoPopover {...explanations.result_employerNI} /></>, results.employerNI)}
          </tbody>
        </Table>

        <Table size="sm" variant="danger" style={{ color: "#000" }}>
          <thead>
            <tr>
              <th>Total you pay <InfoPopover {...explanations.result_combinedTaxes} /></th>
              <td style={{ fontWeight: "bold" }} className="text-end">
                {formatCurrencyPrecise(results.combinedTaxes)}
              </td>
            </tr>
          </thead>
          <tbody>
            {renderBreakDown(<>Income Tax <InfoPopover {...explanations.result_incomeTax} /></>, results.incomeTax)}
            {renderBreakDown(<>Employee NI <InfoPopover {...explanations.result_employeeNI} /></>, results.employeeNI)}
            {renderBreakDown(<>Student Loan <InfoPopover {...explanations.result_studentLoan} /></>, results.studentLoanRepayments)}
          </tbody>
        </Table>

        <Table size="sm" variant="success" style={{ color: "#000" }}>
          <thead>
            <tr>
              <th>Total you keep <InfoPopover {...explanations.result_yourMoney} /></th>
              <td style={{ fontWeight: "bold" }} className="text-end">
                {formatCurrencyPrecise(results.yourMoney)}
              </td>
            </tr>
          </thead>
          <tbody>
            {renderSingleValue(<>Take Home Pay <InfoPopover {...explanations.result_takeHomePay} /></>, results.takeHomePay)}
            {renderBreakDown(<>Pension Pot <InfoPopover {...explanations.result_pensionPot} /></>, results.pensionPot)}
            {renderBreakDown(<>Child Benefits <InfoPopover {...explanations.result_childBenefits} /></>, results.childBenefits)}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

export default TaxBreakdown;
