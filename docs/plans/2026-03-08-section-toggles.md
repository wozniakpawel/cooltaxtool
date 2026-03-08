# Section Toggles Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add toggle switches to Pension and Student Loans cards so they can be enabled/disabled, hiding inputs and ignoring values in calculations when off.

**Architecture:** Add `pensionEnabled` and `studentLoanEnabled` booleans to `TaxInputs` (default `false`). In `calculateTaxes()`, substitute default values when disabled. In `UserMenu`, wrap card bodies in React-Bootstrap `<Collapse>` controlled by the toggles. Form preserves user values in Formik state so toggling back on restores them.

**Tech Stack:** React 19, TypeScript, React-Bootstrap (Collapse, Form.Check), Vitest

---

### Task 1: Add toggle fields to TaxInputs type and defaults

**Files:**
- Modify: `src/types/tax.ts`
- Modify: `src/components/UserMenu.tsx`

**Step 1: Add fields to TaxInputs interface**

In `src/types/tax.ts`, add two new fields to the `TaxInputs` interface after `incomeAnalysis`:

```typescript
pensionEnabled: boolean;
studentLoanEnabled: boolean;
```

**Step 2: Update defaultInputs**

In `src/components/UserMenu.tsx`, add to `defaultInputs`:

```typescript
pensionEnabled: false,
studentLoanEnabled: false,
```

**Step 3: Verify build**

Run: `npm run build`
Expected: Success (no consumers of these fields yet)

**Step 4: Commit**

```bash
git add src/types/tax.ts src/components/UserMenu.tsx
git commit -m "feat(#53): add pensionEnabled and studentLoanEnabled to TaxInputs"
```

---

### Task 2: Update calculateTaxes to respect toggles

**Files:**
- Modify: `src/utils/TaxCalc.ts`
- Modify: `src/utils/TaxCalc.test.ts`

**Step 1: Write failing tests**

Add these tests to `src/utils/TaxCalc.test.ts`:

```typescript
describe("section toggles", () => {
    it("ignores pension contributions when pensionEnabled is false", () => {
        const result = calculateTaxes({
            ...baseInputs,
            pensionEnabled: false,
            pensionContributions: { autoEnrolment: 5, salarySacrifice: 5000, personal: 3000 },
        });
        expect(result.pensionPot.total).toBe(0);
    });

    it("includes pension contributions when pensionEnabled is true", () => {
        const result = calculateTaxes({
            ...baseInputs,
            pensionEnabled: true,
            annualGrossSalary: 50000,
            pensionContributions: { autoEnrolment: 5, salarySacrifice: 5000, personal: 3000 },
        });
        expect(result.pensionPot.total).toBeGreaterThan(0);
    });

    it("ignores student loans when studentLoanEnabled is false", () => {
        const result = calculateTaxes({
            ...baseInputs,
            studentLoanEnabled: false,
            studentLoan: ["plan2" as const],
            annualGrossSalary: 50000,
        });
        expect(result.studentLoanRepayments.total).toBe(0);
    });

    it("includes student loans when studentLoanEnabled is true", () => {
        const result = calculateTaxes({
            ...baseInputs,
            studentLoanEnabled: true,
            studentLoan: ["plan2" as const],
            annualGrossSalary: 50000,
        });
        expect(result.studentLoanRepayments.total).toBeGreaterThan(0);
    });
});
```

You will need to find the existing `baseInputs` object used in the test file. It needs `pensionEnabled: false` and `studentLoanEnabled: false` added to it.

**Step 2: Run tests to verify they fail**

Run: `npm run test -- --run src/utils/TaxCalc.test.ts`
Expected: FAIL — new tests fail (pension/student loan values not yet gated)

**Step 3: Implement toggle logic in calculateTaxes**

In `src/utils/TaxCalc.ts`, at the top of the `calculateTaxes` function, add:

```typescript
// Apply section toggles — use defaults when sections are disabled
const pensionContributions = inputs.pensionEnabled
    ? inputs.pensionContributions
    : { autoEnrolment: 0, salarySacrifice: 0, personal: 0 };
const autoEnrolmentAsSalarySacrifice = inputs.pensionEnabled
    ? inputs.autoEnrolmentAsSalarySacrifice
    : true;
const taxReliefAtSource = inputs.pensionEnabled
    ? inputs.taxReliefAtSource
    : true;
const studentLoan = inputs.studentLoanEnabled
    ? inputs.studentLoan
    : [];
```

Then replace all references to `inputs.pensionContributions` with `pensionContributions`, `inputs.autoEnrolmentAsSalarySacrifice` with `autoEnrolmentAsSalarySacrifice`, `inputs.taxReliefAtSource` with `taxReliefAtSource`, and `inputs.studentLoan` with `studentLoan` throughout the function.

**Step 4: Update existing test baseInputs**

