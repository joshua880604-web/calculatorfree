# Basis Point Calculator: existing-task review

Reviewed 2026-11-25. Existing canonical route: `/basis-point-calculator`.

This is an existing original model, not a new calculator. Scope: complete task presets, guide answer links, and mobile entry visibility. Original vendor DOM/default/viewport parity remains unverified. The model, fields and defaults are unchanged.

Existing explanatory references (retained; not newly externally revalidated):
- [SEC Investor.gov: Basis Point](https://www.investor.gov/introduction-investing/investing-basics/glossary/basis-point)

## Convert BPS, Percent & Decimal (`convert`)

Exact existing field specification and default values:

```json
{
  "fields": [
    {
      "key": "value",
      "label": "Value to convert",
      "value": 25,
      "min": -1000000000,
      "max": 1000000000
    },
    {
      "key": "unit",
      "label": "Input unit",
      "value": "Basis points",
      "type": "select",
      "options": [
        "Basis points",
        "Percent / percentage points",
        "Decimal"
      ]
    }
  ],
  "defaults": {
    "value": "25",
    "unit": "Basis points"
  }
}
```

## Change Between Two Rates (`rate-change`)

Exact existing field specification and default values:

```json
{
  "fields": [
    {
      "key": "start_rate",
      "label": "Starting rate",
      "value": 5,
      "unit": "%",
      "min": -1000000,
      "max": 1000000
    },
    {
      "key": "end_rate",
      "label": "Ending rate",
      "value": 5.25,
      "unit": "%",
      "min": -1000000,
      "max": 1000000
    }
  ],
  "defaults": {
    "start_rate": "5",
    "end_rate": "5.25"
  }
}
```

## Basis Points of an Amount (`amount`)

Exact existing field specification and default values:

```json
{
  "fields": [
    {
      "key": "amount",
      "label": "Amount used as the calculation base",
      "value": 200000,
      "unit": "$",
      "min": 0,
      "max": 1000000000000
    },
    {
      "key": "bps",
      "label": "Basis points to apply",
      "value": 25,
      "unit": "bps",
      "min": -1000000,
      "max": 1000000
    }
  ],
  "defaults": {
    "amount": "200000",
    "bps": "25"
  }
}
```

Independent normal/boundary examples, browser task restoration and mobile/desktop evidence: [verification](../five-existing-tasks-20261125.md). No new legal, score-prediction, lender-payment or accounting-compliance determination is introduced.
