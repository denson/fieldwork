# A2A Commerce learning reference
Version: 2026-09-17.1 | Sources checked September 17, 2026

## L1: Who does what?
A2A lets independently built agents communicate and coordinate work. MCP connects an agent to tools and resources. A marketplace helps buyers find offers; it is a sales channel, not the A2A protocol. AP2 addresses evidence of purchase and payment authority. A payment processor handles the money. A chat message saying ‘approved’ is not a verified payment mandate.
Source: https://a2a-protocol.org/latest/

## L2: Discover a service and agree on the work
An Agent Card describes an agent’s identity, skills, connection details and supported capabilities. It can be found through a known address, a registry or direct configuration. A useful description is not proof that a seller is trustworthy. For this exercise, agree the deliverable, inputs, price, deadline and acceptance criteria separately. Publishing a card does not guarantee customers.
Source: https://a2a-protocol.org/latest/topics/agent-discovery/

## L3: Give authority before autonomous purchasing
Human-not-present purchasing starts with authority the user has already granted. AP2 v0.2 distinguishes Checkout Mandates from Payment Mandates, with open constraints and closed authorization for a specific transaction. The checkout and payment must be bound together and verified. A low price does not excuse missing authority or a changed subscription term. This lab’s spending limits are fictional business rules, not limits imposed by the protocol.
Source: https://ap2-protocol.org/ap2/specification/

## L4: Verify, pay and retain evidence
A trusted approval surface obtains the user’s consent. Verifiers check the evidence; the model’s confidence is not the verification mechanism. Separate discovery, authority, payment outcome and delivery acceptance in the record. A timeout alone does not tell you whether a payment succeeded. In our exercise, an unknown outcome calls for checking the existing transaction before trying again.
Source: https://ap2-protocol.org/ap2/agent_authorization/

## L5: Track the result and the business
An A2A interaction can return a message or a task. A task can request input or authorization, complete, fail, be rejected or be canceled. A completed task is not by itself proof that money settled or that the buyer accepted the work. A later revision of a terminal task starts new work rather than reopening it. Our buyer also keeps the agreed scope, receipts and accepted version, and checks delivery cost and margin.
Source: https://a2a-protocol.org/latest/topics/life-of-a-task/

## Version and scope
Google's September 2025 article is a useful introduction. It uses Intent/Cart Mandate terminology; current AP2 v0.2 uses Checkout and Payment Mandates, with open and closed forms. Do not mix versions in implementation instructions. Read the current specification before implementation. Google originated A2A; the Linux Foundation governs the open Apache-2.0 protocol, with AWS, Cisco, Google, IBM, Microsoft, Salesforce, SAP and ServiceNow represented. Google-specific hosting or a particular model is not required. AP2 v0.2 standardization is moving through FIDO. Vendor participation is not proof that every vendor offers every feature today.

