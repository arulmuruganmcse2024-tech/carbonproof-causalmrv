const { ethers } = require("hardhat");

async function main() {
  console.log("\n" + "=".repeat(85));
  console.log("  CARBONPROOF (CausalMRV) — PROTOCOL DEPLOYMENT & PORTFOLIO INITIALIZER");
  console.log("  IEEE ClimateChain Global Hackathon 2026 | Track 1 Submission");
  console.log("=".repeat(85));

  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log(` Deployer Address   : ${deployer.address}`);
  console.log(` Network Name       : ${network.name || "hardhat-local"}`);
  console.log(` Chain ID           : ${network.chainId}`);
  console.log("-".repeat(85));

  // 1. Deploy CarbonProofVault
  const CarbonProofVault = await ethers.getContractFactory("CarbonProofVault");
  const vault = await CarbonProofVault.deploy();
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();

  console.log(`[DEPLOY] CarbonProofVault deployed at: ${vaultAddress}`);

  // 2. Grant Roles
  const ORACLE_AUDITOR_ROLE = await vault.ORACLE_AUDITOR();
  const REGISTRY_GOVERNOR_ROLE = await vault.REGISTRY_GOVERNOR();

  await vault.grantRole(ORACLE_AUDITOR_ROLE, deployer.address);
  await vault.grantRole(REGISTRY_GOVERNOR_ROLE, deployer.address);
  console.log(`[ROLES]  Granted ORACLE_AUDITOR and REGISTRY_GOVERNOR to ${deployer.address}`);

  // Constants locked from Stage 1 artifacts.json
  const PANEL_CSV_SHA256 = "0xfe23e72a0da7af22cbe855da8e6fb173e893721fa6a3c3006e8623f77f5c2f4f";
  const EPOCH_30_DAYS = 30 * 24 * 60 * 60; // 30 days SLA clock

  // 3. Initialize Project 1: Kariba VCS 902
  console.log("\n[INIT 1] Initializing Project #1: Kariba REDD+ Megaproject, Zimbabwe (VCS 902)...");
  const tx1 = await vault.initializeProject(
    1,
    "Kariba REDD+ Megaproject, Zimbabwe — VCS 902",
    26822953, // initial issued VCUs
    5000000,  // initial buffer pool
    PANEL_CSV_SHA256,
    deployer.address,
    EPOCH_30_DAYS
  );
  await tx1.wait();
  console.log("         Tokens minted -> Verified ID #2: 26,822,953 VCUs | Buffer ID #3: 5,000,000 VCUs");

  // 4. Initialize Project 2: Amazon Maísa VCS
  console.log("[INIT 2] Initializing Project #2: Maísa & Rio Preto-Jacundá REDD+ Portfolio...");
  const tx2 = await vault.initializeProject(
    2,
    "Maísa & Rio Preto-Jacundá REDD+ Portfolio, Brazilian Amazon",
    8450000,
    2000000,
    PANEL_CSV_SHA256,
    deployer.address,
    EPOCH_30_DAYS
  );
  await tx2.wait();
  console.log("         Tokens minted -> Verified ID #4: 8,450,000 VCUs | Buffer ID #5: 2,000,000 VCUs");

  // 5. Initialize Project 3: Subtropical IFM
  console.log("[INIT 3] Initializing Project #3: Subtropical Improved Forest Management Portfolio...");
  const tx3 = await vault.initializeProject(
    3,
    "Subtropical Improved Forest Management Portfolio",
    6240000,
    3000000,
    PANEL_CSV_SHA256,
    deployer.address,
    EPOCH_30_DAYS
  );
  await tx3.wait();
  console.log("         Tokens minted -> Verified ID #6: 6,240,000 VCUs | Buffer ID #7: 3,000,000 VCUs");

  // 6. Execute Initial Kariba Causal Audit Settlement (Epoch 1)
  console.log("\n[AUDIT]  Signing and settling EIP-712 Causal Audit for Project #1 (Kariba VCS 902)...");
  const eip712Domain = {
    name: "CarbonProof CausalMRV Protocol",
    version: "1.0.0",
    chainId: network.chainId,
    verifyingContract: vaultAddress,
  };

  const eip712Types = {
    CausalAuditPayload: [
      { name: "projectId", type: "uint256" },
      { name: "epoch", type: "uint256" },
      { name: "issuedVCUs", type: "uint256" },
      { name: "verifiedVCUs", type: "uint256" },
      { name: "excessVCUs", type: "uint256" },
      { name: "retiredExcessVCUs", type: "uint256" },
      { name: "activeExcessVCUs", type: "uint256" },
      { name: "empiricalPValueBps", type: "uint256" },
      { name: "spatialLeakagePenaltyBps", type: "uint256" },
      { name: "panelCsvSha256", type: "bytes32" },
    ],
  };

  const karibaPayload = {
    projectId: 1,
    epoch: 1,
    issuedVCUs: 26822953,
    verifiedVCUs: 11602433,
    excessVCUs: 15220520,
    retiredExcessVCUs: 10321531,
    activeExcessVCUs: 4898989,
    empiricalPValueBps: 323, // p = 0.03226
    spatialLeakagePenaltyBps: 513, // 5.13%
    panelCsvSha256: PANEL_CSV_SHA256,
  };

  const auditSignature = await deployer.signTypedData(eip712Domain, eip712Types, karibaPayload);
  const auditTx = await vault.submitCausalAudit(karibaPayload, auditSignature);
  await auditTx.wait();

  const karibaState = await vault.getProject(1);
  const karibaBufferBalance = await vault.balanceOf(vaultAddress, 3);

  console.log(`         EIP-712 Audit Confirmed in tx: ${auditTx.hash}`);
  console.log(`         Buffer Slashed / Burned       : 5,000,000 VCUs (Remaining buffer: ${karibaBufferBalance})`);
  console.log(`         Post-Audit Backing Ratio      : ${karibaState.backingRatioBps} bps (43.25%)`);
  console.log(`         Project Status                : REBASED_SETTLED (Enum: ${karibaState.status})`);

  console.log("\n" + "=".repeat(85));
  console.log("  DEPLOYMENT & ON-CHAIN INITIALIZATION COMPLETE [100% SUCCESS]");
  console.log(`  Vault Address: ${vaultAddress}`);
  console.log(`  Dataset Hash : ${PANEL_CSV_SHA256}`);
  console.log("=".repeat(85) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
