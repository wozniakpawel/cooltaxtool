import { useEffect } from 'react';
import { Formik, useFormikContext } from 'formik';
import NumberOfChildrenSelector from './NumberOfChildrenSelector';
import * as yup from 'yup';

import {
    Container, Card, Row, Col, Form, Alert,
    Button, ButtonGroup, InputGroup,
} from 'react-bootstrap';

export const studentLoanOptions = [
    { plan: 'plan1', label: 'Plan 1' },
    { plan: 'plan2', label: 'Plan 2' },
    { plan: 'plan4', label: 'Plan 4' },
    { plan: 'plan5', label: 'Plan 5' },
    { plan: 'postgrad', label: 'Postgraduate' },
];

const requiredPositiveNumber = yup.number("Must be a number.")
    .min(0, "Must be a positive number.")
    .required("Field required.");

const schema = yup.object().shape({
    annualGrossSalary: requiredPositiveNumber,
    annualGrossBonus: requiredPositiveNumber,
    annualGrossIncomeRange: requiredPositiveNumber,
    pensionContributions: yup.object().shape({
        autoEnrolment: requiredPositiveNumber
            .max(30, "Must be less than or equal to 30."),
        salarySacrifice: requiredPositiveNumber,
        personal: requiredPositiveNumber,
    }),
});

export const defaultInputs = {
    taxYear: '2023/24',
    studentLoan: [],
    annualGrossSalary: 0,
    annualGrossBonus: 0,
    annualGrossIncomeRange: 150000,
    residentInScotland: false,
    noNI: false,
    blind: false,
    childBenefits: {
        childBenefitsTaken: false,
        numberOfChildren: 1,
    },
    pensionContributions: {
        autoEnrolment: 0,
        salarySacrifice: 0,
        personal: 0,
    },
    autoEnrolmentAsSalarySacrifice: true,
    taxReliefAtSource: true,
    incomeAnalysis: false,
};

const hasEmptyString = (obj) => {
    return Object.values(obj).some(value => {
        if (typeof value === 'string') {
            return value === '';
        } else if (typeof value === 'object') {
            return hasEmptyString(value);
        }
        return false;
    });
};

const UseEffectWrapper = ({ onUserInputsChange }) => {
    const { values, errors } = useFormikContext();

    const parseValuesToFloats = (values) => {
        let parsedValues = { ...values };
        parsedValues.annualGrossSalary = parseFloat(parsedValues.annualGrossSalary);
        parsedValues.annualGrossBonus = parseFloat(parsedValues.annualGrossBonus);
        parsedValues.annualGrossIncomeRange = parseFloat(parsedValues.annualGrossIncomeRange);
        parsedValues.pensionContributions.autoEnrolment = parseFloat(parsedValues.pensionContributions.autoEnrolment);
        parsedValues.pensionContributions.salarySacrifice = parseFloat(parsedValues.pensionContributions.salarySacrifice);
        parsedValues.pensionContributions.personal = parseFloat(parsedValues.pensionContributions.personal);
        return parsedValues;
    };

    useEffect(() => {
        if (Object.keys(errors).length === 0 && !hasEmptyString(values)) {
            onUserInputsChange(parseValuesToFloats(values));
        }
    }, [values, errors, onUserInputsChange]);

    return null;
};

