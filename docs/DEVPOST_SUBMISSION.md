# CarbonProof (CausalMRV)
### Official Devpost Project Submission
**IEEE ClimateChain Global Hackathon 2026**

---

**Tagline:**  
Ending phantom carbon credits with empirical counterfactuals and on-chain dual-tranche settlement.

**Track Alignment:**  
Track 1: Carbon Markets & Emissions Transparency

---

## Inspiration

While researching voluntary carbon markets, we came across recent *Science* and *PNAS* studies showing that up to 94% of analyzed rainforest offsets represent phantom carbon reductions. The turning point for us was examining the forensic audit of the Kariba REDD+ megaproject in Zimbabwe (VCS 902), where Verra confirmed that 15.22 million of the 26.82 million issued credits were excess because baseline deforestation had been overstated by 75% to 90%. Worse still, 10.32 million of those excess credits had already been retired by corporate buyers and could never be clawed back.

We realized this is fundamentally a coupled math and settlement failure. Under legacy methodologies, developers use static, upward-sloping linear projections to estimate what would happen without their project. When regional deforestation naturally slows down, those static formulas print millions of unbacked credits. Furthermore, once a registry issues those credits—or bridges them onto a blockchain as static ERC-20 tokens—there is no programmatic way to adjust supply after an audit fails. We built CarbonProof to replace static baseline guesses with reproducible causal econometrics, and to enforce the results on-chain before phantom credits can be retired.

---

## What It Does

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

## How We Built It

We engineered CarbonProof across three tightly integrated verification planes:

- **Econometric Verification Engine (Python):** Built with NumPy, SciPy, and Pandas ([`scripts/verify_all.py`](../scripts/verify_all.py)). We formulated the Synthetic Control optimization using Sequential Least Squares Programming (SLSQP) bounded to the unit simplex, paired with bootstrap holdout evaluation and spatial Durbin ring calculations.
- **On-Chain Settlement Plane (Solidity ^0.8.24):** Built with Hardhat and OpenZeppelin 5.x ([`contracts/CarbonProofVault.sol`](../contracts/CarbonProofVault.sol)) targeting the Cancun EVM (`viaIR: true`). The contract implements ERC1155, `IERC1155Receiver` internal buffer custody, AccessControl, and EIP712 typed signature verification. Our automated suite ([`test/CarbonProofVault.test.cjs`](../test/CarbonProofVault.test.cjs)) passes 12/12 unit and security revert tests in under 700 ms.
- **Interactive Verification Studio (Next.js 14):** Built with TypeScript, Tailwind CSS, Recharts, and custom SVG geospatial rendering (`src/`). We ported our Projected-Gradient Active-Set QP solver directly into TypeScript ([`src/lib/scmEngine.ts`](../src/lib/scmEngine.ts)) so users can adjust baseline inflation and spatial leakage parameters in real time with zero backend latency, alongside a Web Crypto SHA-256 tamper verifier.

---

## Challenges We Ran Into

- **Preventing Pre-Intervention Overfitting:** Standard synthetic control models fit weights across the entire pre-treatment window, which can overfit short time series. Partitioning the pre-2011 data into a 2001–2006 training window and a strict 2007–2010 out-of-sample holdout window allowed us to prove that simplex constraints prevent the out-of-bounds divergence seen in unconstrained OLS.
- **Fixed-Point Basis Precision in Solidity:** Because Solidity lacks floating-point arithmetic, naive integer division on verified versus issued VCUs (11,602,433 / 26,822,953) truncates to zero. Implementing scaled basis-point arithmetic `((verifiedVCUs * 10000) / issuedVCUs)` preserved exact 4,325 bps accounting across all settlement and retirement events.
- **ERC-1155 Internal Vault Custody:** Escrowing buffer tranches directly inside the vault contract triggered `ERC1155InvalidReceiver` reverts under OpenZeppelin 5.x until we implemented explicit `onERC1155Received` and `onERC1155BatchReceived` hooks with ERC-165 interface registration.

---

## Accomplishments That We're Proud Of

- **92.55% Out-of-Sample Error Reduction:** Demonstrating nearly an order-of-magnitude lower prediction error on held-out satellite panels compared to legacy PDD linear extrapolations.
- **12/12 Smart Contract Security Tests Passing:** Enforcing 6 explicit custom error reverts (`TamperedDatasetHash`, `UnauthorizedRole`, `InvalidEpochSequence`, `StatisticallyInsignificantAudit`, `EpochNotYetOverdue`, and `TransferFrozenProjectOverdue`).
- **Single-Command Reproducibility:** Packaging the Python econometric checks (6/6 invariants), Hardhat smart contract suite (12/12 tests), and Next.js production compiler into a single deterministic pipeline (`npm run verify:all`).

---

## What We Learned

Working through the empirical data from Kariba (VCS 902), Brazilian Amazon REDD+ portfolios, and Subtropical IFM benchmarks showed us that smart contracts cannot solve carbon market integrity alone—a blockchain registry is only as trustworthy as the econometric baseline feeding it. Coupling constrained synthetic control optimization with programmatic ERC-1155 buffer slashing bridges the gap between remote-sensing science and enforceable on-chain settlement.

---

## What's Next for CarbonProof

- **Verra VM0048 & ICVCM CCP Integration:** Verra is transitioning REDD+ projects to the VM0048 methodology requiring dynamic jurisdictional baselines, while the ICVCM Core Carbon Principles mandate strict additionality and permanence quantification. CarbonProof provides a ready-made computational engine for Validation and Verification Bodies (VVBs) to automate VM0048 audits.
- **Automated Satellite Oracle Schedules:** Expanding our ingestion pipeline to trigger periodic Copernicus Sentinel-2 and Global Forest Watch (`gfw_integrated_alerts`) updates via decentralized oracle networks.

---

## Links & Verification

- **Live Verification Studio:** [https://carbonproof-causalmrv.vercel.app](https://carbonproof-causalmrv.vercel.app)
- **GitHub Repository:** [https://github.com/arulmuruganmcse2024-tech/carbonproof-causalmrv](https://github.com/arulmuruganmcse2024-tech/carbonproof-causalmrv)
- **One-Command Local Verification:**
  ```bash
  npm install && npm run verify:all
  ```
