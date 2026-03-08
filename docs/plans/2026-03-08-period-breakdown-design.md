# Period Breakdown Toggle Design

**Issue:** #26 — Add a monthly, weekly, and daily breakdown

**Goal:** Add a toggle to the Tax Breakdown card that lets users view all figures as annual, monthly, weekly, or daily amounts.

## UI

A React-Bootstrap `ButtonGroup` with 4 small outline buttons (`Annual | Monthly | Weekly | Daily`) placed in the `Card.Title` row, right-aligned next to "Tax breakdown". Default: Annual.

## Logic

Pure display-only — no calculation changes. A single divisor applied to every displayed value:
- Annual: ÷ 1
- Monthly: ÷ 12
- Weekly: ÷ 52
- Daily: ÷ 365

A `useState<'annual' | 'monthly' | 'weekly' | 'daily'>` in TaxBreakdown, defaulting to `'annual'`. The `renderSingleValue` and `renderBreakDown` helpers divide values by the divisor before formatting.

## What Doesn't Change

- `calculateTaxes()` — still returns annual figures only
- Types — no changes
- Other components — only TaxBreakdown is affected

## Testing

- Toggle renders with 4 buttons
- Clicking "Monthly" divides displayed values by 12
- "Annual" shows original values
