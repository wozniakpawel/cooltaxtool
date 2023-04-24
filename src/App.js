import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { defaultInputs, UserMenu } from './components/UserMenu';
import TaxBreakdown from './components/TaxBreakdown';
import PensionAnalysis from './components/PensionAnalysis';
import TaxYearOverview from './components/TaxYearOverview';
import Header from './components/Header';
import Footer from './components/Footer';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [userInputs, setUserInputs] = React.useState(defaultInputs);

  const handleUserInputsChange = (inputs) => {
    setUserInputs(inputs);
  };

  return (
    <Container fluid>
      <Container fluid>
        <Row>
          <Col>
            <Header />
            <UserMenu onUserInputsChange={handleUserInputsChange} />
            {
              userInputs.incomeAnalysis &&
              <PensionAnalysis inputs={userInputs} />
            }
          </Col>
          <Col>
            {
              userInputs.incomeAnalysis &&
              <TaxBreakdown inputs={userInputs} />
            }
            {
              !userInputs.incomeAnalysis &&
              <TaxYearOverview inputs={userInputs} />
            }
          </Col>
          {/* <Col>
          </Col> */}
        </Row>
      </Container>
      <Footer />
    </Container>
  );
}

export default App;
