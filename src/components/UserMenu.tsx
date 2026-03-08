import { useEffect, ChangeEvent } from 'react';
import { Formik, useFormikContext } from 'formik';
import NumberOfChildrenSelector from './NumberOfChildrenSelector';
import * as yup from 'yup';
import { taxYears } from '../utils/TaxYears';
import { studentLoanOptions } from '../utils/studentLoanOptions';
import {
    Container, Card, Row, Col, Form, Alert,
    Button, ButtonGroup, InputGroup, Collapse,
} from 'react-bootstrap';
import type { TaxInputs, StudentLoanPlan } from '../types/tax';

const taxYearOptions = Object.keys(taxYears);

const requiredPositiveNumber = yup.number()
    .typeError("Must be a number.")
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

export const defaultInputs: TaxInputs = {
    taxYear: taxYearOptions[0],
    studentLoan: [] as StudentLoanPlan[],
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
    pensionEnabled: false,
    studentLoanEnabled: false,
};

const hasEmptyString = (obj: Record<string, unknown>): boolean => {
    return Object.values(obj).some(value => {
        if (typeof value === 'string') {
            return value === '';
        } else if (typeof value === 'object' && value !== null) {
            return hasEmptyString(value as Record<string, unknown>);
        }
        return false;
    });
};

interface UseEffectWrapperProps {
    onUserInputsChange: (inputs: TaxInputs) => void;
}

const UseEffectWrapper = ({ onUserInputsChange }: UseEffectWrapperProps) => {
    const { values, errors } = useFormikContext<TaxInputs>();

    const parseValuesToFloats = (values: TaxInputs): TaxInputs => {
        const parsedValues = { ...values };
        parsedValues.annualGrossSalary = Number(parsedValues.annualGrossSalary);
        parsedValues.annualGrossBonus = Number(parsedValues.annualGrossBonus);
        parsedValues.annualGrossIncomeRange = Number(parsedValues.annualGrossIncomeRange);
        parsedValues.pensionContributions = {
            ...parsedValues.pensionContributions,
            autoEnrolment: Number(parsedValues.pensionContributions.autoEnrolment),
            salarySacrifice: Number(parsedValues.pensionContributions.salarySacrifice),
            personal: Number(parsedValues.pensionContributions.personal),
        };
        return parsedValues;
    };

    useEffect(() => {
        if (Object.keys(errors).length === 0 && !hasEmptyString(values as unknown as Record<string, unknown>)) {
            onUserInputsChange(parseValuesToFloats(values));
        }
    }, [values, errors, onUserInputsChange]);

    return null;
};

interface UserMenuProps {
    onUserInputsChange: (inputs: TaxInputs) => void;
}

export function UserMenu({ onUserInputsChange }: UserMenuProps) {
    return (
        <>
            <Container>
                <Formik
                    validationSchema={schema}
                    initialValues={defaultInputs}
                    onSubmit={() => { }}
                >

                    {({ setFieldValue, values, errors }) => {
                        const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; value?: string; type: string; checked?: boolean } }) => {
                            const { name, value, type, checked } = event.target as HTMLInputElement;
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

                                    <Form.Group as={Row} controlId="taxYear" className="mt-2">
                                        <Form.Label column>Tax Year</Form.Label>
                                        <Col>
                                            <Form.Control as="select" name="taxYear" value={values.taxYear} onChange={handleInputChange}>
                                                {taxYearOptions.map(year => (
                                                    <option key={year} value={year}>{year}</option>
                                                ))}
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

                                    <Card className="mt-2">
                                        <Card.Body>
                                            <Card.Title>
                                                <Form.Check
                                                    type="switch"
                                                    id="studentLoanEnabled"
                                                    label={<>Student Loans</>}
                                                    name="studentLoanEnabled"
                                                    checked={values.studentLoanEnabled}
                                                    onChange={handleInputChange}
                                                    className="d-inline-flex align-items-center"
                                                />
                                            </Card.Title>
                                            <Collapse in={values.studentLoanEnabled}>
                                                <div>
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
                                                </div>
                                            </Collapse>
                                        </Card.Body>
                                    </Card>

                                    <Card className="mt-2">
                                        <Card.Body>
                                            <Card.Title>
                                                <Form.Check
                                                    type="switch"
                                                    id="pensionEnabled"
                                                    label={<>Pension</>}
                                                    name="pensionEnabled"
                                                    checked={values.pensionEnabled}
                                                    onChange={handleInputChange}
                                                    className="d-inline-flex align-items-center"
                                                />
                                            </Card.Title>
                                            <Collapse in={values.pensionEnabled}>
                                                <div>
                                                    <Form.Group as={Row} controlId="pensionContributions.autoEnrolment">
                                                        <Form.Label column>Auto Enrolment</Form.Label>
                                                        <Col>
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
                                                    </Form.Group>
                                                    <Form.Check
                                                        type="switch"
                                                        id="autoEnrolmentAsSalarySacrifice"
                                                        label="As salary sacrifice"
                                                        name="autoEnrolmentAsSalarySacrifice"
                                                        checked={values.autoEnrolmentAsSalarySacrifice}
                                                        onChange={handleInputChange}
                                                    />

                                                    <hr />

                                                    <Form.Group as={Row} controlId="pensionContributions.salarySacrifice">
                                                        <Form.Label column>Salary/Bonus Sacrifice</Form.Label>
                                                        <Col>
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

                                                    <hr />

                                                    <Form.Group as={Row} controlId="pensionContributions.personal">
                                                        <Form.Label column>Personal Contributions</Form.Label>
                                                        <Col>
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
                                                    </Form.Group>
                                                    <Form.Check
                                                        type="switch"
                                                        id="taxReliefAtSource"
                                                        label="Relief at source"
                                                        name="taxReliefAtSource"
                                                        checked={values.taxReliefAtSource}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                            </Collapse>
                                        </Card.Body>
                                    </Card>

                                    <Card className="mt-2">
                                        <Card.Body>
                                            <ButtonGroup className="mb-2">
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

                                                    <Form.Group as={Row} controlId="annualGrossBonus" className="mt-2">
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
                                        className="mt-2"
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
