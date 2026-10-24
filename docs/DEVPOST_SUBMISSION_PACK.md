# CarbonProof (CausalMRV) — Devpost Submission Pack
### IEEE ClimateChain Global Hackathon 2026

This document contains **100% copy-paste-ready text** formatted specifically for every required field on the Devpost project submission portal, followed by an exact **3:45 minute video presentation script**.

---

## Part 1: Devpost Submission Fields (Copy-Paste Ready)

### 1. Project Title & Tagline
**Project Title:**  
`CarbonProof (CausalMRV)`

**Tagline (< 100 characters):**  
`Ending phantom carbon credits with empirical counterfactuals and on-chain dual-tranche settlement.`  
*(Length: 93 characters)*

---

### 2. Track Selection & Track Alignment Statement
**Track Alignment:**  
`Track 1: Carbon Markets & Emissions Transparency`

**Track Alignment Statement:**  
> CarbonProof directly targets the root vulnerability of global carbon markets: static, uncalibrated baselines that enable phantom credit issuance. By bridging rigorous econometrics with Ethereum smart contracts, CarbonProof aligns strictly with Track 1 (Carbon Markets & Emissions Transparency) by replacing opaque paper-based verification with an on-chain Dual-Tranche ERC-1155 settlement engine featuring automated buffer slashing, EIP-712 cryptographic proofs, and an audit SLA clock, backed by multi-decadal satellite tree cover loss panels across 33 geospatial polygons, constrained quadratic programming, 150 km spatial Durbin leakage penalization, and permutation placebo tests.

---

### 3. Inspiration
While researching voluntary carbon markets, we came across recent *Science* and *PNAS* studies showing that up to 94% of analyzed rainforest offsets represent phantom carbon reductions. The turning point for us was examining the forensic audit of the Kariba REDD+ megaproject in Zimbabwe (VCS 902), where Verra confirmed that 15.22 million of the 26.82 million issued credits were excess because baseline deforestation had been overstated by 75% to 90%. Worse still, 10.32 million of those excess credits had already been retired by corporate buyers and could never be clawed back.

We realized this is fundamentally a coupled math and settlement failure. Under legacy methodologies, developers use static, upward-sloping linear projections to estimate what would happen without their project. When regional deforestation naturally slows down, those static formulas print millions of unbacked credits. Furthermore, once a registry issues those credits—or bridges them onto a blockchain as static ERC-20 tokens—there is no programmatic way to adjust supply after an audit fails. We built CarbonProof to replace static baseline guesses with reproducible causal econometrics, and to enforce the results on-chain before phantom credits can be retired.

---

### 4. What It Does
CarbonProof is an end-to-end Causal Measurement, Reporting, and Verification (CausalMRV) protocol and smart-contract settlement vault:

- **Constrained Synthetic Control Engine:** Instead of trusting a developer-selected reference zone, our engine analyzes 24 years of satellite tree-cover loss data across 33 geospatial polygons (locked to SHA-256 checksum `0xfe23e72a0da7af22cbe855da8e6fb173e893721fa6a3c3006e8623f77f5c2f4f`). It screens 30 un-intervened regional donor polygons and solves a constrained quadratic program ($w_j \ge 0, \sum w_j = 1$) to construct an objective counterfactual trajectory of forest loss.
- **Out-of-Sample Temporal Holdout & Placebo Validation:** To prevent overfitting, our pipeline isolates a 4-year pre-intervention holdout window (2007–2010) excluded from weight optimization. Across 200 bootstrap resamples, CarbonProof achieves an RMSPE of $0.3062\text{ kha/yr}$ compared to $4.1004\text{ kha/yr}$ for legacy static linear baselines—a 92.55% error reduction (95% CI: [90.21%, 95.07%]). It also runs 30 in-space placebo permutations, achieving a post/pre RMSPE ratio of $23.28$ vs. a donor maximum of $3.47$ ($p = 0.03226 \le 0.05$).
- **150 km Spatial Durbin Leakage Deduction:** Protecting one forest plot often displaces logging into surrounding areas. We model three concentric buffer rings (0–10 km, 10–50 km, and 50–150 km) with distance-decay spillover weights, subtracting a 5.13% cumulative leakage penalty ($3.18\text{ kha}$ displaced activity) prior to credit settlement.
- **On-Chain Dual-Tranche Settlement Vault (`CarbonProofVault.sol`):** Every project mints two ERC-1155 token tranches:
  - *Verified Delivery Tokens* (Token ID $2 \times P$) for trading and corporate retirement.
  - *Risk Buffer Escrow Tokens* (Token ID $2 \times P + 1$) locked inside the vault contract.  
  When an EIP-712 signed causal audit reveals baseline inflation, the contract automatically burns escrowed buffer tokens and writes down the project's active backing ratio in basis points (rebasing Kariba VCS 902 to 4,325 bps / 43.25%).
