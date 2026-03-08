# Period Breakdown Toggle Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a toggle to the Tax Breakdown card so users can view figures as annual, monthly, weekly, or daily amounts.

**Architecture:** Add a `useState` for the selected period in TaxBreakdown.tsx. A divisor map converts the period to a number (1/12/52/365). The existing `renderSingleValue` and `renderBreakDown` helpers divide values before formatting. A React-Bootstrap `ButtonGroup` in the card title lets users switch periods. No calculation or type changes needed.

**Tech Stack:** React, TypeScript, React-Bootstrap (ButtonGroup, Button), Vitest, @testing-library/react

---

### Task 1: Add period toggle UI and state

**Files:**
- Modify: `src/components/IncomeAnalysis/TaxBreakdown.tsx`

**Step 1: Add the period state and divisor map**

At the top of the `TaxBreakdown` component (after line 15), add:

```typescript
  const [period, setPeriod] = useState<'annual' | 'monthly' | 'weekly' | 'daily'>('annual');

  const divisors = { annual: 1, monthly: 12, weekly: 52, daily: 365 };
  const divisor = divisors[period];
```

Add `useState` to the React import on line 2 (it already imports `useMemo`, so add `useState` next to it).

Add `ButtonGroup, Button` to the react-bootstrap import on line 4.

**Step 2: Update `renderSingleValue` to apply the divisor**

Change the value display from:

```typescript
  function renderSingleValue(name: ReactNode, value: number) {
    return (
      <tr>
        <td>{name}</td>
        <td className="text-end">
          {formatCurrencyPrecise(value)}
        </td>
      </tr>
    )
  }
```

To:

```typescript
  function renderSingleValue(name: ReactNode, value: number) {
    return (
      <tr>
        <td>{name}</td>
        <td className="text-end">
          {formatCurrencyPrecise(value / divisor)}
        </td>
      </tr>
    )
  }
```

**Step 3: Update `renderBreakDown` to apply the divisor**

In `renderBreakDown`, change the breakdown row amount from:

```typescript
            <td className="text-end small" style={{ paddingRight: "2em" }}>{formatCurrencyPrecise(tax.amount)}</td>
```

To:

```typescript
            <td className="text-end small" style={{ paddingRight: "2em" }}>{formatCurrencyPrecise(tax.amount / divisor)}</td>
```

Note: `renderBreakDown` calls `renderSingleValue` for the total, which already divides. Only the breakdown sub-rows need this change.

**Step 4: Update the bold totals in the table headers**

The "Total you pay" and "Total you keep" header rows format values directly. Update both:

Line 64 (combinedTaxes):
```typescript
                {formatCurrencyPrecise(results.combinedTaxes / divisor)}
```

Line 81 (yourMoney):
```typescript
                {formatCurrencyPrecise(results.yourMoney / divisor)}
```

**Step 5: Add the ButtonGroup to the Card.Title**

Replace the Card.Title block (lines 46-48):

```tsx
        <Card.Title>
          Tax breakdown
        </Card.Title>
```

With:

```tsx
        <Card.Title className="d-flex justify-content-between align-items-center">
          Tax breakdown
          <ButtonGroup size="sm">
            {(['annual', 'monthly', 'weekly', 'daily'] as const).map((p) => (
              <Button
                key={p}
                variant={period === p ? 'primary' : 'outline-primary'}
                onClick={() => setPeriod(p)}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Button>
            ))}
          </ButtonGroup>
        </Card.Title>
```

**Step 6: Run the app and verify visually**

Run: `npx vite --open`
Expected: Tax breakdown card shows 4 buttons. Clicking "Monthly" divides all values by 12.

**Step 7: Commit**

```bash
git add src/components/IncomeAnalysis/TaxBreakdown.tsx
git commit -m "feat: add period toggle to Tax Breakdown card (#26)"
```

---

### Task 2: Add tests for the period toggle

**Files:**
- Create: `src/components/IncomeAnalysis/TaxBreakdown.test.tsx`

**Step 1: Write the tests**

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import TaxBreakdown from "./TaxBreakdown";
import type { TaxInputs } from "../../types/tax";

const testInputs: TaxInputs = {
  taxYear: '2024/25',
  studentLoan: [],
  annualGrossSalary: 52000,
  annualGrossBonus: 0,
  annualGrossIncomeRange: 150000,
  residentInScotland: false,
  noNI: false,
  blind: false,
  childBenefits: { mode: 'off', numberOfChildren: 1 },
  pensionContributions: { autoEnrolment: 0, salarySacrifice: 0, personal: 0 },
  autoEnrolmentAsSalarySacrifice: true,
  taxReliefAtSource: true,
  incomeAnalysis: false,
  pensionEnabled: false,
  studentLoanEnabled: false,
};

describe("TaxBreakdown", () => {
  it("renders period toggle with 4 buttons", () => {
    render(<TaxBreakdown inputs={testInputs} />);
    expect(screen.getByRole("button", { name: "Annual" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Monthly" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Weekly" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Daily" })).toBeDefined();
  });

  it("defaults to annual view", () => {
    render(<TaxBreakdown inputs={testInputs} />);
    // £52,000 annual gross income should appear
    expect(screen.getByText("£52,000.00")).toBeDefined();
  });

  it("switches to monthly view when Monthly is clicked", () => {
    render(<TaxBreakdown inputs={testInputs} />);
    fireEvent.click(screen.getByRole("button", { name: "Monthly" }));
    // £52,000 / 12 = £4,333.33
    expect(screen.getByText("£4,333.33")).toBeDefined();
  });

  it("switches back to annual view", () => {
    render(<TaxBreakdown inputs={testInputs} />);
    fireEvent.click(screen.getByRole("button", { name: "Monthly" }));
    fireEvent.click(screen.getByRole("button", { name: "Annual" }));
    expect(screen.getByText("£52,000.00")).toBeDefined();
  });
});
```

**Step 2: Run tests to verify they pass**

Run: `npx vitest run src/components/IncomeAnalysis/TaxBreakdown.test.tsx`
Expected: ALL PASS (4 tests)

**Step 3: Run the full test suite**

Run: `npx vitest run`
Expected: ALL PASS

**Step 4: Commit**

```bash
git add src/components/IncomeAnalysis/TaxBreakdown.test.tsx
git commit -m "test: add tests for period toggle in TaxBreakdown (#26)"
```
