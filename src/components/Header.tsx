import { Navbar, Container, Row, Form } from "react-bootstrap";

interface HeaderProps {
  theme: string;
  toggleTheme: () => void;
}

const Header = ({ theme, toggleTheme }: HeaderProps) => {
  return (
    <Navbar>
      <Container className="justify-content-center large">
        <Navbar.Brand>
          <Row>
            <h1>
              <strong>
                <span className="text-primary">Cool</span>
                <span className="text-danger">Tax</span>
                <span className="text-primary">Tool</span>
              </strong>
            </h1>
          </Row>
          <Row className="text-primary">
            UK Tax Calculator & Visualiser
          </Row>
        </Navbar.Brand>
        <Form.Check
          type="switch"
          id="themeToggle"
          label="Dark mode"
          checked={theme === "dark"}
          onChange={toggleTheme}
        />
      </Container>
    </Navbar>
  );
};

export default Header;
