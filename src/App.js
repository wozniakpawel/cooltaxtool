import React from "react";
import { Container, Row, Col, Form } from "react-bootstrap";
import { defaultInputs, UserMenu } from "./components/UserMenu";
import TaxYearOverview from "./components/TaxYearOverview";
import IncomeAnalysis from "./components/IncomeAnalysis";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [userInputs, setUserInputs] = React.useState(defaultInputs);
  const [theme, setTheme] = React.useState((window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? "dark" : "light");

  React.useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  function toggleTheme() {
    if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }

  return (
    <Container fluid className="d-flex flex-column min-vh-100 p-0">
      <Container className="page-content p-0">
        <Row>
          <Col xs={12} lg={6}>
            <Header theme={theme} themeToggleFunction={toggleTheme} />
            <Container>
              <Form.Check
                type="switch"
                id="themeToggle"
                label="Dark mode"
                name="themeToggle"
                checked={theme === "dark"}
                onChange={toggleTheme}
              />
            </Container>
            <UserMenu onUserInputsChange={setUserInputs} />
          </Col>
          <Col xs={12} lg={6}>
            {userInputs.incomeAnalysis && (
              <IncomeAnalysis inputs={userInputs} theme={theme} />
            )}
            {!userInputs.incomeAnalysis && (
              <TaxYearOverview inputs={userInputs} theme={theme} />
            )}
          </Col>
        </Row>
      </Container>
      <Footer />
    </Container>
  );
}

export default App;
