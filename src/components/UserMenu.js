import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Form, Alert } from 'react-bootstrap';

export const defaultInputs = {
    taxYear: '2023/24',
    studentLoan: 'none',
    grossIncome: 0,
    residentInScotland: false,
    noNI: false,
    pensionContributions: {
        autoEnrolment: 0,
        salarySacrifice: 0,
        personal: 0,
    },
    autoEnrolmentAsSalarySacrifice: true,
    taxReliefAtSource: true,
};

export function UserMenu({ onUserInputsChange }) {
    const [inputs, setInputs] = useState(defaultInputs);

    useEffect(() => {
        onUserInputsChange(inputs);
    }, [inputs, onUserInputsChange]);

    const handleInputChange = (event) => {
        const { name, value, type, checked } = event.target;
        let input = type === 'checkbox' ? checked : value;

        // Convert pension input value to a number
        if (name.startsWith('pensionContributions') || name === 'grossIncome') {
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

                    <Form.Group as={Row} controlId="taxYear">
                        <Form.Label column>Tax Year</Form.Label>
                        <Col>
                            <Form.Control as="select" name="taxYear" value={inputs.taxYear} onChange={handleInputChange}>
                                <option value="2023/24">2023/24</option>
                                <option value="2022/23">2022/23</option>
                                <option value="2021/22">2021/22</option>
                                <option value="2020/21">2020/21</option>
                                <option value="2019/20">2019/20</option>
                                <option value="2018/19">2018/19</option>
                                <option value="2017/18">2017/18</option>
                            </Form.Control>
                        </Col>
                        {
                            (inputs.taxYear === '2022/23') &&
                            <Alert key="warning" variant="warning">
                                Warning: NI calculations for the 2022/23 tax year might not be accurate due to the varying rates and thresholds. Effective rates and thresholds are being used to estimate the Employer and Employee NI contributions.
                            </Alert>
                        }
                    </Form.Group>

                    <Form.Group as={Row} controlId="studentLoan">
                        <Form.Label column>Student Loan</Form.Label>
                        <Col>
                            <Form.Control as="select" name="studentLoan" value={inputs.studentLoan} onChange={handleInputChange}>
                                <option value="none">No Student Loan</option>
                                <option value="plan1">Plan 1</option>
                                <option value="plan2">Plan 2</option>
                                <option value="plan4">Plan 4</option>
                                <option value="plan5">Plan 5</option>
                                <option value="postgrad">Postgraduate</option>
                            </Form.Control>
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} controlId="grossIncome">
                        <Form.Label column>Annual Gross Income (£)</Form.Label>
                        <Col>
                            <Form.Control
                                type="number"
                                name="grossIncome"
                                value={inputs.grossIncome}
                                onChange={handleInputChange}
                                min={0}
                                step={1000}
                            />
                        </Col>
                    </Form.Group>

                    <Form.Group>
                        <Form.Check
                            type="switch"
                            id="residentInScotland"
                            label="Resident in Scotland"
                            name="residentInScotland"
                            checked={inputs.residentInScotland}
                            onChange={handleInputChange}
                        />
                        <Form.Check
                            type="switch"
                            id="noNI"
                            label="Exclude NI"
                            name="noNI"
                            checked={inputs.noNI}
                            onChange={handleInputChange}
                        />
                    </Form.Group>

                    <Card>
                        <Card.Body>
                            <Card.Title>Pension</Card.Title>
                            <Form.Group as={Row} controlId="pensionContributions.autoEnrolment">
                                <Form.Label column sm={4}>Auto Enrolment (%)</Form.Label>
                                <Col sm={4}>
                                    <Form.Control
                                        type="number"
                                        name="pensionContributions.autoEnrolment"
                                        value={inputs.pensionContributions.autoEnrolment}
                                        onChange={handleInputChange}
                                        min={0}
                                        max={100}
                                        step={1}
                                    />
                                </Col>
                                <Col sm={4}>
                                    <Form.Check
                                        type="switch"
                                        id="autoEnrolmentAsSalarySacrifice"
                                        label="As salary sacrifice"
                                        name="autoEnrolmentAsSalarySacrifice"
                                        checked={inputs.autoEnrolmentAsSalarySacrifice}
                                        onChange={handleInputChange}
                                    />
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} controlId="pensionContributions.salarySacrifice">
                                <Form.Label column sm={4}>Salary/Bonus Sacrifice (£)</Form.Label>
                                <Col sm={4}>
                                    <Form.Control
                                        type="number"
                                        name="pensionContributions.salarySacrifice"
                                        value={inputs.pensionContributions.salarySacrifice}
                                        onChange={handleInputChange}
                                        min={0}
                                        step={100}
                                    />
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} controlId="pensionContributions.personal">
                                <Form.Label column sm={4}>Personal Contributions (£)</Form.Label>
                                <Col sm={4}>
                                    <Form.Control
                                        type="number"
                                        name="pensionContributions.personal"
                                        value={inputs.pensionContributions.personal}
                                        onChange={handleInputChange}
                                        min={0}
                                        step={100}
                                    />
                                </Col>
                                <Col sm={4}>
                                    <Form.Check
                                        type="switch"
                                        id="taxReliefAtSource"
                                        label="Relief at source"
                                        name="taxReliefAtSource"
                                        checked={inputs.taxReliefAtSource}
                                        onChange={handleInputChange}
                                    />
                                </Col>
                            </Form.Group>
                        </Card.Body>
                    </Card>

                </Form>
            </Container>
        </div>
    );
};
