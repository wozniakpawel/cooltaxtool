import { useEffect, useState } from 'react';
import { Container, Card, Row, Col, Form, Alert, Button, ButtonGroup, InputGroup } from 'react-bootstrap';
import { Formik, useFormikContext } from 'formik';
import * as yup from 'yup';

const positiveDecimalNumber = yup.number().min(0).required().test(
    "is-decimal",
    "Should be a number with up to 2 decimal places",
    (val) => {
        if (val !== undefined) {
            return /^\d+(\.\d{0,2})?$/.test(val);
        }
        return true;
    }
);

const schema = yup.object().shape({
    grossIncome: positiveDecimalNumber,
    salaryRange: positiveDecimalNumber,
    pensionContributions: yup.object().shape({
        autoEnrolment: positiveDecimalNumber.max(30),
        salarySacrifice: positiveDecimalNumber,
        personal: positiveDecimalNumber,
    }),
});

export const defaultInputs = {
    taxYear: '2023/24',
    studentLoan: 'none',
    grossIncome: 0,
    salaryRange: 150000,
    residentInScotland: false,
    noNI: false,
    pension: false,
    pensionContributions: {
        autoEnrolment: 0,
        salarySacrifice: 0,
        personal: 0,
    },
    autoEnrolmentAsSalarySacrifice: true,
    taxReliefAtSource: true,
    incomeAnalysis: false,
};

const UseEffectWrapper = ({ onUserInputsChange }) => {
    const { values, errors } = useFormikContext();

    useEffect(() => {
        if (Object.keys(errors).length === 0) {
            onUserInputsChange(values);
        }
    }, [values, errors, onUserInputsChange]);

    return null;
};

