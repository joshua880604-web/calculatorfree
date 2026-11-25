# Prorated Rent Calculator: existing-task review

Reviewed 2026-11-25. Existing canonical route: `/prorated-rent-calculator`.

This is an existing original model, not a new calculator. Scope: complete task presets, guide answer links, and mobile entry visibility. Original vendor DOM/default/viewport parity remains unverified. The model, fields and defaults are unchanged.

Existing explanatory references (retained; not newly externally revalidated):
- [Zillow Rental Manager: Prorated rent](https://www.zillow.com/rentals-network/prorated-rent-calculator/)

## By Billable Dates (`dates`)

Exact existing field specification and default values:

```json
{
  "fields": [
    {
      "key": "monthly_rent",
      "label": "Monthly rent",
      "value": 2000,
      "unit": "$",
      "min": 0,
      "max": 1000000000000
    },
    {
      "key": "start",
      "label": "First billable day (included)",
      "value": "2026-01-17",
      "type": "date"
    },
    {
      "key": "end",
      "label": "Last billable day (included)",
      "value": "2026-01-31",
      "type": "date"
    },
    {
      "key": "basis",
      "label": "Day-count method",
      "value": "Actual days in each month",
      "type": "select",
      "options": [
        "Actual days in each month",
        "30-day month",
        "365-day year",
        "Actual days in each year"
      ]
    }
  ],
  "defaults": {
    "monthly_rent": "2000",
    "start": "2026-01-17",
    "end": "2026-01-31",
    "basis": "Actual days in each month"
  }
}
```

## By Known Billable Days (`days`)

Exact existing field specification and default values:

```json
{
  "fields": [
    {
      "key": "monthly_rent",
      "label": "Monthly rent",
      "value": 2000,
      "unit": "$",
      "min": 0,
      "max": 1000000000000
    },
    {
      "key": "billable_days",
      "label": "Billable days in this calendar month",
      "value": 15,
      "unit": "days",
      "min": 0,
      "max": 31,
      "step": 1
    },
    {
      "key": "month_days",
      "label": "Actual calendar days in this month",
      "value": 31,
      "unit": "days",
      "min": 28,
      "max": 31,
      "step": 1
    },
    {
      "key": "basis",
      "label": "Day-count method",
      "value": "Actual days in each month",
      "type": "select",
      "options": [
        "Actual days in each month",
        "30-day month",
        "365-day year"
      ]
    }
  ],
  "defaults": {
    "monthly_rent": "2000",
    "billable_days": "15",
    "month_days": "31",
    "basis": "Actual days in each month"
  }
}
```

Independent normal/boundary examples, browser task restoration and mobile/desktop evidence: [verification](../five-existing-tasks-20261125.md). No new legal, score-prediction, lender-payment or accounting-compliance determination is introduced.
