import React from "react";
import { Navbar, Container } from "react-bootstrap";

const Header = (props) => {
  return (
    <Navbar>
      <Container className="justify-content-center large">
        <Navbar.Brand>
          <h1>
            <strong>
            <span className="text-primary">Cool</span>
            <span className="text-danger">Tax</span>
            <span className="text-primary">Tool</span>
            </strong>
          </h1>
        </Navbar.Brand>
      </Container>
    </Navbar>
  );
};

export default Header;
