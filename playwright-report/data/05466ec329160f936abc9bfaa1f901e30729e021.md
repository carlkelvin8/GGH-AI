# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: home.spec.ts >> Home Page >> should open proposal generator dialog when CTA is clicked
- Location: e2e\home.spec.ts:25:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('AI Proposal Engine')
Expected: visible
Error: strict mode violation: getByText('AI Proposal Engine') resolved to 2 elements:
    1) <h2 id="radix-_r_1_" class="text-3xl font-black text-slate-900 tracking-tight">AI Proposal Engine</h2> aka getByRole('heading', { name: 'AI Proposal Engine' })
    2) <span class="text-primary font-bold">Welcome to AI Proposal Engine</span> aka getByText('Welcome to AI Proposal Engine')

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('AI Proposal Engine')

```

# Page snapshot

```yaml
- generic:
  - banner:
    - generic:
      - button:
        - img
      - generic:
        - button: Sign in
  - main:
    - generic:
      - generic:
        - generic:
          - img
          - generic: AI-Powered Proposal Excellence
        - generic:
          - heading [level=1]: GGH Proposal AI
          - paragraph: Transform your project vision into winning proposals. Our OpenClaw-powered engine crafts enterprise-grade documents in minutes.
        - generic:
          - button [expanded]:
            - img
            - text: Generate Your Next Proposal
            - img
          - button: See Examples
        - generic:
          - heading [level=2]: Key Features
          - generic:
            - generic:
              - img
            - heading [level=3]: OpenClaw Agentic Flow
            - paragraph: Our high-fidelity OpenClaw agent deeply analyzes requirements to craft compelling executive summaries.
          - generic:
            - generic:
              - img
            - heading [level=3]: Enterprise Quality
            - paragraph: Every word is tuned to meet the highest industry standards for technical precision and professional impact.
          - generic:
            - generic:
              - img
            - heading [level=3]: Rapid Iteration
            - paragraph: Regenerate sections, track your history, and refine your approach with zero friction. Proposals built for speed.
      - generic:
        - generic:
          - generic: Next.js 14+
          - generic: TypeScript
          - generic: TanStack Query
          - generic: Zustand
        - paragraph: © 2026GGH Software Development Services — Proposals that win.
  - generic:
    - generic:
      - generic:
        - generic:
          - img
          - generic: You're offline
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e6] [cursor=pointer]:
    - img [ref=e7]
  - alert
  - dialog "AI Proposal Engine" [ref=e11]:
    - generic [ref=e12]:
      - generic [ref=e13]:
        - generic [ref=e16]:
          - generic [ref=e17]:
            - generic [ref=e18]:
              - img [ref=e20]
              - heading "AI Proposal Engine" [level=2] [ref=e23]
              - generic [ref=e24]: v2.0 OpenClaw
            - paragraph [ref=e25]: Transform your project vision into winning proposals with our advanced AI engine.Enterprise-grade quality in minutes.
          - generic [ref=e26]:
            - generic [ref=e27]:
              - generic [ref=e28]: 2.3s
              - generic [ref=e29]: Avg Generation
            - generic [ref=e31]:
              - generic [ref=e32]: 98%
              - generic [ref=e33]: Success Rate
            - generic [ref=e35]:
              - generic [ref=e36]: 4.9★
              - generic [ref=e37]: User Rating
        - generic [ref=e38]:
          - generic [ref=e39]:
            - generic [ref=e40]: 🤖
            - generic [ref=e41]: AI-Powered
          - generic [ref=e42]:
            - generic [ref=e43]: ⚡
            - generic [ref=e44]: Real-time
          - generic [ref=e45]:
            - generic [ref=e46]: 🎯
            - generic [ref=e47]: Customizable
          - generic [ref=e48]:
            - generic [ref=e49]: 📊
            - generic [ref=e50]: Analytics
          - generic [ref=e51]:
            - generic [ref=e52]: 🔒
            - generic [ref=e53]: Enterprise
      - generic [ref=e61]:
        - generic [ref=e62]:
          - generic [ref=e63]:
            - img [ref=e64]
            - generic [ref=e67]: Welcome to AI Proposal Engine
          - heading "Create Winning Proposals in Minutes" [level=1] [ref=e68]
          - paragraph [ref=e69]: Transform your project ideas into professional, compelling proposals with the power of AI
        - generic [ref=e70]:
          - generic [ref=e72]:
            - generic [ref=e73]:
              - img [ref=e75]
              - generic [ref=e78]:
                - heading "AI-Powered Generation" [level=3] [ref=e79]
                - generic [ref=e85]: 1 of 3
            - paragraph [ref=e86]: Our advanced OpenClaw engine analyzes your requirements and generates professional proposals in seconds.
            - generic [ref=e87]:
              - generic [ref=e88]:
                - img [ref=e89]
                - generic [ref=e92]: Smart content generation
              - generic [ref=e93]:
                - img [ref=e94]
                - generic [ref=e97]: Industry best practices
              - generic [ref=e98]:
                - img [ref=e99]
                - generic [ref=e102]: Professional formatting
            - button "Next" [active] [ref=e104]:
              - text: Next
              - img
          - generic [ref=e105]:
            - generic [ref=e107]:
              - generic [ref=e108]:
                - img [ref=e109]
                - heading "Lightning Fast" [level=4] [ref=e111]
              - generic [ref=e112]:
                - generic [ref=e113]:
                  - generic [ref=e114]: 2.3s
                  - generic [ref=e115]: Average Generation
                - generic [ref=e116]:
                  - generic [ref=e117]: 98%
                  - generic [ref=e118]: Success Rate
            - generic [ref=e120]:
              - generic [ref=e121]:
                - img [ref=e122]
                - heading "Enterprise Grade" [level=4] [ref=e124]
              - generic [ref=e125]:
                - generic [ref=e126]:
                  - img [ref=e127]
                  - generic [ref=e130]: SOC 2 Compliant
                - generic [ref=e131]:
                  - img [ref=e132]
                  - generic [ref=e135]: End-to-end Encryption
                - generic [ref=e136]:
                  - img [ref=e137]
                  - generic [ref=e140]: GDPR Compliant
            - generic [ref=e142]:
              - generic [ref=e143]:
                - img [ref=e144]
                - heading "Smart Analytics" [level=4] [ref=e146]
              - paragraph [ref=e147]: Track proposal performance, client engagement, and conversion rates with built-in analytics.
        - generic [ref=e148]:
          - button "Skip Introduction" [ref=e149]
          - button "Start Creating" [ref=e151]:
            - img
            - text: Start Creating
      - generic [ref=e153]:
        - generic [ref=e154]:
          - generic [ref=e157]: AI Engine Online
          - generic [ref=e158]: •
          - generic [ref=e159]: Powered by OpenClaw v4.0
          - generic [ref=e160]: •
          - generic [ref=e161]: Enterprise Security
        - generic [ref=e162]:
          - generic [ref=e163]: Ctrl
          - generic [ref=e164]: +
          - generic [ref=e165]: Enter
          - generic [ref=e166]: to generate
    - button "Close" [ref=e167]:
      - img [ref=e168]
      - generic [ref=e171]: Close
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Home Page', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/');
  6  |   });
  7  | 
  8  |   test('should load the home page successfully', async ({ page }) => {
  9  |     await expect(page).toHaveTitle(/GGH/i);
  10 |     await expect(page.locator('h1')).toContainText('GGH');
  11 |     await expect(page.locator('h1')).toContainText('Proposal AI');
  12 |   });
  13 | 
  14 |   test('should display hero section with CTA button', async ({ page }) => {
  15 |     const ctaButton = page.getByRole('button', { name: /generate your next proposal/i });
  16 |     await expect(ctaButton).toBeVisible();
  17 |   });
  18 | 
  19 |   test('should display feature cards', async ({ page }) => {
  20 |     await expect(page.getByText('OpenClaw Agentic Flow')).toBeVisible();
  21 |     await expect(page.getByText('Enterprise Quality')).toBeVisible();
  22 |     await expect(page.getByText('Rapid Iteration')).toBeVisible();
  23 |   });
  24 | 
  25 |   test('should open proposal generator dialog when CTA is clicked', async ({ page }) => {
  26 |     const ctaButton = page.getByRole('button', { name: /generate your next proposal/i });
  27 |     await ctaButton.click();
  28 |     
> 29 |     await expect(page.getByText('AI Proposal Engine')).toBeVisible();
     |                                                        ^ Error: expect(locator).toBeVisible() failed
  30 |     await expect(page.getByText('Project Context')).toBeVisible();
  31 |   });
  32 | 
  33 |   test('should have accessible navigation', async ({ page }) => {
  34 |     const ctaButton = page.getByRole('button', { name: /generate your next proposal/i });
  35 |     await expect(ctaButton).toBeEnabled();
  36 |     
  37 |     // Check keyboard navigation
  38 |     await ctaButton.focus();
  39 |     await expect(ctaButton).toBeFocused();
  40 |   });
  41 | });
  42 | 
```