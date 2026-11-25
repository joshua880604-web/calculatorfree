# Credit Utilization Calculator: existing-task review

Reviewed 2026-11-25. Existing canonical route: `/credit-utilization-calculator`.

This is an existing original model, not a new calculator. Scope: complete task presets, guide answer links, and mobile entry visibility. Original vendor DOM/default/viewport parity remains unverified. The model, fields and defaults are unchanged.

Existing explanatory references (retained; not newly externally revalidated):
- [CFPB: building and maintaining a good credit score](https://www.consumerfinance.gov/ask-cfpb/how-do-i-get-and-keep-a-good-credit-score-en-318/)
- [myFICO: how scores consider credit card limits](https://www.myfico.com/credit-education/credit-scores/fico-scores-credit-limit)

## Card Balances & Targets (`cards`)

Exact existing field specification and default values:

```json
{
  "fields": [
    {
      "key": "cards",
      "label": "Card balances and limits",
      "value": "1500, 5000\n500, 5000",
      "type": "textarea",
      "hint": "One card per line: balance, credit limit. No card names or account numbers; omit thousands separators."
    },
    {
      "key": "target",
      "label": "Utilization target",
      "value": 30,
      "unit": "%",
      "min": 0,
      "max": 100
    }
  ],
  "defaults": {
    "cards": "1500, 5000\n500, 5000",
    "target": "30"
  }
}
```

Independent normal/boundary examples, browser task restoration and mobile/desktop evidence: [verification](../five-existing-tasks-20261125.md). No new legal, score-prediction, lender-payment or accounting-compliance determination is introduced.
