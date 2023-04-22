import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { defaultInputs, UserMenu } from './components/UserMenu';
import TaxBreakdown from './components/TaxBreakdown';
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
    <Container>
      <Container>
        <Row>
          <Col>
            <Header />
            <UserMenu onUserInputsChange={handleUserInputsChange} />
            <TaxBreakdown inputs={userInputs} />
          </Col>
          <Col>
            <TaxYearOverview inputs={userInputs} />
            <TaxYearOverview inputs={userInputs} />
          </Col>
        </Row>
      </Container>
      <Footer />
    </Container>
  );
}

export default App;
