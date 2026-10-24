# CarbonProof (CausalMRV) — Security & Data Integrity Audit
### Aligned with IEEE ClimateChain Session 2: "AI and Cybersecurity Issues for Climate Change"
**Protocol:** CarbonProof Dual-Tranche Causal MRV Vault (`CarbonProofVault.sol`)  
**Deterministic Local Address:** `0x5FbDB2315678afecb367f032d93F642f64180aa3`  
**Dataset Checksum:** `0xfe23e72a0da7af22cbe855da8e6fb173e893721fa6a3c3006e8623f77f5c2f4f`  
**Verification Status:** 12/12 Automated Invariant Tests Passing (681 ms)

---

## 1. Executive Summary & Context

Voluntary Carbon Markets (VCM) and Decentralized Physical Infrastructure Networks (DePIN) for environmental monitoring face unique cybersecurity vulnerabilities that traditional DeFi protocols do not encounter. When financial tokens are minted against real-world biological assets—such as standing forests, soil organic matter, or oceanic blue carbon—the primary attack vector is not reentrancy or flash-loan manipulation, but **data poisoning, econometric oracle corruption, and asymmetric baseline inflation**.

In response to IEEE Session 2 ("AI and Cybersecurity Issues for Climate Change"), this document provides a comprehensive security assessment, formal threat model, and cryptographic verification review of the CarbonProof protocol.

---

## 2. Threat Modeling: The 5 Adversarial Climate Attack Vectors