Add `pensionEnabled: false` and `studentLoanEnabled: false` to the `baseInputs` object. Then update any existing tests that rely on pension or student loan values being calculated — those tests need `pensionEnabled: true` or `studentLoanEnabled: true` to continue passing.

**Step 5: Run tests to verify they pass**

Run: `npm run test -- --run src/utils/TaxCalc.test.ts`
Expected: ALL tests pass

**Step 6: Commit**

```bash
git add src/utils/TaxCalc.ts src/utils/TaxCalc.test.ts
git commit -m "feat(#53): gate pension and student loan calculations behind toggle flags"
```

---

### Task 3: Add toggle switches and Collapse to UserMenu

**Files:**
- Modify: `src/components/UserMenu.tsx`

**Step 1: Add Collapse import**

Add `Collapse` to the existing react-bootstrap import:

```typescript
import {
    Container, Card, Row, Col, Form, Alert,
    Button, ButtonGroup, InputGroup, Collapse,
} from 'react-bootstrap';
```

**Step 2: Update Student Loans card**

Replace the Student Loans Card with this structure:

```tsx
<Card className="mt-2">
    <Card.Body>
        <Card.Title>
            <Form.Check
                type="switch"
                id="studentLoanEnabled"
                label="Student Loans"
                name="studentLoanEnabled"
                checked={values.studentLoanEnabled}
                onChange={handleInputChange}
                className="d-inline-flex align-items-center"
            />
        </Card.Title>
        <Collapse in={values.studentLoanEnabled}>
            <div>
                <Form.Group as={Row} controlId="studentLoan">
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
```

Note: `<Collapse>` requires a single child `<div>` wrapper for the animation to work properly.

**Step 3: Update Pension card**

Replace the Pension Card.Title and wrap the body content:

```tsx
<Card className="mt-2">
    <Card.Body>
        <Card.Title>
            <Form.Check
                type="switch"
                id="pensionEnabled"
                label="Pension"
                name="pensionEnabled"
                checked={values.pensionEnabled}
                onChange={handleInputChange}
                className="d-inline-flex align-items-center"
            />
        </Card.Title>
        <Collapse in={values.pensionEnabled}>
            <div>
                {/* ALL existing pension form groups and controls go here unchanged */}
            </div>
        </Collapse>
    </Card.Body>
</Card>
```

Move all pension inputs (Auto Enrolment, As salary sacrifice, hr, Salary/Bonus Sacrifice, hr, Personal Contributions, Relief at source) inside the `<div>` within `<Collapse>`.

**Step 4: Verify build**

Run: `npm run build`
Expected: Success

**Step 5: Commit**

```bash
git add src/components/UserMenu.tsx
git commit -m "feat(#53): add toggle switches with slide animation to Pension and Student Loans cards"
```

---

### Task 4: Update TaxYearOverview to respect toggles

**Files:**
- Modify: `src/components/TaxYearOverview.tsx`

**Step 1: Update visibility filters**

In `TaxYearOverview.tsx`, the `visibleSettingsAmount` and `visibleSettingsPercent` memos filter out student loan and pension lines based on input values. Update them to also hide lines when the section is disabled:

For student loan lines, change:
```typescript
if (setting.key === "studentLoanRepayments" && props.inputs.studentLoan.length === 0) return false;
```
to:
```typescript
if (setting.key === "studentLoanRepayments" && (!props.inputs.studentLoanEnabled || props.inputs.studentLoan.length === 0)) return false;
```

For pension lines, add a new filter:
```typescript
if (setting.key === "pensionPot" && !props.inputs.pensionEnabled) return false;
```

Update the `useMemo` dependency arrays to include `props.inputs.studentLoanEnabled` and `props.inputs.pensionEnabled`.

**Step 2: Verify build**

Run: `npm run build`
Expected: Success

**Step 3: Commit**

```bash
git add src/components/TaxYearOverview.tsx
git commit -m "feat(#53): hide pension and student loan chart lines when sections are disabled"
```

---

### Task 5: Full verification

**Step 1: Run all tests**

Run: `npm run test -- --run`
Expected: All tests pass

**Step 2: Build check**

Run: `npm run build`
Expected: Success

**Step 3: Visual verification**

Run: `npm run dev`

Verify:
- [ ] Both cards show collapsed by default (just title + toggle)
- [ ] Toggling Student Loans on slides open the plan checkboxes
- [ ] Toggling Pension on slides open all pension inputs
- [ ] Toggling off slides them closed
- [ ] Values are preserved when toggling off and back on
- [ ] Charts don't show pension/student loan lines when sections are off
- [ ] Charts show them when sections are turned on
- [ ] Income Analysis view works correctly with toggles
- [ ] Dark mode still works

**Step 4: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix(#53): polish section toggle behavior"
```
