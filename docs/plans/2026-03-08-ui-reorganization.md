# UI Reorganization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reorganize the app UI: rename view toggle labels, make salary/bonus always visible, move income range to the right side, and show pension chart only when pension is enabled in "My Taxes" view.

**Architecture:** This is a pure UI reshuffling — no calculation logic changes. The view toggle labels change from "Tax Year Overview"/"Income analysis" to "Income Explorer"/"My Taxes". Salary and bonus inputs move out of the conditional block so they're always visible. The income range input moves from UserMenu to TaxYearOverview. The IncomeAnalysis component conditionally renders PensionAnalysis based on `pensionEnabled`.

**Tech Stack:** React, TypeScript, React-Bootstrap, Vitest, @testing-library/react

---

### Task 1: Rename view toggle labels

**Files:**
- Modify: `src/components/UserMenu.tsx:344-363`

**Step 1: Update the button labels**

In UserMenu.tsx, find the ButtonGroup (lines 344-363). Change:
- `Tax Year Overview` → `Income Explorer`
- `Income analysis` → `My Taxes`

Replace lines 346-363:

```tsx
                                            <ButtonGroup className="mb-2">
                                                <Button
                                                    variant={!values.incomeAnalysis ? 'primary' : 'outline-primary'}
                                                    onClick={() => handleInputChange({
                                                        target: { name: 'incomeAnalysis', type: 'checkbox', checked: !values.incomeAnalysis }
                                                    })}
                                                >
                                                    Income Explorer
                                                </Button>
                                                <Button
                                                    variant={values.incomeAnalysis ? 'primary' : 'outline-primary'}
                                                    onClick={() => handleInputChange({
                                                        target: { name: 'incomeAnalysis', type: 'checkbox', checked: !values.incomeAnalysis }
                                                    })}
                                                >
                                                    My Taxes
                                                </Button>
                                            </ButtonGroup>
```

Note: The order is swapped — "Income Explorer" first (maps to `incomeAnalysis: false`), "My Taxes" second (maps to `incomeAnalysis: true`). This keeps the default view as Income Explorer.

**Step 2: Run tests**

