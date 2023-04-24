import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import '../App.css';

const Footer = () => {
    return (
        <footer>
            <Container>
                <Row className="justify-content-center">
                    <Col className="text-center">
                        <p>
                            Cool<span className="text-danger">Tax</span>Tool does not provide financial advice, and the calculations might be innacurate. Please consult a tax advisor before making any financial decisions.
                        </p>
                        <p>
                            This is an open source project, feel free to contribute: {' '}
                            <a href="https://github.com/wozniakpawel/cooltaxtool" target="_blank" rel="noopener noreferrer">
                                https://github.com/wozniakpawel/cooltaxtool
                            </a>
                        </p>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
};

export default Footer;
