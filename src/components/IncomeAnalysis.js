import { Container } from "react-bootstrap";
import PensionAnalysis from "./IncomeAnalysis/PensionAnalysis";
import TaxBreakdown from "./IncomeAnalysis/TaxBreakdown";

const IncomeAnalysis = (props) => {
    return (
        <Container fluid>
            <PensionAnalysis {...props} />
            <TaxBreakdown {...props} />
        </Container>
    );
};

export default IncomeAnalysis;
