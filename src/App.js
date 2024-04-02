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
      <Container className="page-content overflow-hidden p-0">
        <Row>
          <Col>
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
          <Col>
            {userInputs.incomeAnalysis && (
              <IncomeAnalysis inputs={userInputs} theme={theme} plotThemer={setPlotTheme} />
            )}
            {!userInputs.incomeAnalysis && (
              <TaxYearOverview inputs={userInputs} plotThemer={setPlotTheme} />
            )}
          </Col>
        </Row>
      </Container>
      <Footer />
    </Container>
  );
}

export default App;
