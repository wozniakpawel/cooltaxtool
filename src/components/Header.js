import React from "react";
import { Navbar, Container, Row } from "react-bootstrap";

const Header = () => {
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
      </Container>
    </Navbar>
  );
};

export default Header;