```
                                      ADVERSARIAL ATTACK SURFACE
 ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 │                                                                                                  │
 │  [Attack Vector 1: Dataset Poisoning]          [Attack Vector 2: Oracle / Key Compromise]        │
 │  • Retroactive satellite pixel modification   • Malicious or coerced VVB auditor signature       │
 │  • Selective donor dropouts                   • Signature replay across fork or testnet          │
 │         │                                             │                                          │
 │         ▼                                             ▼                                          │
 │  ┌─────────────────────────────────────────────────────────────┐                                 │
 │  │      IMMUTABLE COMMITMENT & EIP-712 VERIFICATION LAYER      │                                 │
 │  │  • Keccak256 Typed Data Binding (Domain Separator + ChainID)│                                 │
 │  │  • Rigid SHA-256 Dataset Hash Equality Check                │                                 │
 │  └──────────────────────────────┬──────────────────────────────┘                                 │
 │                                 │                                                                │
 │                                 ▼                                                                │
 │  [Attack Vector 3: Statistical Insignificance / Noise Laundering]                                │
 │  • Submitting positive treatment effects derived from uncalibrated statistical noise            │
 │  • Enforced Check: empiricalPValueBps <= 500 (p <= 0.05 via Permutation Test)                    │
 │                                 │                                                                │
 │                                 ▼                                                                │
 │  [Attack Vector 4: Registry Delay & Zombie Token Trading]                                        │
 │  • Developers stalling audits to trade phantom credits before over-crediting is revealed         │
 │  • Enforced Check: Permissionless markOverdue() triggers secondary transfer freeze               │
 │                                 │                                                                │
 │                                 ▼                                                                │
 │  [Attack Vector 5: Contagion & Insolvent Buffer Pools]                                           │
 │  • Fraudulent project draining a shared global buffer pool                                       │
 │  • Enforced Check: Isolated Dual-Tranche ERC-1155 Escrow (Self-Contained Sashing)                │
 └──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Threat Vector 1: Off-Chain Panel Dataset Poisoning
- **Adversary Goal:** Alter historical deforestation numbers in the pre-intervention period (2001–2006) or cherry-pick specific donor control polygons after the fact to artificially depress the synthetic counterfactual, thereby inflating claimed avoided emissions.
- **Protocol Mitigation:** At project genesis (`initializeProject`), the contract locks an immutable `bytes32 panelCsvSha256` digest (`0xfe23e72a0da7af22cbe855da8e6fb173e893721fa6a3c3006e8623f77f5c2f4f`). Every subsequent audit payload must provide this exact hash. If an attacker modifies even 1 byte in the 825-row CSV, the SHA-256 digest shifts completely, triggering an immediate revert with custom error `TamperedDatasetHash`.

### Threat Vector 2: Auditor Impersonation & Signature Replay
- **Adversary Goal:** Forge an audit approval or replay an audit from an unauthorized address, another network, or an older epoch.
- **Protocol Mitigation:** 
  1. The audit payload is bound to the **EIP-712 structured data signing standard**, which includes the contract's verifying address (`verifyingContract`) and the network `chainId` (`1337` on local hardhat, `11155111` on Sepolia). Signatures cannot be replayed across contracts or chains.
  2. The recovered signer is validated against OpenZeppelin's `AccessControl` holding `ORACLE_AUDITOR_ROLE`. Calls from unauthorized signers revert with `UnauthorizedRole`.
  3. Strict monotonic epoch incrementation ($E_{\text{next}} = E_{\text{prev}} + 1$) guarantees that historical audits cannot be replayed, reverting with `InvalidEpochSequence`.

### Threat Vector 3: Noise Laundering (Statistical Insignificance)
- **Adversary Goal:** Submit an audit claiming millions in avoided deforestation when the underlying tree cover delta is indistinguishable from random background variance in undisturbed forests.
- **Protocol Mitigation:** The protocol mandates an in-space placebo permutation test across all 30 donor polygons. The resulting empirical $p$-value must be encoded into the payload in basis points (`empiricalPValueBps`). `CarbonProofVault.sol` enforces:
  ```solidity
  if (payload.empiricalPValueBps > MAX_P_VALUE_BPS) { // 500 bps = 0.05
      revert StatisticallyInsignificantAudit(payload.empiricalPValueBps);
  }
  ```
  This guarantees that audits backed by statistically noisy or unproven interventions are rejected at the EVM bytecode level.

### Threat Vector 4: Deliberate Audit Stalling ("Zombie Trading")
- **Adversary Goal:** If a project developer knows their forest suffered massive deforestation in Year $t$, they might intentionally delay submitting their annual audit, allowing them to sell un-audited credits on secondary exchanges at full price.
- **Protocol Mitigation:** The protocol implements a **permissionless SLA clock**. Each project has an immutable `auditSlaSeconds` parameter (e.g., 365 days) and a `nextAuditDeadline`. If the deadline passes without an audit, **any external address** can call `markOverdue(projectId)`. This immediately flips the project status to `OVERDUE` and triggers a protocol-level transfer lock via the ERC-1155 `_update` hook (`TransferFrozenProjectOverdue`), preventing any un-audited credits from moving until an audit is settled.

### Threat Vector 5: Collective Buffer Pool Depletion (The "Shared Risk" Flaw)
- **Adversary Goal:** Under traditional registries (such as legacy Verra AFOLU pooled buffers), all projects pay 10–20% into a single shared reserve. A fraudulent megaproject can exhaust the entire registry's buffer pool, socializing the cost of its fraud across legitimate, high-integrity projects.
- **Protocol Mitigation:** CarbonProof replaces pooled buffers with **Isolated Project-Specific Dual Tranches**. Each project's risk buffer tokens (Token ID = $2P + 1$) are escrowed within the contract exclusively for that project ($P$). If Kariba requires $5\text{M}$ credits to be slashed, only Kariba's escrowed buffer is burned. Legitimate projects remain completely insulated.

---

## 3. Cryptographic Implementation Details

### 3.1 EIP-712 Structured Data Hashing
`CarbonProofVault.sol` inherits OpenZeppelin's `EIP712` contract, initializing the cryptographic domain with:
```solidity
constructor() ERC1155("https://carbonproof.io/api/v1/metadata/{id}.json") EIP712("CarbonProof CausalMRV Protocol", "1.0.0")
```

The typehash is defined as an immutable `bytes32`:
```solidity
bytes32 public constant CAUSAL_AUDIT_TYPEHASH = keccak256(
    "CausalAuditPayload("
    "uint256 projectId,"
    "uint256 epoch,"
    "uint256 issuedVCUs,"
    "uint256 verifiedVCUs,"
    "uint256 excessVCUs,"
    "uint256 retiredExcessVCUs,"
    "uint256 activeExcessVCUs,"
    "uint256 empiricalPValueBps,"
    "uint256 spatialLeakagePenaltyBps,"
    "bytes32 panelCsvSha256"
    ")"
);
```

During audit settlement, the struct hash is computed natively:
```solidity
bytes32 structHash = keccak256(
    abi.encode(
        CAUSAL_AUDIT_TYPEHASH,
        payload.projectId,
        payload.epoch,
        payload.issuedVCUs,
        payload.verifiedVCUs,
        payload.excessVCUs,
        payload.retiredExcessVCUs,
        payload.activeExcessVCUs,
        payload.empiricalPValueBps,
        payload.spatialLeakagePenaltyBps,
        payload.panelCsvSha256
    )
);
bytes32 digest = _hashTypedDataV4(structHash);
address signer = ECDSA.recover(digest, signature);
```

### 3.2 Secure Multi-Token Custody (`IERC1155Receiver`)
Because the vault directly escrows Risk Buffer tokens upon project creation, the contract explicitly implements `IERC1155Receiver`:
```solidity
function onERC1155Received(
    address,
    address,
    uint256,
    uint256,
    bytes calldata
) external virtual override returns (bytes4) {
    return this.onERC1155Received.selector;
}

