import { Container } from "react-bootstrap";
import PensionAnalysis from "./IncomeAnalysis/PensionAnalysis";
import TaxBreakdown from "./IncomeAnalysis/TaxBreakdown";
import type { TaxInputs } from "../types/tax";

interface IncomeAnalysisProps {
  inputs: TaxInputs;
  theme: string;
}

const IncomeAnalysis = (props: IncomeAnalysisProps) => {
    return (
        <Container>
            <PensionAnalysis {...props} />
            <TaxBreakdown {...props} />
        </Container>
    );
};

export default IncomeAnalysis;
