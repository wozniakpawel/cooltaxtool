import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Form, Alert, Button, ButtonGroup } from 'react-bootstrap';
import { numberWithCommas } from '../utils/DisplayFormat';
import PensionForm from './PensionForm.js';

export const defaultInputs = {
    taxYear: '2023/24',
    studentLoan: 'none',
    grossIncome: 0,
    salaryRange: 200000,
    residentInScotland: false,
    noNI: false,
    pensionContributions: {
        autoEnrolment: 0,
        salarySacrifice: 0,
        personal: 0,
    },
    autoEnrolmentAsSalarySacrifice: true,
    taxReliefAtSource: true,
    incomeAnalysis: false,
};

export function UserMenu({ onUserInputsChange }) {
    const [inputs, setInputs] = useState(defaultInputs);

    useEffect(() => {
        onUserInputsChange(inputs);
    }, [inputs, onUserInputsChange]);

    const handleInputChange = (event) => {
        const { name, value, type, checked } = event.target;
        let input = type === 'checkbox' ? checked : value;

        // Convert pension input value and range input to a number
        if (name.startsWith('pensionContributions') || name === 'grossIncome' || name === 'salaryRange') {
            input = parseInt(value);
        }

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setInputs((prevState) => ({
                ...prevState,
                [parent]: { ...prevState[parent], [child]: input },
            }));
        } else {
            setInputs((prevState) => ({ ...prevState, [name]: input }));
        }
    };

    return (
        <div className="UserInputs">
            <Container>
                <Form>
                    <Row>
                        <Form.Group as={Col} sm={6} controlId="taxYear" className="mb-2">
                            <Form.Label>Tax Year</Form.Label>
                            <Form.Control as="select" name="taxYear" value={inputs.taxYear} onChange={handleInputChange}>
                                <option value="2023/24">2023/24</option>
                                <option value="2022/23">2022/23</option>
                                <option value="2021/22">2021/22</option>
                                <option value="2020/21">2020/21</option>
                                <option value="2019/20">2019/20</option>
                                <option value="2018/19">2018/19</option>
                                <option value="2017/18">2017/18</option>
                            </Form.Control>
                        {
                            (inputs.taxYear === '2022/23') &&
                            <Alert key="warning" variant="warning">
                                Warning: NI calculations for the 2022/23 tax year might not be accurate due to the varying rates and thresholds. Effective rates and thresholds are being used to estimate the Employer and Employee NI contributions.
                            </Alert>
                        }
                        </Form.Group>
                        <Form.Group as={Col} sm={6} controlId="studentLoan" className="mb-2">
                            <Form.Label>Student Loan</Form.Label>
                            <Form.Control as="select" name="studentLoan" value={inputs.studentLoan} onChange={handleInputChange}>
                                <option value="none">No Student Loan</option>
                                <option value="plan1">Plan 1</option>
                                <option value="plan2">Plan 2</option>
                                <option value="plan4">Plan 4</option>
                                <option value="plan5">Plan 5</option>
                                <option value="postgrad">Postgraduate</option>
                            </Form.Control>
                        </Form.Group>
                    </Row>
                    <Form.Group className="mt-4 mb-4">
                        <Row>
                            <Col sm={6}>
                                <Form.Check
                                    type="switch"
                                    id="residentInScotland"
                                    label="Resident in Scotland"
                                    name="residentInScotland"
                                    checked={inputs.residentInScotland}
                                    onChange={handleInputChange}
                                />
                            </Col>
                            <Col sm={6}>
                                <Form.Check
                                    type="switch"
                                    id="noNI"
                                    label="Exclude NI"
                                    name="noNI"
                                    checked={inputs.noNI}
                                    onChange={handleInputChange}
                                />
                            </Col>
                        </Row>
                    </Form.Group>
                    <PensionForm inputs={inputs} handleInputChange={handleInputChange}/>
                    <Card>
                        <Card.Body>
                            <ButtonGroup className="mb-2">
                                <Button
                                    variant={!inputs.incomeAnalysis ? 'primary' : 'outline-primary'}
                                    onClick={() => handleInputChange({
                                        target: { name: 'incomeAnalysis', type: 'checkbox', checked: !inputs.incomeAnalysis }
                                    })}
                                >
                                    Tax Year Overview
                                </Button>
                                <Button
                                    variant={inputs.incomeAnalysis ? 'primary' : 'outline-primary'}
                                    onClick={() => handleInputChange({
                                        target: { name: 'incomeAnalysis', type: 'checkbox', checked: !inputs.incomeAnalysis }
                                    })}
                                >
                                    Income analysis
                                </Button>
                            </ButtonGroup>
                            { inputs.incomeAnalysis &&
                                <Row>
                                <Form.Group as={Col} sm={6} controlId="grossIncome">
                                    <Form.Label>Annual Gross Income (£)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="grossIncome"
                                        value={inputs.grossIncome}
                                        onChange={handleInputChange}
                                        min={0}
                                        step={1000}
                                    />
                                </Form.Group>
                                <Col></Col>
                                </Row>
                            }
                            {!inputs.incomeAnalysis &&
                                <Form.Group controlId="grossIncome">
                                    <Form.Label>Salary range: {numberWithCommas(inputs.salaryRange)}</Form.Label>
                                    <Form.Range
                                        name="salaryRange"
                                        value={inputs.salaryRange}
                                        min={50000}
                                        max={1000000}
                                        step={50000}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                            }
                        </Card.Body>
                    </Card>

                    <iframe src="https://github.com/sponsors/wozniakpawel/button" title="Sponsor wozniakpawel" height="32" width="114" style={{ marginTop: '1rem', border: '0', borderRadius: "6px" }}></iframe>

                </Form>
            </Container>
        </div>
    );
};
