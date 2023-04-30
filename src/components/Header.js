import React from "react";
import { Navbar, Container, Form } from "react-bootstrap";

const Header = (props) => {
  return (
    <Navbar>
      <Container className="justify-content-center large">
        <Navbar.Brand>
          <h1>
            <strong>
              Cool<span className="text-danger">Tax</span>Tool
            </strong>
            {/* <button onClick={props.themeToggleFunction}>
              Toggle dark mode
            </button> */}
          </h1>
        </Navbar.Brand>
      </Container>
    </Navbar>
  );
};

export default Header;
