import { expect } from "chai";
import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

describe("CarbonProofVault — On-Chain Verification & Settlement Plane (TS Runner)", function () {
  let vault: any;
  let admin: any, governor: any, oracle: any, developer: any, buyer: any, secondaryBuyer: any, attacker: any;
  let ORACLE_AUDITOR_ROLE: string, REGISTRY_GOVERNOR_ROLE: string;

  // Empirical constants locked from Stage 1 artifacts.json
  const PANEL_CSV_SHA256 = "0xfe23e72a0da7af22cbe855da8e6fb173e893721fa6a3c3006e8623f77f5c2f4f";
  const EPOCH_30_DAYS = 30 * 24 * 60 * 60; // 2,592,000 seconds

  // Case 1: Kariba VCS 902
  const KARIBA_PROJ_ID = 1;
  const KARIBA_ISSUED = 26822953;
  const KARIBA_VERIFIED = 11602433;
  const KARIBA_EXCESS = 15220520;
  const KARIBA_RETIRED_EXCESS = 10321531;
  const KARIBA_ACTIVE_EXCESS = 4898989;
  const KARIBA_BUFFER_INITIAL = 5000000;
  const KARIBA_P_VALUE_BPS = 323; // p = 0.03226
  const KARIBA_LEAKAGE_BPS = 513; // 5.13%
  const KARIBA_EXPECTED_BACKING_BPS = 4325; // 43.25%

  // Case 2: Amazon Maisa
  const MAISA_PROJ_ID = 2;
  const MAISA_ISSUED = 8450000;
  const MAISA_VERIFIED = 2670200;
  const MAISA_EXCESS = 5779800;
  const MAISA_BUFFER_INITIAL = 2000000;

  // Case 3: Subtropical IFM
  const IFM_PROJ_ID = 3;
  const IFM_ISSUED = 6240000;
  const IFM_VERIFIED = 3670588;
  const IFM_EXCESS = 2569412;
  const IFM_BUFFER_INITIAL = 3000000;

  let eip712Domain: any;
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

  before(async function () {
    [admin, governor, oracle, developer, buyer, secondaryBuyer, attacker] = await ethers.getSigners();
    const CarbonProofVaultFactory = await ethers.getContractFactory("CarbonProofVault");
    vault = await CarbonProofVaultFactory.deploy();
    await vault.waitForDeployment();

    ORACLE_AUDITOR_ROLE = await vault.ORACLE_AUDITOR();
    REGISTRY_GOVERNOR_ROLE = await vault.REGISTRY_GOVERNOR();

    await vault.grantRole(ORACLE_AUDITOR_ROLE, oracle.address);
    await vault.grantRole(REGISTRY_GOVERNOR_ROLE, governor.address);

    const vaultAddress = await vault.getAddress();
    const network = await ethers.provider.getNetwork();

    eip712Domain = {
      name: "CarbonProof CausalMRV Protocol",
      version: "1.0.0",
      chainId: network.chainId,
      verifyingContract: vaultAddress,
    };
  });

  it("Test 1: should initialize Project 1 (Kariba VCS 902)", async function () {
    await vault.connect(governor).initializeProject(
      KARIBA_PROJ_ID,
      "Kariba REDD+ Megaproject, Zimbabwe — VCS 902",
      KARIBA_ISSUED,
      KARIBA_BUFFER_INITIAL,
      PANEL_CSV_SHA256,
      buyer.address,
      EPOCH_30_DAYS
    );
    expect(await vault.balanceOf(buyer.address, 2)).to.equal(KARIBA_ISSUED);
  });
});
