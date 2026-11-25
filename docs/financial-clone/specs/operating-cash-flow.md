# Operating Cash Flow Calculator: existing-task review

Reviewed 2026-11-25. Existing canonical route: `/operating-cash-flow-calculator`.

This is an existing original model, not a new calculator. Scope: complete task presets, guide answer links, and mobile entry visibility. Original vendor DOM/default/viewport parity remains unverified. The model, fields and defaults are unchanged.

Existing explanatory references (retained; not newly externally revalidated):
- [SEC: Beginners’ guide to financial statements](https://www.sec.gov/investor/pubs/begfinstmtguide.htm)

## Indirect: Component Changes (`indirect`)

Exact existing field specification and default values:

```json
{
  "fields": [
    {
      "key": "net_income",
      "label": "Net income for the reporting period",
      "value": 120000,
      "unit": "$",
      "min": -1000000000000,
      "max": 1000000000000
    },
    {
      "key": "noncash",
      "label": "Net noncash / nonoperating adjustments",
      "value": 30000,
      "unit": "$",
      "min": -1000000000000,
      "max": 1000000000000,
      "hint": "Signed net amount: add noncash expenses; subtract applicable noncash income or gains. Avoid double counting."
    },
    {
      "key": "ar_change",
      "label": "Increase / (decrease) in operating receivables",
      "value": 15000,
      "unit": "$",
      "min": -1000000000000,
      "max": 1000000000000
    },
    {
      "key": "inventory_change",
      "label": "Increase / (decrease) in inventory",
      "value": 10000,
      "unit": "$",
      "min": -1000000000000,
      "max": 1000000000000
    },
    {
      "key": "other_assets_change",
      "label": "Increase / (decrease) in other operating assets",
      "value": 5000,
      "unit": "$",
      "min": -1000000000000,
      "max": 1000000000000
    },
    {
      "key": "ap_change",
      "label": "Increase / (decrease) in trade payables",
      "value": 8000,
      "unit": "$",
      "min": -1000000000000,
      "max": 1000000000000
    },
    {
      "key": "other_liabilities_change",
      "label": "Increase / (decrease) in other operating liabilities",
      "value": 2000,
      "unit": "$",
      "min": -1000000000000,
      "max": 1000000000000
    }
  ],
  "defaults": {
    "net_income": "120000",
    "noncash": "30000",
    "ar_change": "15000",
    "inventory_change": "10000",
    "other_assets_change": "5000",
    "ap_change": "8000",
    "other_liabilities_change": "2000"
  }
}
```

## Indirect: Known Working-Capital Change (`nwc`)

Exact existing field specification and default values:

```json
{
  "fields": [
    {
      "key": "net_income",
      "label": "Net income for the reporting period",
      "value": 120000,
      "unit": "$",
      "min": -1000000000000,
      "max": 1000000000000
    },
    {
      "key": "noncash",
      "label": "Net noncash / nonoperating adjustments",
      "value": 30000,
      "unit": "$",
      "min": -1000000000000,
      "max": 1000000000000,
      "hint": "Signed net amount: add noncash expenses; subtract applicable noncash income or gains. Avoid double counting."
    },
    {
      "key": "nwc_change",
      "label": "Increase / (decrease) in operating net working capital",
      "value": 20000,
      "unit": "$",
      "min": -1000000000000,
      "max": 1000000000000,
      "hint": "Ending minus beginning operating assets less operating liabilities. Exclude cash and interest-bearing debt."
    }
  ],
  "defaults": {
    "net_income": "120000",
    "noncash": "30000",
    "nwc_change": "20000"
  }
}
```

## Direct: Cash Receipts & Payments (`direct`)

Exact existing field specification and default values:

```json
{
  "fields": [
    {
      "key": "receipts",
      "label": "Net operating cash receipts",
      "value": 600000,
      "unit": "$",
      "min": -1000000000000,
      "max": 1000000000000
    },
    {
      "key": "suppliers",
      "label": "Cash paid to suppliers",
      "value": 300000,
      "unit": "$",
      "min": 0,
      "max": 1000000000000
    },
    {
      "key": "employees",
      "label": "Cash paid to employees",
      "value": 100000,
      "unit": "$",
      "min": 0,
      "max": 1000000000000
    },
    {
      "key": "taxes",
      "label": "Operating income-tax cash payments",
      "value": 30000,
      "unit": "$",
      "min": 0,
      "max": 1000000000000
    },
    {
      "key": "interest",
      "label": "Operating interest cash payments",
      "value": 10000,
      "unit": "$",
      "min": 0,
      "max": 1000000000000
    },
    {
      "key": "other",
      "label": "Other operating cash payments",
      "value": 30000,
      "unit": "$",
      "min": 0,
      "max": 1000000000000
    }
  ],
  "defaults": {
    "receipts": "600000",
    "suppliers": "300000",
    "employees": "100000",
    "taxes": "30000",
    "interest": "10000",
    "other": "30000"
  }
}
```

Independent normal/boundary examples, browser task restoration and mobile/desktop evidence: [verification](../five-existing-tasks-20261125.md). No new legal, score-prediction, lender-payment or accounting-compliance determination is introduced.
