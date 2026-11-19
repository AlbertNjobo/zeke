# Competitive & Solution Landscape: Procurement Software and AI Procurement Assistants (UAE/GCC, SME & Mid-Market, 2026)

Scope note: research focused on UAE/GCC and SME/mid-market relevance. "Zeke scope doc" below refers to the repo PDF *Zeke: a from-scratch procurement agent* (`/home/aj/Projects/zeke/Zeke_ a from-scratch procurement agent - Grok Bot.pdf`), which is a planning/scope document, not an external market source; it is used here for scorecard and positioning context. All external links were checked around 18–19 Nov 2026. Speculation is labelled explicitly.

## 1. What capabilities do incumbent enterprise suites require, and why are they heavy for SMEs?

### Takeaway
Enterprise Source-to-Pay suites (SAP Ariba, Oracle, Coupa, Zycus, GEP, Ivalua, plus JAGGAER) deliver deep, governed, full-lifecycle procurement but are architected for large enterprises: multi-month implementations, ERP prerequisites, six-figure budgets, per-supplier onboarding, and dedicated procurement teams. Gartner's own market description says strategic sourcing suites are used primarily by companies with **$800M+ annual revenue**, which structurally excludes UAE SMEs.

### Cited Findings
- SAP Ariba implementation timelines range from **~4 months at the fast end to 18 months** for large, complex, multi-region and multi-ERP environments; the driver is scope, business readiness, and integration to the financial system/ERP — [Optis Consulting FAQ](https://optisconsulting.com/frequently-asked-questions-sap-ariba/). SAP prescribes the **SAP Activate** methodology and Cloud ALM project templates — [SAP Learning](https://learning.sap.com/courses/planning-end-to-end-deployment-of-sap-ariba-strategic-sourcing-suite/describing-the-deployment-process-and-the-sap-activate-methodology).
- ERP implementation cost is cited **up to USD 750,000**, framed as a major investment that must be de-risked — [WalkMe](https://www.walkme.com/blog/sap-ariba-implementation/). Ariba rollout guidance explicitly includes **supplier enablement/onboarding, ERP integration, migration and testing** — [LeverX](https://leverx.com/en-gb/blog/sap-ariba-implementation-guide-uk).
- SAP Business Network charges **transaction service fees** determined monthly from trailing-12-month transaction volume/document count — [SAP Ariba support](https://support.ariba.com/item/view/168238).
- Gartner: strategic sourcing application suites are "used primarily by companies with **$800 million or more in annual revenue**" that have the necessary scale — [Gartner Peer Insights market page](https://www.gartner.com/reviews/market/strategic-sourcing-application-suites) (full page returned HTTP 403; statement taken from the indexed search snippet — flagged as lower-confidence but from a primary Gartner URL).
- The five Gartner Leaders commonly listed for procurement automation are **Ivalua, Coupa, GEP, SAP and Oracle** — [Ivalua blog](https://www.ivalua.com/blog/procurement-automation-software/). Mid-market shortlists still centre on **Coupa, SAP Ariba, JAGGAER, Ivalua, GEP SMART and Precoro** — [VendorXray](https://vendorxray.com/blog/best-procurement-software-mid-market-2026); [CostBench](https://costbench.com/best/best-procurement-for-mid-market/).
- **Zycus Merlin Agentic Platform** runs "governed agentic flows" — intake, sourcing, negotiation, contract value recovery — **inside Zycus Source-to-Pay**, and is a DIY low-code agent-orchestration layer — [Zycus](https://www.zycus.com/solution/merlin-agentic-ai-platform) (page returned 503 on fetch; description from indexed snippet). Zycus launched its Merlin AI suite in **2018** and holds **32+ patents** focused on Source-to-Pay — [Viewpoint Analysis](https://www.viewpointanalysis.com/post/who-are-zycus) (secondary source).
- **GEP Quantum Intelligence** is an AI-native agentic platform that began **consolidating GEP SMART in 2026** — [JAGGAER blog](https://www.jaggaer.com/blog/gep-smart-vs-zycus); [GEP blog](https://webuat.gep.com/blog/technology/gep-qi-agentic-ai-procurement-orchestration). Zycus and GEP are both described as Leaders in a 2026 Gartner MQ for S2P Suites — [Increditools](https://increditools.com/zycus-vs-gep-product-first-procurement-ai-vs-software-plus-services-bundle/) (low-authority aggregator; treat claim cautiously).
- **JAGGAER** serves **1,400+ complex global enterprises**, manages **$2.9T annual spend**, has a **13M+ supplier community**, integrates with **40+ ERPs** (and JAGGAER Link to **1,000+ systems**), and its JAI "AI Workers" (Purchasing, Sourcing, Contracts Advisors) operate with **human approval at every checkpoint**, audit logs and ISO 42001 — [JAGGAER](https://www.jaggaer.com/).
- Per-supplier ERP onboarding is expensive: METIS claims the "One Vendor" model removes individual supplier ERP onboarding, saving **USD 1,500–3,000 per supplier** — [CollectiveSpend](https://www.collectivespend.com/blog/how-metis-transforms-procurement-speed/) (vendor claim).

### Inferences
- The SME burden is structural, not cosmetic: suites assume an ERP/finance system to integrate with, a procurement function to operate them, and a budget for consultancy and change management. A UAE SME with 20–200 staff and no ERP is not the intended buyer.
- Even the "agentic" re-skinning from incumbents (Merlin, GEP Quantum, JAGGAER JAI) is sold as a governed layer *inside* a full S2P suite — it does not remove the underlying implementation, ERP and supplier-onboarding overhead.
- Lightweight/mid-market alternatives exist (Precoro, Zapro, vendorxray-type tools) but are still "platforms you log into," not a coworker operating in the supplier's inbox. Zeke's wedge is the absence of an ERP prerequisite and a no-supplier-login channel model.

### Gaps
- No reliable public per-seat/per-module price list for Coupa, Oracle, Ivalua or GEP in the SME band; vendors use "request a quote." Concrete cost comparisons would need analyst or customer interviews.
- Could not independently verify the Gartner $800M claim beyond the search snippet (Gartner page 403).
- No UAE-specific implementation/partner cost data for any of these suites was found in this pass.

## 2. Which regional platforms exist in the UAE/GCC and what niche do they occupy?

### Takeaway
The GCC landscape splits into (a) government e-tendering portals, (b) regional e-sourcing suites now absorbed into global vendors, and (c) one notable Dubai-born AI-native tail-spend platform (METIS) that is the closest direct competitor to Zeke. None of the government or marketplace platforms serve the private-sector SME "one buyer chasing quotes over WhatsApp" job.

### Cited Findings
- **Etimad** (Saudi Arabia) is the government's unified e-procurement platform, operated by the National Center for Government Procurement under the Ministry of Finance; it covers tenders, contracts, budgets, payments and supplier registration, with **over 283,000 tenders published** — [NCGR](https://www.ncgr.gov.sa/en/etimad-platform); [Bidovate GCC guide](https://global.bidovate.co/blog/gcc-government-procurement-portals-etimad-adgpg-capt-guide) (secondary).
- **eSupply** is the official Dubai Government procurement portal for online tenders/RFX from **40+ Dubai Government entities** — [eSupply Dubai](https://esupply.dubai.gov.ae/esupply/web/index.html).
- **Tejari**, historically a UAE/GCC e-sourcing platform, now **redirects to JAGGAER**, confirming its absorption into a global suite — [tejari.com → jaggaer.com](https://www.tejari.com/). Its regional niche is now effectively JAGGAER's enterprise S2P offering.
- **CollectiveSpend / METIS**: an AI-native tail-spend platform **built in Dubai (company there since 2012)**, bilingual English/Arabic, operating across UAE, Saudi Arabia, Qatar, Bahrain, Kuwait and Oman — [CollectiveSpend](https://www.collectivespend.com/); [Gartner Peer Insights product page](https://www.gartner.com/reviews/product/metis).
- METIS is explicitly aimed at both "enterprises drowning in tail spend" and **"growing companies without a procurement team,"** with go-live in **under 72 hours** and "pay only for what you use" — [CollectiveSpend](https://www.collectivespend.com/blog/how-metis-transforms-procurement-speed/).
- Other named GCC portals in the regional guide include **ADGPG (Abu Dhabi) and CAPT (Qatar)** — [Bidovate](https://global.bidovate.co/blog/gcc-government-procurement-portals-etimad-adgpg-capt-guide).

### Inferences
- Government portals are tender-publishing/bidding systems for suppliers dealing with the public sector; they are not buyer-side SME sourcing assistants. They are adjacent context, not competitors.
- Tejari's absorption into JAGGAER shows the regional e-sourcing niche consolidating into global suites — reinforcing the gap for an independent, lightweight private-sector tool.
- METIS occupies the most dangerous position for Zeke: Dubai-based, AI-native, Gulf-localised, tail-spend-focused, and explicitly targeting firms without procurement teams. Zeke must differentiate on *channel/interface* (coworker in email/WhatsApp, no buyer or supplier login) and on *governance primitives* (AED spend cap, named human approvals, append-only audit log), not on "we do AI sourcing in the GCC."

### Gaps
- No independently verified current pricing for METIS (Capterra/SoftwareAdvice/Gartner Peer Insights pages exist but could not be fully retrieved in this pass).
- Little detail found on the extent to which Etimad/eSupply are used by *private* SMEs (they appear government-facing).
- B2B marketplaces in the region (e.g. general trade/wholesale platforms) were not researched in depth; treated as adjacent, not direct, competitors.

## 3. Are there AI-native procurement agents that send RFQs from their own inbox/WhatsApp and compare quotes? What is differentiated?

### Takeaway
Yes — agentic procurement is a crowded 2026 category. Zinit (multichannel RFx outreach, supplier-funded) and METIS (Dubai, autonomous sourcing-to-PO) are the closest analogues, and incumbent suites (Zycus, GEP, JAGGAER) all ship agents. What is *not yet clearly owned by anyone* is a **named coworker that sends from its own inbox/WhatsApp number, requires no supplier login, and gates new suppliers, spend and the PO behind named human approvals** — that combination is Zeke's plausible differentiator, but the claim must be framed carefully because adjacent products cover parts of it.

### Cited Findings
- **Zinit**: "AI agents that run procurement," claiming **15%+ savings, 2x faster**, **103M+ suppliers**, **<1 hour setup**, **90%+ adoption**; its **Supplier Communication Agent** "sends, tracks, and follows up on RFx invitations across all shortlisted suppliers via multiple channels: **email, text, calls, LinkedIn**. Zero manual touchpoints." Other agents cover discovery, negotiation, RFx/SoW drafting, policy, audit and compliance — [Zinit](https://zinit.com/). Zinit is **supplier-funded — free to buyers**, contrasts itself with "legacy eSourcing 6–18 month implementation," and serves **200+ enterprise clients, $10B+ spend awarded** — [Zinit](https://zinit.com/).
- **METIS** accepts requests in plain language/PDF/email/BoQ, then autonomously does supplier discovery, RFQ generation, bid scoring, negotiation and PO issuance **end-to-end in under 72 hours**, claiming **8–12% below-market negotiation savings**, **75% automation of manual effort**, configurable approval workflows and a **full audit trail on every transaction** — [CollectiveSpend](https://www.collectivespend.com/blog/how-metis-transforms-procurement-speed/).
- **JAGGAER JAI Sourcing Advisor** drafts the RFQ and scores supplier bids; JAI runs with "human approval at every checkpoint" and audit logs — [JAGGAER](https://www.jaggaer.com/).
- **Zycus Merlin** and **GEP Quantum** both market governed agentic sourcing/negotiation inside their suites — [Zycus](https://www.zycus.com/solution/merlin-agentic-ai-platform); [GEP](https://webuat.gep.com/blog/technology/gep-qi-agentic-ai-procurement-orchestration).
- The Zeke scope doc itself lists the competitive set as **Zycus Merlin, GEP Quantum, Zinit, Vertice, Ramp, Zip, and CollectiveSpend METIS**, and defines Zeke as a lightweight coworker for UAE/Africa SME and mid-market buyers using WhatsApp and email, stock-triggered reordering, and no ERP — [Zeke scope doc (repo PDF)](file:///home/aj/Projects/zeke/Zeke_%20a%20from-scratch%20procurement%20agent%20-%20Grok%20Bot.pdf).
- Zeke's intended mechanism (from the scope doc): agent-owned inbox (Resend) and WhatsApp Business number; portal is a control room for the buyer, **suppliers do not log in**; RFQs/chases/POs wait for named approval; every proposal/approval/send/parse is an append-only audit event — [Zeke scope doc](file:///home/aj/Projects/zeke/Zeke_%20a%20from-scratch%20procurement%20agent%20-%20Grok%20Bot.pdf).

### Inferences
- The differentiator is **interface + trust model**, not raw AI capability. Zinit and METIS already do discovery, RFQ, scoring and negotiation; a judge could reasonably say "this is done." Zeke's defensible story is the *last mile to the supplier*: reach them where they already are, from an identity the buyer controls, with no portal onboarding, and with hard governance gates (AED cap, named approvals, audit).
- Zinit's supplier-funded/free-to-buyer model and METIS's "pay only for what you use" show that **business-model innovation** (who pays) is itself a competitive axis a new entrant must address.
- None of the sources found explicitly claims an **agent-owned WhatsApp *outbound* number** for cold RFQs — the scope doc itself notes WhatsApp templates/24-hour window make outbound hard, so this is a *potential* differentiator that is technically constrained, not a proven moat.

### Gaps
- No source found confirming that any competitor sends RFQs from a self-owned WhatsApp number at scale; absence of evidence, not evidence of absence.
- Could not retrieve details on Vertice, Ramp or Zip in this pass; they appear to be spend-management/fintech adjacent players.
- Whether Zinit/METIS require supplier logins was not confirmed from primary sources; infer from "platform/adoption" framing only.

## 4. What are the main trust and deliverability objections to cold supplier outreach, and how do credible products address them?

### Takeaway
First-contact supplier outreach is the riskiest part of the concept: it can be treated as spam, damage sending-domain or WhatsApp quality scores, and most messaging APIs structurally block cold initiation. Credible products respond with explicit approval gates, consent, rate limits, opt-outs, idempotency and append-only audit logs — and, in the prototype, by demoting WhatsApp to inbound-only or using consenting test suppliers.

### Cited Findings
(Primary source for this section is the Zeke scope doc's research on channel policies, checked 18 Nov 2026; it is a planning document and should be independently verified before external use.)
- "A first email or WhatsApp message to a supplier the buyer has never used can **look like spam, can hurt the sending domain**, and on WhatsApp **may require an approved template if no customer-service window is open**." The shortlist approval card must show exact message, channel and new-supplier status; the demo should use **consenting test suppliers**, not a live blast — [Zeke scope doc](file:///home/aj/Projects/zeke/Zeke_%20a%20from-scratch%20procurement%20agent%20-%20Grok%20Bot.pdf).
- WhatsApp-specific: "A first RFQ to a supplier who has never messaged the business **will be dropped unless an approved utility template exists**. Personal WhatsApp numbers will not work." Mitigation: official WhatsApp adapter, submit a utility RFQ template, use Meta's test sender and consenting suppliers; if review lags, film **email as outbound and WhatsApp as reply channel** — [Zeke scope doc](file:///home/aj/Projects/zeke/Zeke_%20a%20from-scratch%20procurement%20agent%20-%20Grok%20Bot.pdf).
- Instagram and Messenger "cannot start conversations" and have 0 triggers; cold DMs would fail. LinkedIn messaging is "not for outreach" without partner API access. These channels are therefore inbound-only/post-January — [Zeke scope doc](file:///home/aj/Projects/zeke/Zeke_%20a%20from-scratch%20procurement%20agent%20-%20Grok%20Bot.pdf).
- "Do not spray every channel": simultaneous email + WhatsApp + phone first contact "will look like spam, can harm the sending domain or a WhatsApp quality score, and is a poor trust story for the jury." Multi-channel is a **fallback after a missed reply**, not a blast — [Zeke scope doc](file:///home/aj/Projects/zeke/Zeke_%20a%20from-scratch%20procurement%20agent%20-%20Grok%20Bot.pdf).
- Trust controls: include an **opt-out honoured immediately**, cap contact frequency, use **idempotency keys** to stop double sends on retries, and record every proposal/approval/send/skip/parse as an **append-only audit event**; inbound text is treated as untrusted data, never instructions — [Zeke scope doc](file:///home/aj/Projects/zeke/Zeke_%20a%20from-scratch%20procurement%20agent%20-%20Grok%20Bot.pdf).
- Enterprise framing supports the same emphasis: JAGGAER markets "guardrails you control," least-privilege access, human approval checkpoints and audit logs; Zycus Merlin is explicitly "governed" — [JAGGAER](https://www.jaggaer.com/); [Zycus](https://www.zycus.com/solution/merlin-agentic-ai-platform).

### Inferences
- The trust story is a *product feature*, not fine print: showing the exact outbound copy, channel and "new supplier" flag on an approval card is what converts a deliverability risk into a demonstrable control judges can see.
- The honest MVP is **email-first outbound, WhatsApp reply/inbound** unless a Meta utility template is approved in time. Over-promising WhatsApp cold outreach would damage both Technical Execution (20%) and Trust (15%) scores.
- Enterprise incumbents' guardrails/audit framing validates that "human-in-the-loop + audit" is the category's trust language; Zeke's AED spend cap is a more concrete, locally legible expression of it.

### Gaps
- No independent deliverability statistics (spam complaint thresholds, sender-reputation benchmarks) were gathered; claims rest on the scope doc and general platform-policy knowledge.
- Meta/WhatsApp Business Messaging Policy and LinkedIn API terms were not fetched directly from primary sources in this pass — verify before citing externally.
- No GCC-specific anti-spam/privacy regulation (e.g. UAE PDPL / TDRA rules) analysis was performed; likely relevant to cold outreach but outside this pass.

## 5. Where could a lightweight AI coworker plausibly fit and be defensible?

### Takeaway
The whitespace is between basic accounting/bookkeeping tools (which handle VAT/e-invoicing, not sourcing) and heavy suites/agent platforms (which assume scale, ERP and procurement staff). A defensible position is a **no-ERP, email/WhatsApp-first coworker with hard governance primitives** for a single UAE buyer — but defensibility must come from accumulated workflow/supplier data and trust, not from "AI sourcing," which incumbents already claim.

### Cited Findings
- UAE SMEs' actual software stack is accounting-led: **Xero, Zoho Books, QuickBooks Online, Wafeq, Odoo, Tally, Sage** — chosen for VAT/e-invoicing, corporate tax, multi-currency and local compliance. Wafeq is highlighted as UAE-focused with local compliance and simplicity — [Maaliya](https://www.maaliya.ae/resources/articles/best-accounting-software-uae-smes/); [Wafeq](https://www.wafeq.com/en/business-hub/for-business/best-accounting-software-uae); [QuickTax](https://quicktax.ac/ae/en/blog/best-accounting-software-uae). These tools do **not** do supplier discovery, RFQ, quote comparison or PO award.
- METIS explicitly targets "growing companies without a procurement team," offering CPO-like guidance with "no prior procurement knowledge required," go-live under 72 hours, pay-per-use — [CollectiveSpend](https://www.collectivespend.com/blog/how-metis-transforms-procurement-speed/). This is the segment Zeke must win or differentiate from.
- Zinit's contrast ("legacy eSourcing 6–18 month implementation" vs "live in under 1 hour"; "supplier-funded — free to buyers") shows speed and pricing model as the main axes of disruption — [Zinit](https://zinit.com/).
- Zeke's stated fit: one buyer (operations lead/founder/procurement officer) at an SME/mid-market firm sourcing over email/WhatsApp; portal is a control room, not a supplier destination; stock-triggered reorder + on-demand requests; no ERP required — [Zeke scope doc](file:///home/aj/Projects/zeke/Zeke_%20a%20from-scratch%20procurement%20agent%20-%20Grok%20Bot.pdf).
- Defensibility primitives available to Zeke: named human checkpoints on new suppliers/spend/PO, an **AED spend cap**, a single purchase thread across channels, and an append-only audit log — [Zeke scope doc](file:///home/aj/Projects/zeke/Zeke_%20a%20from-scratch%20procurement%20agent%20-%20Grok%20Bot.pdf).

### Inferences
- Plausible fit: "the procurement coworker for the 50–500-person UAE firm that already runs on QuickBooks/Zoho/Wafeq, buys over WhatsApp/email, and cannot justify an ERP or a procurement department." Initial wedge use-cases: tail spend, office/MRO goods, repeat/stock-triggered reorders, and one-off service quotes.
- Plausible moats (in order of strength): (1) accumulated per-buyer supplier/response/price data and approval history making comparisons and chases better over time; (2) trust infrastructure — audit log + spend cap + approvals — that becomes operationally embedded; (3) GCC-local channel/language competence (Arabic/English, WhatsApp behaviour, local supplier discovery); (4) workflow lock-in via the single purchase thread and supplier directory. These are inferences, not proven.
- Weakness to acknowledge: METIS and Zinit already occupy "AI-native sourcing for firms without procurement teams" and "under-1-hour setup," so a generic "we're lighter and AI-first" pitch is not defensible. Novelty must be demonstrated at the *channel + governance* seam.

### Gaps
- No customer evidence, win/loss data, or pricing willingness-to-pay from UAE SMEs was found; the scope doc explicitly says the buyer persona is a first guess and demand evidence must be collected, not invented — [Zeke scope doc](file:///home/aj/Projects/zeke/Zeke_%20a%20from-scratch%20procurement%20agent%20-%20Grok%20Bot.pdf).
- No analysis of switching costs from WhatsApp/email habits or of competitor churn.
- Defensibility against a fast-follow by METIS/Zinit is speculative.

## 6. How might judges/evaluators assess innovation and defensibility in this category?

### Takeaway
The championship scorecard puts **Innovation & Defensibility at 15% and Trust/Safety/Human Oversight at 15% (30% combined)**, with Real Value 20%, Technical Execution 20%, Business Viability 20%, Pitch 10%. Given how crowded agentic procurement is, judges are likely to reward a crisp problem definition, a working and reliable prototype, visible human controls, and a defensible data/trust moat — not a claim to have invented AI sourcing.

### Cited Findings
- Scorecard weights (as pasted by the participant): **Real Value and Problem Validation 20%; Technical Execution and Reliability 20%; Trust, Safety and Human Oversight 15%; Innovation and Defensibility 15%; Business Viability and Scalability 20%; Pitch and Communication 10%** — [Zeke scope doc, quoting the Submit-page scorecard](file:///home/aj/Projects/zeke/Zeke_%20a%20from-scratch%20procurement%20agent%20-%20Grok%20Bot.pdf).
- Deliverables: working prototype, pitch deck, 2-minute demo video and 6-minute pitch video, in English; portal opens **4 Dec 2026**, deadline **4 Jan 2027**, finale **6 May 2027 in Dubai** with a live demo; the Create AI Agents Championship programme is at dubaichamberdigital.com — [Zeke scope doc](file:///home/aj/Projects/zeke/Zeke_%20a%20from-scratch%20procurement%20agent%20-%20Grok%20Bot.pdf); [Dubai Chamber Digital](https://www.dubaichamberdigital.com/en/create-ai-agents).
- The scope doc notes the scorecard asks for "a clearly defined real-world problem, target users, evidence of demand, and measurable benefits in the UAE and the world," and that the Session 1 workbook is stricter: "name the person, the one task, and the last time it happened" — [Zeke scope doc](file:///home/aj/Projects/zeke/Zeke_%20a%20from-scratch%20procurement%20agent%20-%20Grok%20Bot.pdf).
- The scope doc explicitly warns that "would you use this?" only confirms existing beliefs and that buyer stories must be collected, not invented — [Zeke scope doc](file:///home/aj/Projects/zeke/Zeke_%20a%20from-scratch%20procurement%20agent%20-%20Grok%20Bot.pdf).
- Technical Execution (20%) and Trust (15%) are the weights most exposed by brittle cold-DM behaviour: "a brittle cold DM or an unapproved call would hurt both" — [Zeke scope doc](file:///home/aj/Projects/zeke/Zeke_%20a%20from-scratch%20procurement%20agent%20-%20Grok%20Bot.pdf).

### Inferences
- Innovation is likely assessed *relative to the obvious incumbents*. A judge who knows Zinit/METIS/JAGGAER JAI will ask: "Is this just AI sourcing with a new name?" A strong answer points to the unowned seam — agent-owned email/WhatsApp identity, no supplier login, AED spend cap, named approvals, single cross-channel thread, audit log — and demonstrates it live.
- Defensibility is likely probed as: what compounds? Plausible answers: the buyer's supplier/price/response dataset, the approval/audit history, and GCC-local channel know-how. A "we use a better model" answer is weak; incumbents can match that.
- Trust may be the highest-leverage differentiator because it is 15% of the score and cheap to demonstrate: show the approval card, the spend cap blocking an over-limit action, and the audit log in the demo.
- Business Viability (20%) will likely require a credible route to market and pricing (subscription vs Zinit's supplier-funded model vs METIS pay-per-use) and evidence the problem recurs often enough to pay for.

### Gaps
- The actual judge rubric/scorecard beyond the participant's pasted weights was not independently retrieved from the championship site in this pass.
- No examples of prior championship entries or judging commentary were available; assessment logic above is inference from the weights and scope doc, not confirmed judge guidance.