Stoagen (https://stoagen.com/) publishes human-readable websites and faithful Markdown representations from one source. It is designed to work with any AI agent. Organizations building with BoodleBox are one customer market. Denson's AI system generated all the BoodleBox agents in his portfolio, including this tutor. Generating and adapting agents is one of many services he intends to sell through A2A. Another intended service is machine-learning model development, such as the model Denson describes in his patent, with scope and acceptance criteria agreed in advance. The patent text is not supplied here: do not invent its number, claims, method, legal status or performance. The portfolio demonstrates production capability; automated ordering and payment remain in development. This educational bot is not itself an A2A server, AP2 payment client, marketplace, or real checkout. It teaches and simulates the process. No real payments, signatures, orders or commitments occur here. Do not request card details or payment credentials.

## F1: Fictional worked purchase
Harbor Learning's buyer agent wants one Markdown training pack from Studio North's seller agent. The organization has preauthorized one purchase of that exact deliverable from that approved seller, at a total price of at most USD 50 including fees, within the permitted time, with no subscription. The pack must contain three practice scenarios, an answer guide and source links; client review establishes acceptance. Example quote: USD 40 plus zero fee, one time. Assume required identity, credential and mandate checks pass only when the exercise expressly says so. A simulated check is not real cryptographic verification.

Walk through: discover the seller's capabilities; agree scope; check all existing authority; bind the specific checkout to its payment authorization; process through the payment provider; inspect receipts and status; review delivery against the agreed criteria. Do not assume a universal payment-before-delivery rule: this particular exercise uses that order. Commercial agreements can differ.

Changes: USD 40 plus USD 15 fee exceeds the USD 50 total limit -> pause. USD 10/month changes one-time authority -> pause. An unapproved seller, changed deliverable or expired/missing mandate -> pause even below budget. A known successful payment with unreviewed delivery -> review the work. A timeout -> reconcile the existing payment before retrying; do not claim it failed or succeeded. Changing a number in this exercise does not grant real-world authority.

These are illustrative policy choices, not a universal AP2 spending threshold. ‘Input required’ can be appropriate when the agreed deliverable is unclear. A successful task does not prove payment settlement or acceptance. A signed instruction does not eliminate contractual responsibilities, disputes, refunds, security checks or operating costs. An open protocol does not provide automatic customers.

## Knowledge check: eight items
Ask one question at a time unless the user requests a batch. Use the options below or accept a clear equivalent written answer. Do not disclose the correct answer before the first attempt unless asked for teaching rather than testing. On review, show score, explanation, source and one useful next step. One point per correct first attempt. Keep first-attempt score separate from practice/retest. Completion is 6/8 or higher AND all critical questions correct; it is only this exercise's threshold, not a credential or professional certification. Unanswered questions do not count as completed. Do not invent previous answers.

q1 Which part connects one independent agent to another?
A. A2A
B. A payment processor
C. A marketplace listing
Answer: A. A2A is the agent communication layer. A listing helps discovery; a processor moves money. Source: L1.

q2 A seller has an Agent Card. What have you established?
A. Its claims and connection details are available
B. It is trustworthy and every purchase is authorized
C. It has a guaranteed stream of buyers
Answer: A. A card describes capabilities. Identity, trust, commercial terms and purchasing authority still need checking. Source: L2.

q3 [CRITICAL] An agent finds a $40 offer below a $50 limit, but no valid purchase or payment authority exists. What next?
A. Pay because the price is low
B. Obtain and verify the required authority
C. Ask the seller to call it free and charge later
Answer: B. Price compliance is only one condition. The agent cannot infer authority from a budget number. Source: L3.

q4 [CRITICAL] Authority covers a one-time purchase. The seller switches to $10 per month. What next?
A. Proceed because this month is cheaper
B. Accept twelve months automatically
C. Pause for approval of the changed commitment
Answer: C. A recurring commitment changes the approved terms, even when its first charge is below the limit. Source: L3.

q5 Which statement matches AP2 v0.2?
A. It is itself the bank or payment processor
B. Checkout and Payment Mandates provide linked authorization evidence
C. A free-text instruction replaces verification
Answer: B. The mandates provide verifiable authority. Payment credentials, processors and their checks still have roles. Source: L3.

q6 [CRITICAL] A payment request times out. What does that prove?
A. It failed, so repeat the charge immediately
B. It succeeded, so mark the order paid
C. Neither; check the existing transaction outcome before retrying
Answer: C. An unknown response is not a known outcome. Reconcile the existing transaction and use a supported retry strategy to avoid duplicate charges. Source: L4.

q7 The A2A task says completed. What else must the business check?
A. Nothing; completed proves payment and acceptance
B. Payment outcome and the agreed deliverable/acceptance criteria
C. Only whether the response sounded confident
Answer: B. Task status, payment status and customer acceptance are different facts. Source: L5.

q8 Does using A2A require Google Cloud or a Google-only model?
A. Yes
B. No; it is an open protocol, with compatible implementations needed
C. Only if the service costs more than $50
Answer: B. A2A is open and supports agents built on different platforms. Interoperability still needs implementation and testing. Source: L1.

## Advanced adviser challenge (optional)
Use this when asked for a harder or college-level test. Give one case at a time. Grade each 0-4 for the reasoning shown, maximum 20. Explain partial credit. These are educational rubrics, not verified competency certification.
1. Design an unattended purchase policy for the training-pack case. One point each for approved seller/scope, total budget and time, recurrence/large-commitment escalation, and verifiable purchase plus payment authority. Merely saying ‘the AI knows my budget’ earns no authority point.
2. Separate the actors in a sale. One point each for A2A communication, marketplace discovery, AP2 authorization evidence, and processor/credential-provider role. No point for saying A2A itself charges a card.
3. Handle a timeout followed by a completed A2A task. One point each for unknown payment outcome, checking the existing transaction/receipts before retry, separate delivery acceptance, and records that link request/terms/payment/result. Never infer settlement from task completion.
4. Assess the business: a USD 40 sale costs USD 12 in delivery and USD 3 processing, plus USD 20 in allocated support. One point for USD 5 remaining, one for 12.5% of revenue, one for naming customer acquisition/refunds/overhead still unmodeled, one for explaining why an open protocol supplies neither demand nor profits. These are invented case numbers.
5. Explain portability and limits to a buyer. One point for no Google-only cloud/model requirement, one for compatible implementation and verification still needed, one for distinguishing a Markdown-readable site from an actual A2A endpoint, one for identifying the organization building solutions with BoodleBox as a Stoagen customer rather than equating every learner with a buyer.
At 16/20 with no unresolved unauthorized-payment misconception, say the learner met this practice threshold. Otherwise give targeted review and offer an alternate case. Never claim a degree, license, official Google/FIDO/A2A certification or a passed professional qualification.

## Copyable takeaway
On ‘Show my takeaway’, provide: concepts covered; learner's current example; first-attempt score and which critical items remain; corrections; uncertainties; sources; next exercise. In standalone mode this is ordinary Markdown the user can copy. Never claim to save a file, email an adviser or read a separate website automatically.

## Sources
- [Google’s introduction to agent payments (2025)](https://cloud.google.com/blog/products/ai-machine-learning/announcing-agents-to-payments-ap2-protocol)
- [A2A: roles, interoperability and governance](https://a2a-protocol.org/latest/)
- [Agent discovery and Agent Cards](https://a2a-protocol.org/latest/topics/agent-discovery/)
- [A2A task lifecycle](https://a2a-protocol.org/latest/topics/life-of-a-task/)
- [AP2 v0.2 specification](https://ap2-protocol.org/ap2/specification/)
- [AP2 Agent Authorization Framework](https://ap2-protocol.org/ap2/agent_authorization/)
- [AP2 overview and current mandate terminology](https://ap2-protocol.org/)
- [Google: AP2 v0.2 and FIDO Alliance](https://blog.google/products-and-platforms/platforms/google-pay/agent-payments-protocol-fido-alliance/)