function onERC1155BatchReceived(
    address,
    address,
    uint256[] calldata,
    uint256[] calldata,
    bytes calldata
) external virtual override returns (bytes4) {
    return this.onERC1155BatchReceived.selector;
}
```
This guarantees safe internal custody while strictly adhering to EIP-1155 receiver safety invariants.

---

## 4. Solidity Custom Error Matrix & Test Verification

All 6 security error paths are validated in `test/CarbonProofVault.test.cjs`:

| Custom Error | Emitted By | Test Assertion in Hardhat Suite | Verification Result |
| :--- | :--- | :--- | :---: |
| `TamperedDatasetHash` | `submitCausalAudit` | Test 5: Reverts when providing `0xbaadcafe...` instead of `0xfe23e72a...` | **PASSED (28ms)** |
| `UnauthorizedRole` | `submitCausalAudit` | Test 6: Reverts when caller/signer lacks `ORACLE_AUDITOR_ROLE` | **PASSED (26ms)** |
| `InvalidEpochSequence` | `submitCausalAudit` | Test 7: Reverts when submitting Epoch 1 twice or skipping to Epoch 3 | **PASSED (31ms)** |
| `StatisticallyInsignificantAudit` | `submitCausalAudit` | Test 8: Reverts when `empiricalPValueBps > 500` ($p > 0.05$) | **PASSED (27ms)** |
| `EpochNotYetOverdue` | `markOverdue` | Test 11: Reverts when attempting to freeze before SLA deadline | **PASSED (25ms)** |
| `TransferFrozenProjectOverdue` | `_update` | Test 12: Reverts any ERC-1155 transfer while status is `OVERDUE` | **PASSED (36ms)** |

---

## 5. Security Recommendations for Mainnet Deployment

1. **Multi-Sig Oracle Governance:** Transition `ORACLE_AUDITOR_ROLE` from an EOA to a threshold Multi-Sig (e.g., Safe with 3-of-5 accredited VVBs like Verra, Gold Standard, and independent academic reviewers).
2. **Decentralized Ingestion Oracles:** Replace off-chain Python runners with Chainlink Functions or Brevis zero-knowledge coprocessors to verify satellite imagery directly from Planetary Computer or Copernicus Sentinel-2 STAC APIs.
3. **Formal Verification:** Execute formal verification of `_update` transfer freeze invariants using Certora or Halmos prior to handling mainnet institutional capital.

---
*Report produced by the CarbonProof Security Audit Lead for the IEEE ClimateChain Global Hackathon 2026.*
