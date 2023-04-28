import React from 'react';
import { Card, Row, Col, Form } from 'react-bootstrap';

export function PensionForm({ inputs, handleInputChange }) {
  return (
    <Card className="mb-4">
        <Card.Body>
            <Card.Title>Pension</Card.Title>
            <Form.Group as={Row} controlId="pensionContributions.autoEnrolment" className="mb-4">
                <Form.Label>Auto Enrolment (%)</Form.Label>
                <Col sm={6}>
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
                <Col sm={6} className="mt-1">
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
            <Form.Group as={Row} controlId="pensionContributions.salarySacrifice" className="mb-4">
                <Form.Label>Salary/Bonus Sacrifice (£)</Form.Label>
                <Col sm={6}>
                    <Form.Control
                        type="number"
                        name="pensionContributions.salarySacrifice"
                        value={inputs.pensionContributions.salarySacrifice}
                        onChange={handleInputChange}
                        min={0}
                        step={100}
                    />
                </Col>
                <Col></Col>
            </Form.Group>
            <Form.Group as={Row} controlId="pensionContributions.personal" className="mb-2">
                <Form.Label>Personal Contributions (£)</Form.Label>
                <Col sm={6}>
                    <Form.Control
                        type="number"
                        name="pensionContributions.personal"
                        value={inputs.pensionContributions.personal}
                        onChange={handleInputChange}
                        min={0}
                        step={100}
                    />
                </Col>
                <Col sm={6} className="mt-1">
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
  )
}

export default PensionForm