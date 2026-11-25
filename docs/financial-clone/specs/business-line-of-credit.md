# Business Line of Credit Calculator: existing-task review

Reviewed 2026-11-25. Existing canonical route: `/business-line-of-credit-calculator`.

This is an existing original model, not a new calculator. Scope: complete task presets, guide answer links, and mobile entry visibility. Original vendor DOM/default/viewport parity remains unverified. The model, fields and defaults are unchanged.

Existing explanatory references (retained; not newly externally revalidated):
- [SBA: 7(a) loans and monitored lines of credit](https://www.sba.gov/loans/7a-loans/)

## Constant-Balance Interest (`interest`)

Exact existing field specification and default values:

```json
{
  "fields": [
    {
      "key": "balance",
      "label": "Principal outstanding for every day",
      "value": 25000,
      "unit": "$",
      "min": 0,
      "max": 1000000000000
    },
    {
      "key": "rate",
      "label": "Annual interest rate assumption",
      "value": 12,
      "unit": "%",
      "min": 0,
      "max": 100
    },
    {
      "key": "days",
      "label": "Days interest accrues",
      "value": 30,
      "unit": "days",
      "min": 0,
      "max": 3660,
      "step": 1
    },
    {
      "key": "basis",
      "label": "Simple-interest days per year",
      "value": "365",
      "type": "select",
      "options": [
        "365",
        "360"
      ]
    },
    {
      "key": "fees",
      "label": "Fees paid separately for this period",
      "value": 50,
      "unit": "$",
      "min": 0,
      "max": 1000000000000
    }
  ],
  "defaults": {
    "balance": "25000",
    "rate": "12",
    "days": "30",
    "basis": "365",
    "fees": "50"
  }
}
```

## Dated Draws & Principal Repayments (`ledger`)

Exact existing field specification and default values:

```json
{
  "fields": [
    {
      "key": "start",
      "label": "Start date (included)",
      "value": "2026-12-01",
      "type": "date"
    },
    {
      "key": "end",
      "label": "End date (excluded)",
      "value": "2027-01-01",
      "type": "date"
    },
    {
      "key": "opening",
      "label": "Principal at start before listed transactions",
      "value": 10000,
      "unit": "$",
      "min": 0,
      "max": 1000000000000
    },
    {
      "key": "limit",
      "label": "Entered credit limit",
      "value": 50000,
      "unit": "$",
      "min": 0,
      "max": 1000000000000
    },
    {
      "key": "rate",
      "label": "Annual interest rate assumption",
      "value": 12,
      "unit": "%",
      "min": 0,
      "max": 100
    },
    {
      "key": "basis",
      "label": "Simple-interest days per year",
      "value": "365",
      "type": "select",
      "options": [
        "365",
        "360"
      ]
    },
    {
      "key": "transactions",
      "label": "Date, signed principal change",
      "value": "2026-12-10, 5000\n2026-12-20, -3000",
      "type": "textarea",
      "hint": "Positive draws; negative principal-only repayments. Transactions take effect before that day’s accrual. No currency signs or thousands separators; leave blank for no activity.",
      "optional": true
    },
    {
      "key": "fees",
      "label": "Period fees paid separately",
      "value": 50,
      "unit": "$",
      "min": 0,
      "max": 1000000000000
    }
  ],
  "defaults": {
    "start": "2026-12-01",
    "end": "2027-01-01",
    "opening": "10000",
    "limit": "50000",
    "rate": "12",
    "basis": "365",
    "transactions": "2026-12-10, 5000\n2026-12-20, -3000",
    "fees": "50"
  }
}
```

## Fixed Monthly Payment, No Redraws (`paydown`)

Exact existing field specification and default values:

```json
{
  "fields": [
    {
      "key": "balance",
      "label": "Starting principal",
      "value": 25000,
      "unit": "$",
      "min": 0,
      "max": 1000000000000
    },
    {
      "key": "rate",
      "label": "Annual interest rate assumption",
      "value": 12,
      "unit": "%",
      "min": 0,
      "max": 100
    },
    {
      "key": "payment",
      "label": "Chosen total monthly payment",
      "value": 1000,
      "unit": "$",
      "min": 0,
      "max": 1000000000000
    },
    {
      "key": "monthly_fee",
      "label": "Fee charged each active month",
      "value": 0,
      "unit": "$",
      "min": 0,
      "max": 1000000000000
    },
    {
      "key": "max_months",
      "label": "Maximum modeled months",
      "value": 600,
      "unit": "months",
      "min": 1,
      "max": 1200,
      "step": 1
    }
  ],
  "defaults": {
    "balance": "25000",
    "rate": "12",
    "payment": "1000",
    "monthly_fee": "0",
    "max_months": "600"
  }
}
```

Independent normal/boundary examples, browser task restoration and mobile/desktop evidence: [verification](../five-existing-tasks-20261125.md). No new legal, score-prediction, lender-payment or accounting-compliance determination is introduced.