export function UserMenu({ onUserInputsChange }) {
    return (
        <>
            <Container>
                <Formik
                    validationSchema={schema}
                    initialValues={defaultInputs}
                    onSubmit={() => { }}
                >

                    {({ setFieldValue, values, errors }) => {
                        const handleInputChange = (event) => {
                            const { name, value, type, checked } = event.target;
                            if (name === "studentLoan") {
                                const newStudentLoan = checked
                                    ? [...values.studentLoan, value]
                                    : values.studentLoan.filter(plan => plan !== value);
                                setFieldValue(name, newStudentLoan, true);
                            } else {
                                const newValue = type === "checkbox" ? checked : value;
                                setFieldValue(name, newValue, true);
                            }
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
                                        <Form.Check
                                            type="switch"
                                            id="blind"
                                            label="Blind"
                                            name="blind"
                                            checked={values.blind}
                                            onChange={handleInputChange}
                                        />
                                        <Form.Check
                                            type="switch"
                                            id="childBenefits.childBenefitsTaken"
                                            label="Child Benefits"
                                            name="childBenefits.childBenefitsTaken"
                                            checked={values.childBenefits.childBenefitsTaken}
                                            onChange={handleInputChange}
                                        />
                                        {values.childBenefits.childBenefitsTaken &&
                                            <NumberOfChildrenSelector
                                                setFieldValue={setFieldValue}
                                                values={values}
                                            />
                                        }
                                    </Form.Group>

                                    <Card>
                                        <Card.Body>
                                            <Card.Title>Student Loans</Card.Title>
                                            <Form.Group as={Row} controlId="studentLoan">
                                                {/* <Form.Label column>Student Loans</Form.Label> */}
                                                <Col>
                                                    {studentLoanOptions.map(option => (
                                                        <Form.Check
                                                            key={option.plan}
                                                            type="checkbox"
                                                            label={option.label}
                                                            name="studentLoan"
                                                            value={option.plan}
                                                            checked={values.studentLoan.includes(option.plan)}
                                                            onChange={handleInputChange}
                                                        />
                                                    ))}
                                                </Col>
                                            </Form.Group>
                                        </Card.Body>
                                    </Card>

                                    <Card>
                                        <Card.Body>
                                            <Card.Title>Pension</Card.Title>
                                            <Form.Group as={Row} controlId="pensionContributions.autoEnrolment">
                                                <Form.Label column sm={4}>Auto Enrolment</Form.Label>
                                                <Col sm={4}>
                                                    <InputGroup hasValidation>
                                                        <InputGroup.Text>%</InputGroup.Text>
                                                        <Form.Control
                                                            type="number"
                                                            inputMode="decimal"
                                                            name="pensionContributions.autoEnrolment"
                                                            value={values.pensionContributions.autoEnrolment}
                                                            onChange={handleInputChange}
                                                            isValid={!errors.pensionContributions?.autoEnrolment}
                                                            isInvalid={!!errors.pensionContributions?.autoEnrolment}
                                                            min={0}
                                                            max={30}
                                                            step={0.1}
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.pensionContributions?.autoEnrolment}
                                                        </Form.Control.Feedback>
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
                                                    <InputGroup hasValidation>
                                                        <InputGroup.Text>£</InputGroup.Text>
                                                        <Form.Control
                                                            type="number"
                                                            inputMode="decimal"
                                                            name="pensionContributions.salarySacrifice"
                                                            value={values.pensionContributions.salarySacrifice}
                                                            onChange={handleInputChange}
                                                            isValid={!errors.pensionContributions?.salarySacrifice}
                                                            isInvalid={!!errors.pensionContributions?.salarySacrifice}
                                                            min={0}
                                                            step={100}
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.pensionContributions?.salarySacrifice}
                                                        </Form.Control.Feedback>
                                                    </InputGroup>
                                                </Col>
                                            </Form.Group>
                                            <Form.Group as={Row} controlId="pensionContributions.personal">
                                                <Form.Label column sm={4}>Personal Contributions</Form.Label>
                                                <Col sm={4}>
                                                    <InputGroup hasValidation>
                                                        <InputGroup.Text>£</InputGroup.Text>
                                                        <Form.Control
                                                            type="number"
                                                            inputMode="decimal"
                                                            name="pensionContributions.personal"
                                                            value={values.pensionContributions.personal}
                                                            onChange={handleInputChange}
                                                            isValid={!errors.pensionContributions?.personal}
                                                            isInvalid={!!errors.pensionContributions?.personal}
                                                            min={0}
                                                            step={100}
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.pensionContributions?.personal}
                                                        </Form.Control.Feedback>
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
                                                <>
                                                    <Form.Group as={Row} controlId="annualGrossSalary">
                                                        <Form.Label column>Annual Gross Salary</Form.Label>
                                                        <Col>
                                                            <InputGroup hasValidation>
                                                                <InputGroup.Text>£</InputGroup.Text>
                                                                <Form.Control
                                                                    type="number"
                                                                    inputMode="decimal"
                                                                    name="annualGrossSalary"
                                                                    value={values.annualGrossSalary}
                                                                    onChange={handleInputChange}
                                                                    isValid={!errors.annualGrossSalary}
                                                                    isInvalid={!!errors.annualGrossSalary}
                                                                    min={0}
                                                                    step={1000}
                                                                />
                                                                <Form.Control.Feedback type="invalid">
                                                                    {errors.annualGrossSalary}
                                                                </Form.Control.Feedback>
                                                            </InputGroup>
                                                        </Col>
                                                    </Form.Group>

                                                    <Form.Group as={Row} controlId="annualGrossBonus">
                                                        <Form.Label column>Annual Gross Bonus</Form.Label>
                                                        <Col>
                                                            <InputGroup hasValidation>
                                                                <InputGroup.Text>£</InputGroup.Text>
                                                                <Form.Control
                                                                    type="number"
                                                                    inputMode="decimal"
                                                                    name="annualGrossBonus"
                                                                    value={values.annualGrossBonus}
                                                                    onChange={handleInputChange}
                                                                    isValid={!errors.annualGrossBonus}
                                                                    isInvalid={!!errors.annualGrossBonus}
                                                                    min={0}
                                                                    step={1000}
                                                                />
                                                                <Form.Control.Feedback type="invalid">
                                                                    {errors.annualGrossBonus}
                                                                </Form.Control.Feedback>
                                                            </InputGroup>
                                                        </Col>
                                                    </Form.Group>
                                                </>
                                            }

                                            {!values.incomeAnalysis &&
                                                <Form.Group as={Row} controlId="annualGrossIncomeRange">
                                                    <Form.Label column>Annual Gross Income range</Form.Label>
                                                    <Col>
                                                        <InputGroup hasValidation>
                                                            <InputGroup.Text>£</InputGroup.Text>
                                                            <Form.Control
                                                                type="number"
                                                                inputMode="decimal"
                                                                name="annualGrossIncomeRange"
                                                                value={values.annualGrossIncomeRange}
                                                                onChange={handleInputChange}
                                                                isValid={!errors.annualGrossIncomeRange}
                                                                isInvalid={!!errors.annualGrossIncomeRange}
                                                                min={10000}
                                                                step={10000}
                                                            />
                                                            <Form.Control.Feedback type="invalid">
                                                                {errors.annualGrossIncomeRange}
                                                            </Form.Control.Feedback>
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
                                <UseEffectWrapper onUserInputsChange={onUserInputsChange} />
                            </>
                        );
                    }}
                </Formik>
            </Container>
        </>
    );
};
