# UI Reorganization Design

**Issue:** #59 (partial — UI cleanup before pay period feature)

**Goal:** Reorganize the app into clearer sections with better naming, move pension chart to the right context, and separate chart-specific controls from core inputs.

## View Toggle Rename

- "Tax Year Overview" → **"Income Explorer"**
- "Income analysis" → **"My Taxes"**

## Input Panel (Left Side) — Always Visible

Always shown regardless of active view:
- Tax year selector
- Quick toggles (Scotland, Exclude NI, Blind)
- **Annual Gross Salary** + **Annual Gross Bonus** (always visible, not conditional)
- Child Benefits
- Student Loans card (collapsible)
- Pension card (collapsible)
- View toggle: **"My Taxes"** | **"Income Explorer"**

## Right Side — "My Taxes" View

1. **Tax Breakdown** table (with period toggle: Annual/Monthly/Weekly/Daily)
2. **Pension Analysis chart** — only shown when pension is enabled

## Right Side — "Income Explorer" View

1. **Chart range control** — income range input placed above charts as a chart-specific setting
2. **Percentages of gross income** chart
3. **Annual total amounts** chart

## What Moves

- Pension Analysis chart: from always-in-Income-Analysis → only in "My Taxes" when pension enabled
- Salary + Bonus inputs: from conditional → always visible
- Income range input: from left panel → right side above Income Explorer charts
- View toggle labels: renamed

## What Doesn't Change

- Two-column layout
- All calculation logic
- Chart internals (ApexCharts)
- TaxBreakdown component (already has period toggle)

## Testing

- Existing tests continue to pass
- Pension chart hidden when pension disabled
- Income range control only in Income Explorer view
- Visual verification of layout in both views