- **Permissionless SLA Clock (`markOverdue`):** If a project fails to submit its annual causal audit before the SLA deadline expires, any user can invoke `markOverdue()`, immediately freezing token transfers until a valid audit is settled.

---

### 5. How We Built It
We engineered CarbonProof across three tightly integrated verification planes:

- **Econometric Verification Engine (Python):** Built with NumPy, SciPy, and Pandas ([`scripts/verify_all.py`](../scripts/verify_all.py)). We formulated the Synthetic Control optimization using Sequential Least Squares Programming (SLSQP) bounded to the unit simplex, paired with bootstrap holdout evaluation and spatial Durbin ring calculations.
- **On-Chain Settlement Plane (Solidity ^0.8.24):** Built with Hardhat and OpenZeppelin 5.x ([`contracts/CarbonProofVault.sol`](../contracts/CarbonProofVault.sol)) targeting the Cancun EVM (`viaIR: true`). The contract implements ERC1155, `IERC1155Receiver` internal buffer custody, AccessControl, and EIP712 typed signature verification. Our automated suite ([`test/CarbonProofVault.test.cjs`](../test/CarbonProofVault.test.cjs)) passes 12/12 unit and security revert tests in under 700 ms.
- **Interactive Verification Studio (Next.js 14):** Built with TypeScript, Tailwind CSS, Recharts, and custom SVG geospatial rendering (`src/`). We ported our Projected-Gradient Active-Set QP solver directly into TypeScript ([`src/lib/scmEngine.ts`](../src/lib/scmEngine.ts)) so users can adjust baseline inflation and spatial leakage parameters in real time with zero backend latency, alongside a Web Crypto SHA-256 tamper verifier.

---

### 6. Challenges We Ran Into
- **Preventing Pre-Intervention Overfitting:** Standard synthetic control models fit weights across the entire pre-treatment window, which can overfit short time series. Partitioning the pre-2011 data into a 2001–2006 training window and a strict 2007–2010 out-of-sample holdout window allowed us to prove that simplex constraints prevent the out-of-bounds divergence seen in unconstrained OLS.
- **Fixed-Point Basis Precision in Solidity:** Because Solidity lacks floating-point arithmetic, naive integer division on verified versus issued VCUs (11,602,433 / 26,822,953) truncates to zero. Implementing scaled basis-point arithmetic `((verifiedVCUs * 10000) / issuedVCUs)` preserved exact 4,325 bps accounting across all settlement and retirement events.
- **ERC-1155 Internal Vault Custody:** Escrowing buffer tranches directly inside the vault contract triggered `ERC1155InvalidReceiver` reverts under OpenZeppelin 5.x until we implemented explicit `onERC1155Received` and `onERC1155BatchReceived` hooks with ERC-165 interface registration.

---

### 7. Accomplishments That We're Proud Of
- **92.55% Out-of-Sample Error Reduction:** Demonstrating nearly an order-of-magnitude lower prediction error on held-out satellite panels compared to legacy PDD linear extrapolations.
- **12/12 Smart Contract Security Tests Passing:** Enforcing 6 explicit custom error reverts (`TamperedDatasetHash`, `UnauthorizedRole`, `InvalidEpochSequence`, `StatisticallyInsignificantAudit`, `EpochNotYetOverdue`, and `TransferFrozenProjectOverdue`).
- **Single-Command Reproducibility:** Packaging the Python econometric checks (6/6 invariants), Hardhat smart contract suite (12/12 tests), and Next.js production compiler into a single deterministic pipeline (`npm run verify:all`).

---

### 8. What We Learned
Working through the empirical data from Kariba (VCS 902), Brazilian Amazon REDD+ portfolios, and Subtropical IFM benchmarks showed us that smart contracts cannot solve carbon market integrity alone—a blockchain registry is only as trustworthy as the econometric baseline feeding it. Coupling constrained synthetic control optimization with programmatic ERC-1155 buffer slashing bridges the gap between remote-sensing science and enforceable on-chain settlement.

---

