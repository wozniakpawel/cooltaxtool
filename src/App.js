import { useState, useEffect } from "react";
import { Container, Row, Col, Form } from "react-bootstrap";
import { defaultInputs, UserMenu } from "./components/UserMenu";
import TaxYearOverview from "./components/TaxYearOverview";
import IncomeAnalysis from "./components/IncomeAnalysis";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "bootstrap/dist/css/bootstrap.min.css";

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    return savedTheme;
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

function App() {
  const [userInputs, setUserInputs] = useState(defaultInputs);
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme(theme === "light" ? "dark" : "light");
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
