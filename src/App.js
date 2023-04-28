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
    <Container fluid className="d-flex flex-column min-vh-100 p-0">
      <Header />
      <Container className="page-content p-0">
        <Row>
          <Col lg={6}>
            <UserMenu onUserInputsChange={handleUserInputsChange} />
            { userInputs.incomeAnalysis &&
              <PensionAnalysis inputs={userInputs} />
            }
          </Col>
          <Col lg={6}>
            {
              userInputs.incomeAnalysis
              ? <TaxBreakdown inputs={userInputs} />
              : <TaxYearOverview inputs={userInputs} />
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