### 9. What's Next for CarbonProof
- **Verra VM0048 & ICVCM CCP Integration:** Verra is transitioning REDD+ projects to the VM0048 methodology requiring dynamic jurisdictional baselines, while the ICVCM Core Carbon Principles mandate strict additionality and permanence quantification. CarbonProof provides a ready-made computational engine for Validation and Verification Bodies (VVBs) to automate VM0048 audits.
- **Automated Satellite Oracle Schedules:** Expanding our ingestion pipeline to trigger periodic Copernicus Sentinel-2 and Global Forest Watch (`gfw_integrated_alerts`) updates via decentralized oracle networks.

---

### 10. Links & Verification
- **Live Verification Studio:** [https://carbonproof-causalmrv.vercel.app](https://carbonproof-causalmrv.vercel.app)
- **GitHub Repository:** [https://github.com/arulmuruganmcse2024-tech/carbonproof-causalmrv](https://github.com/arulmuruganmcse2024-tech/carbonproof-causalmrv)
- **One-Command Local Verification:**
  ```bash
  npm install && npm run verify:all
  ```

---

## Part 2: Complete 3:45 Minute Demo Video Script

```
TARGET RUNTIME: Exactly 3 minutes 45 seconds (225 seconds)
SPEAKER: Lead Protocol Architect & Pitch Director
SCREEN SETUP: Browser open to http://localhost:3000 (Next.js Verification Studio) with developer console visible.
```

---

### Segment 1: The Problem & Executive Overview (0:00 – 0:40) | 40 Seconds

**Screen Action:**
- Show the Header of the CarbonProof dashboard. Hover over the badges: `Track 1: Carbon Markets` and the `Vault: 0x5FbD...aa3` address badge.
- Point cursor to the Kariba VCS 902 headline metrics: `Issued: 26.82M VCUs`, `Verified Causal: 11.60M VCUs`, `Excess: 15.22M VCUs (56.74%)`.

**Presenter Script (Word-for-Word):**
> "Hello IEEE ClimateChain judges. Today, voluntary carbon markets face an existential crisis. Under legacy methodologies, carbon credit baselines were drawn using arbitrary, upward-sloping linear projections created by the project developers themselves.
>
> The result? Catastrophic over-crediting. In Zimbabwe's flagship Kariba REDD+ megaproject—VCS 902—over 15.2 million of the 26.8 million issued credits were phantom offsets, leaving corporate buyers holding over 10 million unrecoverable retired credits.
>
> Welcome to **CarbonProof (CausalMRV)**. We replace developer-invented baselines with algorithmic counterfactual synthesis and on-chain dual-tranche settlement. Let's see how it works."

---

### Segment 2: Causal Counterfactual Lab & Econometrics (0:40 – 1:35) | 55 Seconds

**Screen Action:**
- Click on **Tab 1: Causal Counterfactual Lab**.
- Hover over the chart showing the Observed Deforestation (red line) vs. CarbonProof SCM Counterfactual (cyan line) vs. Static PDD Linear Baseline (dashed gray line).
- Click the **"Enable 2007–2010 Holdout Validation"** toggle. Watch the holdout window highlight in amber.
- Scroll down to the **Donor Weight Inspector** table showing the top donor polygons (e.g., Donor Polygon #14 with 38.4% weight, Polygon #03 with 24.1%).
- Hover over the **Placebo Permutation Test** card showing the post/pre ratio of 23.28 vs. 3.47 for controls, and the $p = 0.03226$ badge.

**Presenter Script (Word-for-Word):**
> "Here in the Causal Counterfactual Lab, we analyze 24 years of satellite tree cover loss data across 33 geospatial polygons locked to an immutable SHA-256 hash.
>
> Instead of cherry-picking one comparison forest, our constrained quadratic program solves for the optimal convex combination of 30 un-intervened regional donor polygons, with weights strictly on the simplex: non-negative and summing to 100%.
>
> To prove our model doesn't overfit, watch what happens when I toggle our 4-year temporal holdout from 2007 to 2010. While the legacy static baseline drifts upward with an RMSPE of 4.10 kilohectares per year, CarbonProof's synthetic control achieves an RMSPE of just 0.31—a **92.55% error reduction** verified over 200 bootstrap iterations.
>
> Furthermore, our in-space placebo permutation test across all 30 donors demonstrates a post-to-pre ratio of 23.28 against a donor maximum of 3.47, yielding an empirical p-value of 0.032, mathematically confirming genuine causal deforestation avoidance."

---

### Segment 3: 150 km Spatial Durbin Leakage Canvas (1:35 – 2:15) | 40 Seconds

**Screen Action:**
- Click on **Tab 2: 150 km Spatial Leakage Canvas**.
- Hover cursor over the interactive concentric rings:
  - Inner Ring 1 (0–10 km, red tint)
  - Mid Ring 2 (10–50 km, amber tint)
  - Outer Ring 3 (50–150 km, blue tint)
- Point to the Spatial Durbin Summary card showing:
  - `Gross Deforestation Avoided: 62.00 kha`
  - `Displaced Deforestation: 3.18 kha`
  - `Net Leakage Deduction: 5.13%`

**Presenter Script (Word-for-Word):**
> "One of the most dangerous forms of carbon fraud is spatial leakage: protecting a forest inside project boundaries while simply displacing timber harvesters 15 kilometers down the road.
>
> In Tab 2, our Spatial Durbin engine monitors three concentric buffer zones extending out to 150 kilometers. By applying distance-decay spatial spillover coefficients—40% in the immediate 10 km ring, 20% in the 50 km ring, and 5% in the outer perimeter—we calculate 3.18 kilohectares of displaced agricultural pressure.
>
> This automatically enforces a **5.13% cumulative leakage deduction**, deducted from credit generation before anything touches the blockchain."

---

### Segment 4: Dual-Tranche Vault & Settlement (2:15 – 3:05) | 50 Seconds

**Screen Action:**
- Click on **Tab 3: On-Chain Settlement Vault**.
- Highlight the **ERC-1155 Dual-Tranche Architecture**:
  - Tranche #2: Verified Delivery Tokens (`11,602,433 VCUs`)
  - Tranche #3: Risk Buffer Escrow Tokens (`5,000,000 VCUs`)
- Point to the **Audit Settlement Card**. Show the EIP-712 domain separator and structured typed hash.
- Click the button: **"Execute On-Chain Buffer Slashing & Settlement"**.
- Watch the transaction confirm:
  - Buffer Pool drops from `5,000,000` to `0 VCUs (100% Slashed)`.
  - Project Status flips to `REBASED_SETTLED`.
  - Backing Ratio locks at `4,325 bps (43.25%)`.
- Hover over the **Audit SLA Clock** showing `Status: HEALTHY (364 Days Remaining)`.

**Presenter Script (Word-for-Word):**
> "Now let's examine the blockchain settlement plane in `CarbonProofVault.sol`.
>
> We introduce a dual-tranche ERC-1155 architecture. When Kariba was initialized, 26.8 million Verified Delivery tokens were issued, alongside an escrowed 5 million token Risk Buffer pool locked inside the contract.
>
> Now, our certified oracle signs the EIP-712 Causal Audit payload. Watch as I execute the settlement transaction on-chain.
>
> Instantly, the contract detects the 15.2 million VCU over-crediting. It programmatically slashes and burns the entire 5 million token buffer pool, protecting secondary holders, and writes down the on-chain backing ratio to exactly **4,325 basis points—or 43.25%**. Any future buyer now sees the exact verified physical backing on-chain.
>
> Furthermore, notice our permissionless SLA clock: if an audit is not submitted annually, anyone can trigger `markOverdue()`, immediately freezing transfers to prevent un-audited credits from circulating."

---

### Segment 5: Adversarial Tamper Lab & Conclusion (3:05 – 3:45) | 40 Seconds

**Screen Action:**
- Click on **Tab 4: Adversarial Stress Lab**.
- Under Fault Injection Scenarios, click **"Scenario A: Inflate Baseline (+40%)"**. Click **"Simulate On-Chain Submission"**. Show the red error alert: `Reverted with StatisticallyInsignificantAudit(pValueBps: 840)`.
- Click **"Scenario B: Corrupt Dataset SHA-256 Hash"**. Click **"Simulate On-Chain Submission"**. Show the red error alert: `Reverted with TamperedDatasetHash(provided: 0xbaad..., expected: 0xfe23...)`.
- Return to Header showing the verified 12/12 test badge.

**Presenter Script (Word-for-Word):**
> "Finally, we subjected CarbonProof to rigorous adversarial testing aligned with IEEE Session 2 on AI and Cybersecurity.
>
> In our Adversarial Stress Lab, if a developer attempts to artificially inflate the baseline by 40%, the placebo test fails and the contract reverts with `StatisticallyInsignificantAudit`. If an attacker flips a single byte in the underlying dataset, the transaction instantly reverts with `TamperedDatasetHash`.
>
> Across 12 passing Hardhat tests, 3 real-world megaprojects, and peer-reviewed econometrics, CarbonProof bridges satellite data, causal AI, and Ethereum smart contracts to ensure that every carbon credit represents real, verified, permanent climate impact.
>
> Thank you, and we welcome your questions!"

---
*Devpost Submission Pack prepared and verified for IEEE ClimateChain Global Hackathon 2026.*
