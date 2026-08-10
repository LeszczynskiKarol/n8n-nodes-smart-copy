# n8n-nodes-smart-copy

n8n community nodes for [Smart-Copy](https://www.smart-copy.ai) — AI-written, researched texts with featured images and automatic WordPress publishing.

## Nodes

- **Smart-Copy** — actions:
  - *Text → Create*: order a text (topic, length, 9 types, guidelines, SEO keywords, own sources, research mode, AI featured image, WordPress publication: immediate / draft / scheduled).
  - *Text → Get*: status and result of a text (HTML, featured image, WordPress publication links).
  - *Text → Get Many*: recent texts, optionally filtered by WordPress site.
  - *Text → Get Price Estimate*: price quote for a length, without ordering.
  - *Balance → Get*: account balance in PLN with an indicative USD value.
- **Smart-Copy Trigger** — polling trigger:
  - *Text Completed* — fires for every finished text.
  - *Text Failed* — fires when a generation fails (funds are refunded automatically).

## Installation

In n8n: **Settings → Community Nodes → Install** and enter `n8n-nodes-smart-copy`.

Self-hosted (npm):

```bash
npm install n8n-nodes-smart-copy
```

## Credentials

1. Create a Smart-Copy account at [smart-copy.ai](https://www.smart-copy.ai).
2. In the dashboard go to **Developers → API keys** and create a key (`sc_live_…`), or an `sc_test_` key for free integration testing.
3. In n8n create a **Smart-Copy API** credential and paste the key.

Each text is billed from your prepaid Smart-Copy balance (per 1,000 characters). Failed generations are refunded automatically.

## Resources

- [API documentation](https://www.smart-copy.ai/docs/api)
- [Integration page](https://www.smart-copy.ai/integrations/n8n)
- Support: support@smart-copy.ai

## License

MIT