export function UserMenu({ onUserInputsChange }) {
    const [latestErrors, setLatestErrors] = useState({});

    const customValidate = async (values) => {
        try {
            await schema.validate(values, { abortEarly: false });
            setLatestErrors({});
        } catch (err) {
            const formattedErrors = err.inner.reduce((acc, error) => {
                acc[error.path] = error.message;
                return acc;
            }, {});
            setLatestErrors(formattedErrors);
        }
    };

    return (
        <>
            <Container>
                <Formik
                    validationSchema={schema}
                    initialValues={defaultInputs}
                    onSubmit={() => { }}
                    validate={customValidate}
                >

                    {({ setFieldValue, values, errors, touched }) => {
                        const handleInputChange = (event) => {
                            const { name, value, type, checked } = event.target;
                            const newValue = type === 'checkbox' ? checked : value;
                            setFieldValue(name, newValue, true);
                        };

                        return (
                            <>
                                <Form noValidate>

                                    <Form.Group as={Row} controlId="taxYear">
                                        <Form.Label column>Tax Year</Form.Label>
                                        <Col>
                                            <Form.Control as="select" name="taxYear" value={values.taxYear} onChange={handleInputChange}>
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
                                            (values.taxYear === '2022/23') &&
                                            <Alert key="warning" variant="warning">
                                                Warning: NI calculations for the 2022/23 tax year might not be accurate due to the varying rates and thresholds. Effective rates and thresholds are being used to estimate the Employer and Employee NI contributions.
                                            </Alert>
                                        }
                                    </Form.Group>

                                    <Form.Group as={Row} controlId="studentLoan">
                                        <Form.Label column>Student Loan</Form.Label>
                                        <Col>
                                            <Form.Control as="select" name="studentLoan" value={values.studentLoan} onChange={handleInputChange}>
                                                <option value="none">No Student Loan</option>
                                                <option value="plan1">Plan 1</option>
                                                <option value="plan2">Plan 2</option>
                                                <option value="plan4">Plan 4</option>
                                                <option value="plan5">Plan 5</option>
                                                <option value="postgrad">Postgraduate</option>
                                            </Form.Control>
                                        </Col>
                                    </Form.Group>

                                    <Form.Group>
                                        <Form.Check
                                            type="switch"
                                            id="residentInScotland"
                                            label="Resident in Scotland"
                                            name="residentInScotland"
                                            checked={values.residentInScotland}
                                            onChange={handleInputChange}
                                        />
                                        <Form.Check
                                            type="switch"
                                            id="noNI"
                                            label="Exclude NI"
                                            name="noNI"
                                            checked={values.noNI}
                                            onChange={handleInputChange}
                                        />
                                    </Form.Group>

                                    <Card>
                                        <Card.Body>
                                            {/* <Card.Title>Pension</Card.Title> */}
                                            <Form.Group>
                                                <Form.Check
                                                    type="switch"
                                                    id="pension"
                                                    label="Pension"
                                                    name="pension"
                                                    checked={values.pension}
                                                    onChange={handleInputChange}
                                                />
                                            </Form.Group>
                                            {
                                                values.pension &&
                                                <>
                                                    <Form.Group as={Row} controlId="pensionContributions.autoEnrolment">
                                                        <Form.Label column sm={4}>Auto Enrolment</Form.Label>
                                                        <Col sm={4}>
                                                            <InputGroup>
                                                                <InputGroup.Text>%</InputGroup.Text>
                                                                <Form.Control
                                                                    type="number"
                                                                    name="pensionContributions.autoEnrolment"
                                                                    value={values.pensionContributions.autoEnrolment}
                                                                    onChange={handleInputChange}
                                                                    isValid={!errors.pensionContributions?.autoEnrolment}
                                                                    isInvalid={!!errors.pensionContributions?.autoEnrolment}
                                                                    min={0}
                                                                    max={30}
                                                                    step={0.1}
                                                                />
                                                                {errors.pensionContributions?.autoEnrolment ? <div className="text-danger">{errors.pensionContributions?.autoEnrolment}</div> : null}
                                                            </InputGroup>
                                                        </Col>
                                                        <Col sm={4}>
                                                            <Form.Check
                                                                type="switch"
                                                                id="autoEnrolmentAsSalarySacrifice"
                                                                label="As salary sacrifice"
                                                                name="autoEnrolmentAsSalarySacrifice"
                                                                checked={values.autoEnrolmentAsSalarySacrifice}
                                                                onChange={handleInputChange}
                                                            />
                                                        </Col>
                                                    </Form.Group>
                                                    <Form.Group as={Row} controlId="pensionContributions.salarySacrifice">
                                                        <Form.Label column sm={4}>Salary/Bonus Sacrifice</Form.Label>
                                                        <Col sm={4}>
                                                            <InputGroup>
                                                                <InputGroup.Text>£</InputGroup.Text>
                                                                <Form.Control
                                                                    type="number"
                                                                    name="pensionContributions.salarySacrifice"
                                                                    value={values.pensionContributions.salarySacrifice}
                                                                    onChange={handleInputChange}
                                                                    isValid={!errors.pensionContributions?.salarySacrifice}
                                                                    isInvalid={!!errors.pensionContributions?.salarySacrifice}
                                                                    min={0}
                                                                    step={100}
                                                                />
                                                                {errors.pensionContributions?.salarySacrifice ? <div className="text-danger">{errors.pensionContributions?.salarySacrifice}</div> : null}
                                                            </InputGroup>
                                                        </Col>
                                                    </Form.Group>
                                                    <Form.Group as={Row} controlId="pensionContributions.personal">
                                                        <Form.Label column sm={4}>Personal Contributions</Form.Label>
                                                        <Col sm={4}>
                                                            <InputGroup>
                                                                <InputGroup.Text>£</InputGroup.Text>
                                                                <Form.Control
                                                                    type="number"
                                                                    name="pensionContributions.personal"
                                                                    value={values.pensionContributions.personal}
                                                                    onChange={handleInputChange}
                                                                    isValid={!errors.pensionContributions?.personal}
                                                                    isInvalid={!!errors.pensionContributions?.personal}
                                                                    min={0}
                                                                    step={100}
                                                                />
                                                                {errors.pensionContributions?.personal ? <div className="text-danger">{errors.pensionContributions?.personal}</div> : null}
                                                            </InputGroup>
                                                        </Col>
                                                        <Col sm={4}>
                                                            <Form.Check
                                                                type="switch"
                                                                id="taxReliefAtSource"
                                                                label="Relief at source"
                                                                name="taxReliefAtSource"
                                                                checked={values.taxReliefAtSource}
                                                                onChange={handleInputChange}
                                                            />
                                                        </Col>
                                                    </Form.Group>
                                                </>
                                            }
                                        </Card.Body>
                                    </Card>

                                    <Card>
                                        <Card.Body>
                                            <ButtonGroup>
                                                <Button
                                                    variant={!values.incomeAnalysis ? 'primary' : 'outline-primary'}
                                                    onClick={() => handleInputChange({
                                                        target: { name: 'incomeAnalysis', type: 'checkbox', checked: !values.incomeAnalysis }
                                                    })}
                                                >
                                                    Tax Year Overview
                                                </Button>
                                                <Button
                                                    variant={values.incomeAnalysis ? 'primary' : 'outline-primary'}
                                                    onClick={() => handleInputChange({
                                                        target: { name: 'incomeAnalysis', type: 'checkbox', checked: !values.incomeAnalysis }
                                                    })}
                                                >
                                                    Income analysis
                                                </Button>
                                            </ButtonGroup>

                                            {values.incomeAnalysis &&
                                                <Form.Group as={Row} controlId="grossIncome">
                                                    <Form.Label column>Annual Gross Income</Form.Label>
                                                    <Col>
                                                        <InputGroup>
                                                            <InputGroup.Text>£</InputGroup.Text>
                                                            <Form.Control
                                                                type="number"
                                                                name="grossIncome"
                                                                value={values.grossIncome}
                                                                onChange={handleInputChange}
                                                                isValid={!errors.grossIncome}
                                                                isInvalid={!!errors.grossIncome}
                                                                min={0}
                                                                step={1000}
                                                            />
                                                            {errors.grossIncome ? <div className="text-danger">{errors.grossIncome}</div> : null}
                                                        </InputGroup>
                                                    </Col>
                                                </Form.Group>
                                            }

                                            {!values.incomeAnalysis &&
                                                <Form.Group as={Row} controlId="grossIncome">
                                                    <Form.Label column>Salary range</Form.Label>
                                                    <Col>
                                                        <InputGroup>
                                                            <InputGroup.Text>£</InputGroup.Text>
                                                            <Form.Control
                                                                type="number"
                                                                name="salaryRange"
                                                                value={values.salaryRange}
                                                                onChange={handleInputChange}
                                                                isValid={!errors.salaryRange}
                                                                isInvalid={!!errors.salaryRange}
                                                                min={10000}
                                                                step={10000}
                                                            />
                                                            {errors.salaryRange ? <div className="text-danger">{errors.salaryRange}</div> : null}
                                                        </InputGroup>
                                                    </Col>
                                                </Form.Group>
                                            }
                                        </Card.Body>
                                    </Card>

                                    <iframe
                                        src="https://github.com/sponsors/wozniakpawel/button"
                                        title="Sponsor wozniakpawel"
                                        height="32"
                                        width="114"
                                        style={{ border: '0', borderRadius: "6px" }}
                                    />

                                </Form>
                                <UseEffectWrapper onUserInputsChange={onUserInputsChange} latestErrors={latestErrors} />
                            </>
                        );
                    }}
                </Formik>
            </Container>
        </>
    );
};
