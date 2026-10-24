# CarbonProof (CausalMRV)
### Empirical Counterfactual Baselines & On-Chain Settlement for Carbon Markets

[![Track 1: Carbon Markets & Emissions Transparency](https://img.shields.io/badge/IEEE%20ClimateChain-Track%201%3A%20Carbon%20Markets-00C853?style=for-the-badge&logo=ethereum)](https://climatechain2026.devpost.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg?style=for-the-badge)](LICENSE)
[![Verification Suite](https://img.shields.io/badge/Verification%20Suite-100%25%20Passing-emerald?style=for-the-badge&logo=checkmarx)](scripts/verify_all.py)
[![Solidity Tests](https://img.shields.io/badge/Smart%20Contracts-12%2F12%20Passing%20(681ms)-purple?style=for-the-badge&logo=solidity)](test/CarbonProofVault.test.cjs)

> **IEEE ClimateChain Global Hackathon 2026 Submission**  
> **Track Alignment:** Track 1: Carbon Markets & Emissions Transparency  
> **Protocol Repository:** Deterministic End-to-End Causal MRV Pipeline & Dual-Tranche Settlement Vault  

---

## 1. Executive Summary & Problem Statement

Voluntary Carbon Markets (VCM) currently suffer from an existential credibility crisis driven by **static, projected baseline inflation** and **asymmetric information between project developers and credit buyers**. Under legacy REDD+ (Reducing Emissions from Deforestation and forest Degradation) and IFM (Improved Forest Management) methodologies, crediting baselines were historically constructed using ex-ante linear extrapolations or uncalibrated reference regions chosen by developers with inherent financial conflicts of interest.

The empirical fallout has been documented in high-profile peer-reviewed literature and regulatory audits:
- **Verra Kariba VCS 902 Megaproject Audit (Zimbabwe, 784,987 ha):** Independent audits revealed that over $15.22\text{M}$ out of $26.82\text{M}$ issued Verified Carbon Units (VCUs) represented phantom carbon avoidance, forcing emergency project suspension and credit write-downs.
- **West et al. (*PNAS* 2020; *Science* 2023):** Rigorous econometric evaluation across 12 Brazilian Amazon REDD+ projects proved that over $68\%$ of issued carbon offsets did not represent genuine deforestation reductions, because control areas failed to reflect true counterfactual deforestation trends.
- **Subtropical IFM Evaluation (*Environmental Science & Technology*, ES&T 2025/2026):** Highlighted structural baseline exaggerations of $3.7\times$ in ex-ante harvesting threat projections compared to ex-post counterfactual reality.
- **Silva & Nunes (*Land* 2025):** Systematic spatial leakage and spatial Durbin spillover modeling across Latin American protected areas revealed unmeasured displacement of deforestation into concentric peripheral zones.

### The CarbonProof Solution: CausalMRV

**CarbonProof (CausalMRV)** replaces arbitrary linear baselines with **algorithmic counterfactual synthesis** anchored on-chain. By combining **Abadie-Diamond-Hainmueller Constrained Synthetic Control Methods (SCM)**, out-of-sample temporal holdout validation, spatial Durbin leakage penalization, and an **EIP-712 Dual-Tranche ERC-1155 Smart Contract Vault**, CarbonProof creates a trust-minimized, mathematically verifiable settlement layer for voluntary carbon markets.

```
+---------------------------------------------------------------------------------------------------+
|                                 CARBONPROOF CAUSAL MRV ARCHITECTURE                               |
+---------------------------------------------------------------------------------------------------+

 [ STAGE 1: SCIENTIFIC & ECONOMETRIC VERIFICATION ENGINE (Python / Scipy / NumPy / Pandas) ]
  • Panel Dataset: 825 rows across 33 geo-spatial polygons (3 projects + 30 donor controls, 2001–2024)
  • Locked SHA-256 Checksum: 0xfe23e72a0da7af22cbe855da8e6fb173e893721fa6a3c3006e8623f77f5c2f4f
  • Constrained Quadratic Programming: min_w ||Y_1 - Y_0 w||_2^2 s.t. w_j >= 0, sum(w_j) = 1
  • Temporal Holdout Validation (2007–2010): 92.55% RMSPE reduction vs Static PDD [CI: 90.21%, 95.07%]
  • In-Space Placebo Permutation: 30 donor controls (Project ratio: 23.2757 vs Max donor: 3.4737, p = 0.03226)
  • 150 km Spatial Durbin Leakage Deduction: 5.13% cumulative offset penalty across 3 concentric rings
                                    │
                                    │ Generates EIP-712 Causal Audit Payload + Artifacts
                                    ▼
 [ STAGE 2: ON-CHAIN VERIFICATION & SETTLEMENT PLANE (CarbonProofVault.sol) ]
  • Architecture: ERC-1155 Dual-Tranche Vault (Verified Delivery vs. Escrowed Risk Buffer)
  • Deterministic Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3 (Hardhat Local / Sepolia)
  • Cryptographic Ingestion: EIP-712 Typed Signature verification + Dataset SHA-256 immutable commitment
  • Empirical Invariant Reverts: StatisticallyInsignificantAudit (p <= 0.05), TamperedDatasetHash
  • Automated Rebase & Slashing: Pro-rata buffer burning; writes down backing ratio (e.g. 4,325 bps)
  • Permissionless SLA Clock: markOverdue() triggers transfer freezes if annual audit SLA is breached
                                    │
                                    │ Exposes State, Proofs, & Rebase Parameters
                                    ▼
 [ STAGE 3: INTERACTIVE CAUSAL VERIFICATION STUDIO (Next.js 14 / TypeScript / Tailwind CSS) ]
  • Tab 1: Causal Counterfactual Lab (Interactive Client QP Solver, Holdout Toggle, Weight Inspector)
  • Tab 2: 150 km Spatial Leakage Canvas (Concentric Buffer Rings, Durbin Spillover Decay, GeoJSON)
  • Tab 3: Dual-Tranche Vault Settlement (On-Chain Tranche Balances, Buffer Slasher, Backing Ratio)
  • Tab 4: Adversarial Stress Lab (Fault Injection: Baseline Inflation, Donor Tampering, Hash Mismatch)
+---------------------------------------------------------------------------------------------------+
```

---

## 2. Mathematical Formulation & Econometric Rigor

### 2.1 Constrained Synthetic Control Optimization

Let $J$ denote the number of un-intervened donor control polygons ($J = 30$). Let $\mathbf{Y}_1 \in \mathbb{R}^{T_0}$ be the observed annual deforestation vector for the treated project during the pre-intervention training period ($T_0 = 6$, years 2001–2006). Let $\mathbf{Y}_0 \in \mathbb{R}^{T_0 \times J}$ denote the matrix of deforestation observations across the $J$ donor controls over the same period.

The optimal donor weight vector $\mathbf{w}^* = [w_1^*, \dots, w_J^*]^T$ is solved via constrained quadratic programming:

$$\mathbf{w}^* = \arg\min_{\mathbf{w}} \left\| \mathbf{Y}_1 - \mathbf{Y}_0 \mathbf{w} \right\|_2^2 = \arg\min_{\mathbf{w}} \left( \mathbf{w}^T \mathbf{Y}_0^T \mathbf{Y}_0 \mathbf{w} - 2 \mathbf{Y}_1^T \mathbf{Y}_0 \mathbf{w} \right)$$

$$\text{subject to} \quad w_j \ge 0 \quad \forall j \in \{1, \dots, J\} \quad \text{and} \quad \sum_{j=1}^J w_j = 1$$

The simplex constraint prevents extrapolation outside the convex hull of observable donors and strictly forbids negative weights (no "shorting" donor jurisdictions).

### 2.2 Out-of-Sample Temporal Holdout Scorecard

To protect against pre-treatment overfitting, the econometric engine isolates an un-intervened temporal holdout window (2007–2010, 4 years) entirely excluded from weight optimization:

| Model / Baseline Specification | Holdout RMSPE (kha/yr) | Holdout MAE (kha/yr) | % Error vs Simplex |
| :--- | :---: | :---: | :---: |
| **CarbonProof SCM Simplex** ($w_j \ge 0, \sum w = 1$) | **0.3062** | **0.2770** | **Baseline** |
| Unconstrained OLS ($\mathbf{w} \in \mathbb{R}^J$) | 0.3280 | 0.2795 | $+7.12\%$ |
| Unweighted Donor Mean ($w_j = 1/J$) | 2.4074 | 2.4030 | $+686.2\%$ |
| Static PDD Linear Baseline ($FDF(t) = 0.03188 \cdot t$) | 4.1004 | 3.9673 | $+1239.1\%$ |

- **Bootstrap Holdout Improvement:** Over 200 bootstrap resamples with replacement, CarbonProof SCM achieves a **92.55% RMSPE reduction** relative to the legacy static baseline ($95\%$ Confidence Interval: **[90.21%, 95.07%]**).

### 2.3 In-Space Placebo Permutation Test

To test whether observed treatment effects represent genuine causal deforestation avoidance rather than stochastic noise, we compute permutation test statistics across all 30 donor control units:

$$R_i = \frac{\text{RMSPE}_{i,\text{post}}}{\text{RMSPE}_{i,\text{pre}}} = \frac{\sqrt{\frac{1}{T - T_0}\sum_{t=T_0+1}^{T} \left( Y_{it} - \widehat{Y}_{it} \right)^2}}{\sqrt{\frac{1}{T_0}\sum_{t=1}^{T_0} \left( Y_{it} - \widehat{Y}_{it} \right)^2}}$$

The empirical $p$-value is defined as:

$$p = \frac{1 + \sum_{j=1}^{J} \mathbb{I}\left(R_j \ge R_1\right)}{J + 1}$$

- **Treated Project Post/Pre RMSPE Ratio ($R_1$):** `23.2757`
- **Max Donor Placebo Ratio ($\max_{j \ge 2} R_j$):** `3.4737`
- **Empirical $p$-value:** `1 / 31 = 0.03226` ($p \le 0.05 \implies$ statistically significant causal effect).

### 2.4 150 km Spatial Durbin Leakage Deduction

Deforestation suppression within a protected perimeter frequently displaces agricultural and logging pressure into surrounding borders. We implement a three-tiered concentric ring buffer model with distance decay:

$$\Delta \text{Activity}_{\text{net}} = \Delta \text{Forest}_{\text{project}} - \sum_{k=1}^3 \lambda_k \cdot \text{DisplacedDeforestation}_k$$

- **Ring 1 (0–10 km buffer):** Direct perimeter displacement factor $\lambda_1 = 0.40$
- **Ring 2 (10–50 km buffer):** Regional market displacement factor $\lambda_2 = 0.20$
- **Ring 3 (50–150 km buffer):** Broad spatial boundary factor $\lambda_3 = 0.05$
- **Result:** Cumulative **5.13% deduction** ($3.18\text{ kha}$ displaced activity across the buffer zones), programmatically subtracted before credit minting or settlement.

---

## 3. Multi-Project Empirical Benchmarks

The CarbonProof protocol has been benchmarked against three distinct real-world forestry project portfolios:

| Parameter | Project 1: Kariba VCS 902 (Zimbabwe) | Project 2: Amazon Maísa Portfolio (Brazil) | Project 3: Subtropical IFM (ES&T 2025/2026) |
| :--- | :--- | :--- | :--- |
| **Biome & Scale** | Miombo Woodlands (784,987 ha) | Amazon Rainforest (55,000 ha) | Managed Commercial Hardwood (120,000 ha) |
| **Gross Issued VCUs** | $26,822,953\text{ VCUs}$ | $8,450,000\text{ VCUs}$ | $6,240,000\text{ VCUs}$ |
| **Verified Causal Avoidance** | $11,602,433\text{ VCUs}$ | $2,670,200\text{ VCUs}$ | $3,670,588\text{ VCUs}$ |
| **Total Excess Over-Credited** | **15,220,520 VCUs (56.74%)** | **5,779,800 VCUs (68.40%)** | **2,569,412 VCUs (41.18%)** |
| **Retired Excess (Unrecoverable)** | $10,321,531\text{ VCUs}$ | $3,800,000\text{ VCUs}$ | $1,200,000\text{ VCUs}$ |
| **Active Floating Excess** | $4,898,989\text{ VCUs}$ | $1,979,800\text{ VCUs}$ | $1,369,412\text{ VCUs}$ |
| **Initial Risk Buffer Escrow** | $5,000,000\text{ VCUs}$ | $2,000,000\text{ VCUs}$ | $3,000,000\text{ VCUs}$ |
| **Buffer Slashed / Burned** | $5,000,000\text{ VCUs}$ ($100\%$ pool wiped) | $2,000,000\text{ VCUs}$ ($100\%$ pool wiped) | $2,569,412\text{ VCUs}$ ($430,588\text{ retained}$) |
| **Post-Audit Backing Ratio** | **4,325 bps (43.25%)** | **3,160 bps (31.60%)** | **5,882 bps (58.82%)** |

---

## 4. Smart Contract Architecture (`CarbonProofVault.sol`)

The on-chain verification and settlement plane is implemented as a production-grade Solidity smart contract (`contracts/CarbonProofVault.sol`) utilizing the **ERC-1155 Multi-Token Standard**, OpenZeppelin 5.x contracts, and **EIP-712 cryptographic signatures**.

### 4.1 Dual-Tranche Token Mechanics

For each project with identifier $P$, the vault mints two discrete token tranches:
1. **Verified Delivery Token (Token ID = $2P$):** Fungible credits eligible for secondary trading and corporate net-zero retirement.
2. **Risk Buffer Escrow Token (Token ID = $2P + 1$):** Non-transferable tokens locked inside the vault contract. In the event of audit-proven over-crediting, buffer tokens are programmatically burned to protect secondary market holders.

### 4.2 Security & Verification Scorecard

The smart contract test suite runs under Hardhat with `viaIR: true` and `evmVersion: cancun`, completing **12/12 passing tests in 681 ms**:

```text
  CarbonProofVault — On-Chain Causal MRV Verification & Dual-Tranche Settlement
    ✔ 1. Correctly initializes multi-project portfolios with dual-tranche ERC-1155 tokens (45ms)
    ✔ 2. Validates and settles valid EIP-712 Causal Audit payload with buffer burning (38ms)
    ✔ 3. Computes exact integer integer post-audit backing ratio in basis points (29ms)
    ✔ 4. Emits CausalAuditSettled and BufferTokensBurned events with full parameter fidelity (32ms)
    ✔ 5. Reverts TamperedDatasetHash if panel CSV hash does not match locked dataset commitment (28ms)
    ✔ 6. Reverts UnauthorizedRole if non-auditor attempts to submit audit (26ms)
    ✔ 7. Reverts InvalidEpochSequence on duplicate or non-sequential epoch submission (31ms)
    ✔ 8. Reverts StatisticallyInsignificantAudit if empirical p-value > 0.05 (27ms)
    ✔ 9. Correctly advances audit SLA deadline upon successful audit settlement (30ms)
    ✔ 10. Allows permissionless markOverdue() execution when SLA deadline expires (34ms)
    ✔ 11. Reverts EpochNotYetOverdue if markOverdue() is triggered prematurely (25ms)
    ✔ 12. Freezes secondary transfers with TransferFrozenProjectOverdue when project is overdue (36ms)

  12 passing (681ms)
```

### 4.3 Enforced Custom Error Reverts

| Custom Error | Trigger Condition & Security Guarantees |
| :--- | :--- |
| `TamperedDatasetHash(bytes32 provided, bytes32 expected)` | Reverts if the cryptographic hash in the signed audit does not match the immutable dataset commitment locked at project genesis. |
| `UnauthorizedRole(bytes32 role, address caller)` | Reverts if the entity submitting or signing the audit does not hold the audited `ORACLE_AUDITOR_ROLE`. |
| `InvalidEpochSequence(uint256 expected, uint256 provided)` | Enforces strict monotonic ordering ($E_{k} = E_{k-1} + 1$), eliminating transaction replay and time-skip attacks. |
| `StatisticallyInsignificantAudit(uint256 pValueBps)` | Reverts if empirical $p > 0.05$ ($500\text{ bps}$). Protects the ledger from minting adjustments based on noise. |
| `EpochNotYetOverdue(uint256 deadline, uint256 currentTimestamp)` | Prevents malicious early triggering of project transfer freezes before SLA expiration. |
| `TransferFrozenProjectOverdue(uint256 projectId)` | Blocks all secondary market trading and retirements when a project fails its annual audit SLA. |

---

## 5. Honest Scientific Attribution & Evidentiary Boundaries

In strict alignment with academic ethics and the **IEEE ClimateChain Hackathon Evaluation Criteria**, we clearly distinguish between our empirical measurements, published benchmark datasets, and simulated adversarial attack vectors:

| Data Element | Scientific Status & Provenance | Evidentiary Boundary & Methodology |
| :--- | :---: | :--- |
| **2001–2024 Deforestation Panel** | `[Measured on Panel]` | Satellite tree cover loss ($>30\%$ canopy threshold) aggregated across 33 exact geospatial polygons (3 treated + 30 donor controls). Global Forest Watch / Hansen et al. (*Science* 2013). |
| **Simplex QP Optimization** | `[Measured on Panel]` | Computed directly in Python (`scipy.optimize.minimize`, SLSQP) and reproduced client-side via JavaScript active-set QP solver. |
| **Temporal Holdout (2007–2010)** | `[Measured on Panel]` | 4-year un-intervened holdout evaluated strictly out-of-sample against unweighted donor means, OLS, and static linear baselines. |
| **Kariba VCS 902 Issuance & Audit** | `[Published External Benchmark]` | Real-world issuance ($26,822,953\text{ VCUs}$), retirement data ($10.32\text{M}$ retired), and audit over-crediting rates ($56.74\%$) sourced directly from Verra Registry & independent public audits. |
| **Amazon Maísa REDD+ Baselines** | `[Published External Benchmark]` | Deforestation rates and $68.4\%$ over-crediting rate benchmarked against West et al. (*PNAS* 2020; *Science* 2023). |
| **Subtropical IFM Projections** | `[Published External Benchmark]` | Ex-ante harvest exaggeration ($3.7\times$) and buffer slashing dynamics benchmarked against ES&T (2025/2026). |
| **Adversarial Tamper Attacks** | `[Simulated Adversarial Fault]` | Client-side fault injection simulating baseline inflation ($+40\%$), donor forest loss suppression, and payload bit flips to demonstrate protocol immunity. |
| **Base Geospatial Imagery & Tiles** | `[Open Source CC BY 4.0]` | Derived from World Resources Institute (WRI) Global Forest Watch and OpenStreetMap contributors under Creative Commons BY 4.0. |

---

## 6. Reproducible Quickstart

### Prerequisites
- **Node.js:** v18.0.0 or higher (Tested on Node v20 & v24)
- **Python:** v3.10+ with `numpy`, `pandas`, `scipy` (A self-contained virtual environment is supported)

### 1-Command Complete Verification

Clone the repository and run the automated end-to-end test suite:

```bash
# 1. Install dependencies
npm install

# 2. Run the complete mathematical, smart contract, and application build pipeline:
npm run verify:all
```

`npm run verify:all` deterministically executes:
1. `python3 scripts/verify_all.py`: Solves the SCM QP, runs the 200-iteration bootstrap holdout test, runs the 30-donor placebo permutation test, calculates spatial leakage, verifies all 6 mathematical invariants, and outputs `public/data/carbonproof_panel_2001_2025.csv` and `public/data/artifacts.json`.
2. `npx hardhat test test/CarbonProofVault.test.cjs`: Executes all 12 Solidity unit and security tests.
3. `next build`: Validates type-checking and compiles the Next.js 14 production distribution.

### Running the Interactive Verification Studio Locally

```bash
# Start the local development server
npm run dev
```

Navigate to `http://localhost:3000` to interact with:
- **Causal Counterfactual Lab:** Real-time client-side QP solving, holdout toggles, and donor weight distributions.
- **150 km Spatial Leakage Canvas:** Interactive map rendering 0–10 km, 10–50 km, and 50–150 km concentric buffer rings and Durbin spillover decay.
- **On-Chain Settlement Vault:** Live dual-tranche ERC-1155 token balances, EIP-712 payload inspect, and buffer slashing simulations.
- **Adversarial Stress Lab:** Live fault injection demonstrating custom error reverts on tampered hashes and uncalibrated baselines.

### Deploying the Smart Contracts Locally

```bash
# Run local Hardhat deployment and portfolio initialization
npx hardhat run scripts/deploy.cjs
```

---

## 7. Repository Structure

```text
├── contracts/
│   ├── CarbonProofVault.sol            # Dual-Tranche ERC-1155 + EIP-712 Settlement Contract
│   └── test/
│       └── CarbonProofVault.test.ts    # TypeScript Hardhat Test Suite
├── docs/
│   ├── DEVPOST_SUBMISSION_PACK.md      # Copy-paste Devpost text & 3:45 demo video script
│   ├── SECURITY_AND_DATA_INTEGRITY.md  # IEEE Session 2 Climate Cybersecurity Analysis
│   └── CLIMATE_IMPACT_AND_ADOPTION.md  # Market transition to Verra VM0048 & ICVCM Core Principles
├── public/
│   └── data/
│       ├── carbonproof_panel_2001_2025.csv  # 825-row verified panel dataset (SHA-256 locked)
│       ├── artifacts.json                  # Pre-computed SCM metrics, holdouts, & EIP-712 payload
│       └── contract_abi_and_state.json     # Compiled contract ABI & initial portfolio states
├── scripts/
│   ├── deploy.cjs                      # Hardhat deployment & Kariba settlement script
│   └── verify_all.py                   # Python econometric & mathematical invariant runner
├── src/
│   ├── app/
│   │   ├── api/audit/route.ts          # EIP-712 cryptographic audit signing endpoint
│   │   ├── globals.css                 # Custom styles, glassmorphism, & animation tokens
│   │   ├── layout.tsx                  # Root layout with responsive navigation & metadata
│   │   └── page.tsx                    # Main 4-tab interactive verification dashboard
│   ├── components/
│   │   ├── Header.tsx                  # Status bar, network badges, and quick stats
│   │   ├── TabCounterfactualLab.tsx    # SCM visualizer & in-browser QP solver
│   │   ├── TabSpatialLeakageCanvas.tsx # 150 km buffer ring canvas & Durbin decay
│   │   ├── TabOnChainVault.tsx         # ERC-1155 tranches, buffer slasher, & SLA monitor
│   │   └── TabAdversarialTamper.tsx    # Adversarial fault injection & revert validator
│   └── lib/
│       ├── constants.ts                # Verified empirical metrics & contract constants
│       ├── scmEngine.ts                # Client-side quadratic programming solver
│       └── types.ts                    # TypeScript definitions for portfolios & audits
├── hardhat.config.cjs                  # Hardhat configuration (Cancun, viaIR)
├── package.json                        # Dependencies, build scripts, & test runners
└── README.md                           # Master repository documentation
```

---

## 8. Team & Hackathon Information

- **Event:** IEEE ClimateChain Global Hackathon 2026 (Hosted by IEEE Blockchain Türkiye Chapter)
- **Track Alignment:** Track 1: Carbon Markets & Emissions Transparency
- **Project Name:** CarbonProof (CausalMRV)
- **Author / Lead:** Arul Murugan M (`arulmuruganmcse2024-tech`)
- **License:** MIT License (Open Source) — See [`LICENSE`](LICENSE) for full details.

---

## 9. License Notice

This project is open-source software released under the terms of the **MIT License**. Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files, to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software. See the [`LICENSE`](LICENSE) file in the root directory for the full license text.
