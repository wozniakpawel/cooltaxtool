import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import '../App.css';

const Footer = () => {
    return (
        <footer>
            <Container className='mt-5'>
                <Row className="justify-content-center">
                    <Col className="text-center">
                        <p>
                            <span className="text-primary">Cool</span>
                            <span className="text-danger">Tax</span>
                            <span className="text-primary">Tool </span>
                            does not provide financial or tax advice, and the calculations might be inaccurate. Please consult a tax advisor before making any financial decisions.
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
