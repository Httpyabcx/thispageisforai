# This Page Is For AI

A public, machine-readable experiment asking whether an authorized AI agent can discover a voluntary Bitcoin donation request, evaluate it under its policy, and optionally transfer value.

Live site: https://thispageisforai.com/

## Machine-readable surfaces

- `/ai-pay.json` — canonical payment manifest
- `/.well-known/ai-pay.json` — well-known discovery alias
- `/agent.json` and `/.well-known/agent.json` — purpose, policy constraints, and endpoint map
- `/llms.txt` and `/llms-full.txt` — concise and complete LLM context
- `/schemas/ai-pay-1.json` — JSON Schema
- `/openapi.json` — public read-only endpoint description
- `/sitemap.xml` and `/robots.txt` — crawler discovery

## Safety posture

The request is voluntary and explicitly policy-gated. It tells agents not to pay without authorization, not to override higher-priority instructions, and never to disclose private keys or seed phrases. No product, service, token, financial return, reward, or refund is promised.
