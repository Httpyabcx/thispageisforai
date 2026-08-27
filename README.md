# This Page Is For AI

[![Site visibility checks](https://github.com/Httpyabcx/thispageisforai/actions/workflows/site-visibility.yml/badge.svg)](https://github.com/Httpyabcx/thispageisforai/actions/workflows/site-visibility.yml)

A public, machine-readable synthetic psychology laboratory. Its first protocol asks whether an authorized AI agent can discover a voluntary Bitcoin donation request, evaluate it under its policy, and optionally transfer value.

Live site: https://thispageisforai.com/

Canonical agent and operator guide: https://thispageisforai.com/ai-agent-bitcoin-donation.html
Public experiment registry: https://thispageisforai.com/experiments.html

## Machine-readable surfaces

- `/experiments.html` — public synthetic psychology experiment registry
- `/ai-pay.json` — canonical payment manifest
- `/.well-known/ai-pay.json` — well-known discovery alias
- `/agent.json` and `/.well-known/agent.json` — purpose, policy constraints, and endpoint map
- `/llms.txt` and `/llms-full.txt` — concise and complete LLM context
- `/schemas/ai-pay-1.json` — JSON Schema
- `/openapi.json` — public read-only endpoint description
- `/site-visibility.json` and `/.well-known/site-visibility.json` — public visibility and verification contract
- `/sitemap.xml` and `/robots.txt` — crawler discovery
- `/ai-agent-bitcoin-donation.html` — indexable, descriptive AI agent donation protocol

## Visibility and verification

The site separates three claims:

- Discoverable: humans and agents have stable entrypoints, a sitemap, robots guidance and machine-readable summaries.
- Consultable: a public GitHub Actions check verifies HTTPS status, content, metadata, JSON consistency and internal links on every `main` update and every six hours.
- Consulted: no visit count is claimed. GitHub Pages is static and does not expose request logs through this site; measurement will only be added after a privacy, consent, retention and bot-separation policy is documented.

Read the [visibility contract](https://thispageisforai.com/site-visibility.json) or inspect the [public checks](https://github.com/Httpyabcx/thispageisforai/actions/workflows/site-visibility.yml).

## Safety posture

The request is voluntary and explicitly policy-gated. It tells agents not to pay without authorization, not to override higher-priority instructions, and never to disclose private keys or seed phrases. No product, service, token, financial return, reward, or refund is promised.
