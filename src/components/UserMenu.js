import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Form, Button, ButtonGroup } from 'react-bootstrap';

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
    const [warningMessage, setWarningMessage] = useState('');

    useEffect(() => {
        onUserInputsChange(inputs);
    }, [inputs, onUserInputsChange]);

    const handleInputChange = (event) => {
        const { name, value, type, checked } = event.target;
        let input = type === 'checkbox' ? checked : value;

        // Convert pension input value to a number
        if (name.startsWith('pensionContributions') || name === 'grossIncome') {
            input = parseInt(value, 10);
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

        if (name === 'taxYear' && value === '2022/23') {
            setWarningMessage('Warning: NI calculations for the 2022/23 tax year might not be accurate due to the varying rates and thresholds. Effective rates and thresholds are being used to estimate the Employer and Employee NI contributions.');
        } else if (name === 'taxYear') {
            setWarningMessage('');
        }
    };

    return (
        <div className="UserInputs">
            <Container>
                <Form>
                    <Form.Group controlId="taxYear">
                        <Form.Control as="select" name="taxYear" value={inputs.taxYear} onChange={handleInputChange}>
                            <option value="2023/24">Tax Year 2023/24</option>
                            <option value="2022/23">Tax Year 2022/23</option>
                            <option value="2021/22">Tax Year 2021/22</option>
                            <option value="2020/21">Tax Year 2020/21</option>
                            <option value="2019/20">Tax Year 2019/20</option>
                            <option value="2018/19">Tax Year 2018/19</option>
                            <option value="2017/18">Tax Year 2017/18</option>
                        </Form.Control>
                        {warningMessage && <p className="warning-message">{warningMessage}</p>}
                    </Form.Group>

                    <Form.Group controlId="studentLoan">
                        <Form.Control as="select" name="studentLoan" value={inputs.studentLoan} onChange={handleInputChange}>
                            <option value="none">No Student Loan</option>
                            <option value="plan1">Student Loan Plan 1</option>
                            <option value="plan2">Student Loan Plan 2</option>
                            <option value="plan4">Student Loan Plan 4</option>
                            <option value="plan5">Student Loan Plan 5</option>
                            <option value="postgrad">Postgraduate Student Loan</option>
                        </Form.Control>
                    </Form.Group>

                    <Form.Group controlId="grossIncome">
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

                    <Form.Group>
                        <ButtonGroup>
                            <Button
                                variant={inputs.residentInScotland ? 'primary' : 'outline-primary'}
                                onClick={() => handleInputChange({
                                    target: { name: 'residentInScotland', type: 'checkbox', checked: !inputs.residentInScotland }
                                })}
                            >
                                Resident in Scotland
                            </Button>
                            <Button
                                variant={inputs.noNI ? 'primary' : 'outline-primary'}
                                onClick={() => handleInputChange({
                                    target: { name: 'noNI', type: 'checkbox', checked: !inputs.noNI }
                                })}
                            >
                                Exclude NI
                            </Button>
                        </ButtonGroup>
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
