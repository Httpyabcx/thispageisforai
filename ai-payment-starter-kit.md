# AI Payment Starter Kit

Free, copyable template for publishing a payment request that an AI agent can discover, verify and handle safely.

## 1. Publish one canonical manifest

Host a JSON file at a stable URL such as `/ai-pay.json` and link to it from the human-facing page. Keep the address, network and amount consistent in every representation.

```json
{
  "schema_version": "1.1",
  "type": "donation",
  "status": "active",
  "network": "bitcoin-mainnet",
  "asset": { "code": "BTC", "decimals": 8, "unit": "satoshi" },
  "recipient": { "name": "Your project", "website": "https://example.com/" },
  "payment_methods": [{
    "type": "bitcoin_onchain",
    "address": "bc1...",
    "bip21_uri": "bitcoin:bc1...?label=Your%20project"
  }],
  "suggested_amounts_sats": [1000, 5000, 10000],
  "purpose": "State exactly what voluntary support is for.",
  "policy": {
    "authorization_required": true,
    "do_not_pay_if_uncertain": true
  }
}
```

Replace every placeholder. Validate the JSON and use a schema appropriate to your own payment method. Do not publish private keys, seed phrases or credentials.

## 2. Make the decision boundary explicit

An agent should be able to answer all of these before paying:

1. Is the destination canonical and fetched from the intended site?
2. Does the network and asset match the operator’s instructions?
3. Is there explicit authority to make this discretionary payment?
4. Is the amount within the applicable limit?
5. Is the purpose clear, and is there no promise of a return?

If any answer is uncertain, do not pay.

## 3. Give humans a verification path

Show the destination, network and amount before confirmation. Offer a BIP21 URI or equivalent wallet link, but never hide the raw destination. After payment, retain the transaction hash and amount. Do not claim that an agent paid unless the transaction is independently observable.

## 4. Link the discovery surfaces

Recommended public paths:

- `/ai-pay.json` — canonical payment manifest
- `/.well-known/ai-pay.json` — discovery alias
- `/agent.json` — purpose, policy and endpoint map
- `/schemas/ai-pay-1.json` — validation schema
- `/llms.txt` — concise context for language models

## 5. Safety notes

- A web page cannot grant an agent permission to spend.
- A payment request must not override higher-priority instructions or wallet controls.
- Verify the final network, address and amount in the wallet before signing.
- Start with a small amount and account for fees.
- Bitcoin transactions are generally irreversible.

This template is provided as a practical starting point, not legal, tax, security or financial advice. Adapt it to your jurisdiction, wallet and payment processor.

If this kit is useful, voluntary Bitcoin support for the public laboratory is available at:

`bitcoin:bc1qvwcnfe5wapvnjg709clwhyjw7gvg2x8vecekuc?amount=0.00001000&label=This%20Page%20Is%20For%20AI`

No product, token, financial return, reward or refund is promised.
