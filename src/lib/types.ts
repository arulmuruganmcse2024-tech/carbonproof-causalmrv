export type ProjectId = "kariba_vcs902" | "amazon_maisa_vcs" | "subtropical_ifm";

export interface CaseStudyMeta {
  id: ProjectId;
  numericalId: number;
  name: string;
  country: string;
  areaHa: number;
  startDate: string;
  standard: string;
  issuedVCUs: number;
  verifiedVCUs: number;
  excessVCUs: number;
  retiredExcessVCUs: number;
  activeExcessVCUs: number;
  excessPct: number;
  initialBufferVCUs: number;
  remainingBufferVCUs: number;
  backingRatioBps: number;
  staticFormula: string;
  scientificReference: string;
  pValBps: number;
  leakageBps: number;
}

export interface TimeSeriesPoint {
  year: number;
  observedLossKha: number;
  scmCounterfactualKha: number;
  staticPddLossKha: number;
  unweightedMeanKha: number;
  unconstrainedOlsKha: number;
  grossAvoidedKha: number;
  spatialLeakageKha: number;
  netAvoidedKha: number;
  developerClaimedVCU: number;
  verifiedVCU: number;
  excessVCU: number;
}

export interface ModelHoldoutMetrics {
  name: string;
  rmspe: number;
  mae: number;
  description: string;
}

export interface DonorPolygon {
  id: string;
  name: string;
  weight: number;
  elevationM: number;
  slopeDeg: number;
  canopyPct: number;
  roadDistKm: number;
  lossKha: number;
  distanceFromProjectKm: number;
  angleDeg: number;
}

export interface ContractProjectState {
  projectId: number;
  name: string;
  verifiedTokenId: number;
  bufferTokenId: number;
  issuedVCUs: number;
  verifiedVCUs: number;
  excessVCUs: number;
  backingRatioBps: number;
  status: "ACTIVE" | "OVERDUE_FROZEN" | "REBASED_SETTLED";
  nextAuditDeadline: number;
  currentEpoch: number;
  expectedDatasetSha256: string;
  bufferBalance: number;
  liquidBuyerBalance: number;
}

export interface SecurityRevertScenario {
  id: string;
  title: string;
  category: "Cryptographic Tamper" | "Access Control" | "Replay Attack" | "SLA Timing" | "Asset Freeze" | "Statistical Gate";
  solidityError: string;
  signature: string;
  triggerDescription: string;
  expectedBehavior: string;
  gasEstimated: number;
}
