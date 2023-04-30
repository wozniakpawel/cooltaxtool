import React from "react";
import { Container, Row, Col, Form } from "react-bootstrap";
import { defaultInputs, UserMenu } from "./components/UserMenu";
import TaxBreakdown from "./components/TaxBreakdown";
import PensionAnalysis from "./components/PensionAnalysis";
import TaxYearOverview from "./components/TaxYearOverview";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [userInputs, setUserInputs] = React.useState(defaultInputs);
  const [theme, setTheme] = React.useState("dark");

  React.useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const handleUserInputsChange = (inputs) => {
    setUserInputs(inputs);
  };

  function toggleTheme() {
    if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }

  // takes plotly theme data as JSON and adds dark theme if necessary
  function setPlotTheme(layout) {
    if (theme === "dark") {
      layout.paper_bgcolor = "#333";
      layout.plot_bgcolor = "#222";
      layout.font = { color: "#fff" };
    }
    return layout;
  }

  return (
    <Container fluid className="d-flex flex-column min-vh-100 p-0">
      <Container className="page-content p-0">
        <Row>
          <Col>
            <Header theme={theme} themeToggleFunction={toggleTheme} />
            <Form.Check
              type="switch"
              id="themeToggle"
              label="Dark mode"
              name="themeToggle"
              checked={theme === "dark"}
              onChange={toggleTheme}
            />
            <UserMenu onUserInputsChange={handleUserInputsChange} />
            {userInputs.incomeAnalysis && (
              <PensionAnalysis inputs={userInputs} plotThemer={setPlotTheme} />
            )}
          </Col>
          <Col>
            {userInputs.incomeAnalysis && (
              <TaxBreakdown inputs={userInputs} theme={theme} />
            )}
            {!userInputs.incomeAnalysis && (
              <TaxYearOverview inputs={userInputs} plotThemer={setPlotTheme} />
            )}
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