Run: `npx vitest run`
Expected: ALL PASS (label changes don't affect any test assertions)

**Step 3: Commit**

```bash
git add src/components/UserMenu.tsx
git commit -m "refactor: rename view toggle to 'Income Explorer' and 'My Taxes' (#59)"
```

---

### Task 2: Make salary and bonus inputs always visible

**Files:**
- Modify: `src/components/UserMenu.tsx:344-438`

**Step 1: Move salary and bonus inputs above the view toggle card**

Currently, salary and bonus inputs (lines 365-412) are inside the view toggle card, wrapped in `{values.incomeAnalysis && ...}`. They need to move above the card so they're always visible.

Cut the salary and bonus inputs out of the conditional block and place them BEFORE the view toggle card (before line 344). The salary/bonus section should be standalone Form.Groups, not inside the card:

```tsx
                                    <Form.Group as={Row} controlId="annualGrossSalary" className="mt-2">
                                        <Form.Label column>Annual Gross Salary <InfoPopover {...explanations.annualGrossSalary} /></Form.Label>
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
                                        <Form.Label column>Annual Gross Bonus <InfoPopover {...explanations.annualGrossBonus} /></Form.Label>
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
```

Then remove the `{values.incomeAnalysis && ...}` conditional block that previously contained them (the old lines 365-413).

The view toggle card should now only contain the ButtonGroup and the income range conditional (for `!values.incomeAnalysis`).

**Step 2: Remove the income range input from the card**

Also remove the `{!values.incomeAnalysis && ...}` conditional block (old lines 415-438) with the income range input. This will be moved to TaxYearOverview in Task 3.

The card should now contain ONLY the ButtonGroup:

```tsx
                                    <Card className="mt-2">
                                        <Card.Body>
                                            <ButtonGroup className="mb-0">
                                                <Button
                                                    variant={!values.incomeAnalysis ? 'primary' : 'outline-primary'}
                                                    onClick={() => handleInputChange({
                                                        target: { name: 'incomeAnalysis', type: 'checkbox', checked: !values.incomeAnalysis }
                                                    })}
                                                >
                                                    Income Explorer
                                                </Button>
                                                <Button
                                                    variant={values.incomeAnalysis ? 'primary' : 'outline-primary'}
                                                    onClick={() => handleInputChange({
                                                        target: { name: 'incomeAnalysis', type: 'checkbox', checked: !values.incomeAnalysis }
                                                    })}
                                                >
                                                    My Taxes
                                                </Button>
                                            </ButtonGroup>
                                        </Card.Body>
                                    </Card>
```

**Step 3: Run tests**

Run: `npx vitest run`
Expected: ALL PASS

**Step 4: Commit**

```bash
git add src/components/UserMenu.tsx
git commit -m "refactor: make salary/bonus always visible, remove income range from form (#59)"
```

---

### Task 3: Move income range input to TaxYearOverview

**Files:**
- Modify: `src/components/TaxYearOverview.tsx`

**Step 1: Add the income range input above the charts**

TaxYearOverview receives `inputs` as a prop which includes `annualGrossIncomeRange`. Currently this value is only used for chart data generation.

We need to add a self-contained income range input at the top of TaxYearOverview. Since this component doesn't use Formik, we'll use a local `useState` initialized from `inputs.annualGrossIncomeRange`, and use it for the chart X-axis range.

Add these imports at the top:

```tsx
import { useMemo, useState, useEffect } from "react";
import { Container, Form, Row, Col, InputGroup } from "react-bootstrap";
```

Replace the existing `useMemo` and add state for the range:

```tsx
const [incomeRange, setIncomeRange] = useState(inputs.annualGrossIncomeRange);

useEffect(() => {
    setIncomeRange(inputs.annualGrossIncomeRange);
}, [inputs.annualGrossIncomeRange]);
```

Then use `incomeRange` instead of `inputs.annualGrossIncomeRange` in the data generation (find where `annualGrossIncomeRange` is referenced in the component and replace with `incomeRange`).

Add the input control at the top of the return JSX, before the charts:

```tsx
<Form.Group as={Row} controlId="incomeRange" className="mb-3">
    <Form.Label column>Income range</Form.Label>
    <Col>
        <InputGroup>
            <InputGroup.Text>£</InputGroup.Text>
            <Form.Control
                type="number"
                inputMode="decimal"
                value={incomeRange}
                onChange={(e) => setIncomeRange(Number(e.target.value))}
                min={10000}
                step={10000}
            />
        </InputGroup>
    </Col>
</Form.Group>
```

**Step 2: Run tests**

Run: `npx vitest run`
Expected: ALL PASS

**Step 3: Commit**

```bash
git add src/components/TaxYearOverview.tsx
git commit -m "refactor: move income range input into TaxYearOverview component (#59)"
```

---

### Task 4: Show PensionAnalysis only when pension enabled in My Taxes view

**Files:**
- Modify: `src/components/IncomeAnalysis.tsx`

**Step 1: Conditionally render PensionAnalysis**

Change IncomeAnalysis.tsx:

```tsx
const IncomeAnalysis = (props: IncomeAnalysisProps) => {
    return (
        <Container>
            <TaxBreakdown {...props} />
            {props.inputs.pensionEnabled && <PensionAnalysis {...props} />}
        </Container>
    );
};
```

Note: TaxBreakdown now comes first (it's the primary output), PensionAnalysis below it and only when pension is enabled.

**Step 2: Run tests**

Run: `npx vitest run`
Expected: ALL PASS

**Step 3: Commit**

```bash
git add src/components/IncomeAnalysis.tsx
git commit -m "refactor: show pension chart only when pension enabled, reorder components (#59)"
```

---

### Task 5: Update App.test.tsx for new labels

**Files:**
- Modify: `src/App.test.tsx`

**Step 1: Check if any tests reference old labels**

Search for "Tax Year Overview", "Income analysis", or "income range" in test files. If found, update to match new labels ("Income Explorer", "My Taxes").

**Step 2: Run full test suite**

Run: `npx vitest run`
Expected: ALL PASS

**Step 3: Commit (if changes were needed)**

```bash
git add src/App.test.tsx
git commit -m "test: update tests for renamed view toggle labels (#59)"
```
