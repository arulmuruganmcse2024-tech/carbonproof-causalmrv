// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {IERC1155Receiver} from "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title CarbonProofVault
 * @notice On-Chain Dual-Tranche Verification, Dynamic Buffer Slashing & Causal Settlement Engine.
 *         Track 1 Submission: IEEE ClimateChain Global Hackathon 2026.
 * @dev Implements permissionless SLA auditing, EIP-712 oracle verification, automated buffer burning,
 *      and transfer-freeze mechanisms for unbacked carbon units.
 */
contract CarbonProofVault is ERC1155, IERC1155Receiver, AccessControl, EIP712 {
    using ECDSA for bytes32;

    // --- Roles ---
    bytes32 public constant PROJECT_DEVELOPER = keccak256("PROJECT_DEVELOPER");
    bytes32 public constant ORACLE_AUDITOR = keccak256("ORACLE_AUDITOR");
    bytes32 public constant REGISTRY_GOVERNOR = keccak256("REGISTRY_GOVERNOR");

    // --- EIP-712 TypeHash ---
    bytes32 public constant CAUSAL_AUDIT_TYPEHASH = keccak256(
        "CausalAuditPayload(uint256 projectId,uint256 epoch,uint256 issuedVCUs,uint256 verifiedVCUs,uint256 excessVCUs,uint256 retiredExcessVCUs,uint256 activeExcessVCUs,uint256 empiricalPValueBps,uint256 spatialLeakagePenaltyBps,bytes32 panelCsvSha256)"
    );

    // --- Project Lifecycle State ---
    enum ProjectStatus {
        UNINITIALIZED,
        ACTIVE,
        OVERDUE_FROZEN,
        REBASED_SETTLED
    }

    struct ProjectState {
        string name;
        uint256 epochDuration;
        uint256 nextAuditDeadline;
        uint256 currentEpoch;
        uint256 backingRatioBps;
        bytes32 expectedDatasetSha256;
        ProjectStatus status;
        uint256 issuedVCUs;
        uint256 verifiedVCUs;
        uint256 excessVCUs;
        uint256 retiredExcessVCUs;
        uint256 activeExcessVCUs;
        uint256 empiricalPValueBps;
        uint256 spatialLeakagePenaltyBps;
    }

    struct CausalAuditPayload {
        uint256 projectId;
        uint256 epoch;
        uint256 issuedVCUs;
        uint256 verifiedVCUs;
        uint256 excessVCUs;
        uint256 retiredExcessVCUs;
        uint256 activeExcessVCUs;
        uint256 empiricalPValueBps;
        uint256 spatialLeakagePenaltyBps;
        bytes32 panelCsvSha256;
    }

    // --- State Storage ---
    mapping(uint256 => ProjectState) public projects;

    // --- Custom Errors ---
    error UnauthorizedRole(address caller, bytes32 requiredRole);
    error TamperedDatasetHash(bytes32 expectedHash, bytes32 providedHash);
    error InvalidEpochSequence(uint256 expectedEpoch, uint256 providedEpoch);
    error EpochNotYetOverdue(uint256 deadline, uint256 currentTimestamp);
    error TransferFrozenProjectOverdue(uint256 projectId);
    error StatisticallyInsignificantAudit(uint256 pValueBps);
    error ProjectAlreadyInitialized(uint256 projectId);
    error ProjectDoesNotExist(uint256 projectId);

    // --- Events ---
    event ProjectInitialized(
        uint256 indexed projectId,
        string name,
        uint256 verifiedTokenId,
        uint256 bufferTokenId,
        uint256 initialIssuedVCUs,
        uint256 initialBufferVCUs,
        bytes32 expectedDatasetSha256
    );

    event ProjectMarkedOverdue(
        uint256 indexed projectId,
        uint256 deadline,
        uint256 currentTimestamp
    );

    event CausalAuditSettled(
        uint256 indexed projectId,
        uint256 indexed epoch,
        uint256 verifiedVCUs,
        uint256 excessVCUs,
        uint256 slashedBuffer,
        uint256 newBackingRatioBps
    );

    event BackingRatioRebased(
        uint256 indexed projectId,
        uint256 oldRatioBps,
        uint256 newRatioBps
    );

    /**
     * @notice Initializes the CarbonProof Dual-Tranche Vault.
     */
    constructor()
        ERC1155("https://carbonproof.network/api/v1/tokens/{id}.json")
        EIP712("CarbonProof CausalMRV Protocol", "1.0.0")
    {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(REGISTRY_GOVERNOR, msg.sender);
    }

    /**
     * @notice Token ID calculation helpers
     */
    function getVerifiedTokenId(uint256 projectId) public pure returns (uint256) {
        return projectId * 2;
    }

    function getBufferTokenId(uint256 projectId) public pure returns (uint256) {
        return projectId * 2 + 1;
    }

    function getProjectTokens(uint256 projectId)
        external
        pure
        returns (uint256 verifiedTokenId, uint256 bufferTokenId)
    {
        return (getVerifiedTokenId(projectId), getBufferTokenId(projectId));
    }

    /**
     * @notice Registers and initializes a benchmark carbon project with dual-tranche tokens.
     * @param projectId Numerical identifier (e.g. 1 for Kariba, 2 for Maisa, 3 for IFM)
     * @param name Project descriptor string
     * @param initialIssuedVCUs Initial verified carbon units to mint to buyer
     * @param initialBufferVCUs Initial risk buffer reserve to lock inside vault
     * @param expectedDatasetSha256 Cryptographic commitment to the WRI/GFW empirical panel CSV
     * @param initialBuyer Recipient address for liquid verified carbon units
     * @param epochDuration Verification interval duration in seconds (e.g. 30 days)
     */
    function initializeProject(
        uint256 projectId,
        string calldata name,
        uint256 initialIssuedVCUs,
        uint256 initialBufferVCUs,
        bytes32 expectedDatasetSha256,
        address initialBuyer,
        uint256 epochDuration
    ) external onlyRole(REGISTRY_GOVERNOR) {
        if (projects[projectId].status != ProjectStatus.UNINITIALIZED) {
            revert ProjectAlreadyInitialized(projectId);
        }

        uint256 verifiedTokenId = getVerifiedTokenId(projectId);
        uint256 bufferTokenId = getBufferTokenId(projectId);

        projects[projectId] = ProjectState({
            name: name,
            epochDuration: epochDuration,
            nextAuditDeadline: block.timestamp + epochDuration,
            currentEpoch: 0,
            backingRatioBps: 10000, // 100.00% initial backing
            expectedDatasetSha256: expectedDatasetSha256,
            status: ProjectStatus.ACTIVE,
            issuedVCUs: initialIssuedVCUs,
            verifiedVCUs: initialIssuedVCUs,
            excessVCUs: 0,
            retiredExcessVCUs: 0,
            activeExcessVCUs: 0,
            empiricalPValueBps: 0,
            spatialLeakagePenaltyBps: 0
        });

        // Mint liquid verified tokens to buyer
        if (initialIssuedVCUs > 0) {
            _mint(initialBuyer, verifiedTokenId, initialIssuedVCUs, "");
        }

        // Lock dynamic buffer tokens inside the vault contract
        if (initialBufferVCUs > 0) {
            _mint(address(this), bufferTokenId, initialBufferVCUs, "");
        }

        emit ProjectInitialized(
            projectId,
            name,
            verifiedTokenId,
            bufferTokenId,
            initialIssuedVCUs,
            initialBufferVCUs,
            expectedDatasetSha256
        );
    }

    /**
     * @notice Permissionless SLA Clock: transitions project to OVERDUE_FROZEN if audit deadline passed.
     * @dev Freezes all safeTransferFrom calls on the project's verifiedTokenId until re-audited.
     */
    function markOverdue(uint256 projectId) external {
        ProjectState storage project = projects[projectId];
        if (project.status == ProjectStatus.UNINITIALIZED) {
            revert ProjectDoesNotExist(projectId);
        }

        if (block.timestamp <= project.nextAuditDeadline) {
            revert EpochNotYetOverdue(project.nextAuditDeadline, block.timestamp);
        }

        project.status = ProjectStatus.OVERDUE_FROZEN;
        emit ProjectMarkedOverdue(projectId, project.nextAuditDeadline, block.timestamp);
    }

    /**
     * @notice Verifies EIP-712 Causal Audit from Oracle Auditor and settles automated buffer slashing & rebase.
     * @param payload Causal audit metrics and dataset commitment
     * @param signature Cryptographic signature produced by the ORACLE_AUDITOR
     */
    function submitCausalAudit(
        CausalAuditPayload calldata payload,
        bytes calldata signature
    ) external {
        ProjectState storage project = projects[payload.projectId];
        if (project.status == ProjectStatus.UNINITIALIZED) {
            revert ProjectDoesNotExist(payload.projectId);
        }

        // 1. Verify EIP-712 Signature & Signer Role
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
        address signer = digest.recover(signature);

        if (!hasRole(ORACLE_AUDITOR, signer)) {
            revert UnauthorizedRole(signer, ORACLE_AUDITOR);
        }

        // 2. Verify Cryptographic Dataset Integrity
        if (payload.panelCsvSha256 != project.expectedDatasetSha256) {
            revert TamperedDatasetHash(project.expectedDatasetSha256, payload.panelCsvSha256);
        }

        // 3. Verify Epoch Sequence (Anti-Replay)
        if (payload.epoch != project.currentEpoch + 1) {
            revert InvalidEpochSequence(project.currentEpoch + 1, payload.epoch);
        }

        // 4. Verify Statistical Significance (empirical p-value <= 5.00%, or <= 500 bps)
        if (payload.empiricalPValueBps > 500) {
            revert StatisticallyInsignificantAudit(payload.empiricalPValueBps);
        }

        // 5. Automated Buffer Slashing
        uint256 bufferTokenId = getBufferTokenId(payload.projectId);
        uint256 currentBufferBalance = balanceOf(address(this), bufferTokenId);
        uint256 slashedFromBuffer = payload.excessVCUs < currentBufferBalance
            ? payload.excessVCUs
            : currentBufferBalance;

        if (slashedFromBuffer > 0) {
            _burn(address(this), bufferTokenId, slashedFromBuffer);
        }

        // 6. Dynamic Rebase & Ratio Calculation
        uint256 oldRatioBps = project.backingRatioBps;
        uint256 newRatioBps = (payload.verifiedVCUs * 10000) / payload.issuedVCUs;

        // 7. Update Project State
        project.currentEpoch = payload.epoch;
        project.issuedVCUs = payload.issuedVCUs;
        project.verifiedVCUs = payload.verifiedVCUs;
        project.excessVCUs = payload.excessVCUs;
        project.retiredExcessVCUs = payload.retiredExcessVCUs;
        project.activeExcessVCUs = payload.activeExcessVCUs;
        project.empiricalPValueBps = payload.empiricalPValueBps;
        project.spatialLeakagePenaltyBps = payload.spatialLeakagePenaltyBps;
        project.backingRatioBps = newRatioBps;
        project.nextAuditDeadline = block.timestamp + project.epochDuration;
        project.status = ProjectStatus.REBASED_SETTLED;

        emit CausalAuditSettled(
            payload.projectId,
            payload.epoch,
            payload.verifiedVCUs,
            payload.excessVCUs,
            slashedFromBuffer,
            newRatioBps
        );

        emit BackingRatioRebased(payload.projectId, oldRatioBps, newRatioBps);
    }

    /**
     * @notice ERC1155 _update hook enforcing SLA transfer-freeze constraints.
     */
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal virtual override {
        // Enforce transfer freeze if token corresponds to an overdue project
        if (from != address(0)) {
            for (uint256 i = 0; i < ids.length; i++) {
                uint256 tokenId = ids[i];
                // Verified tokens are even (id % 2 == 0)
                if (tokenId % 2 == 0) {
                    uint256 projectId = tokenId / 2;
                    if (projects[projectId].status == ProjectStatus.OVERDUE_FROZEN) {
                        revert TransferFrozenProjectOverdue(projectId);
                    }
                }
            }
        }

        super._update(from, to, ids, values);
    }

    /**
     * @notice IERC1155Receiver hooks allowing vault to escrow buffer tokens.
     */
    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address,
        address,
        uint256[] calldata,
        uint256[] calldata,
        bytes calldata
    ) external pure override returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }

    /**
     * @notice View function to retrieve complete project state.
     */
    function getProject(uint256 projectId) external view returns (ProjectState memory) {
        return projects[projectId];
    }

    /**
     * @notice Override required by Solidity for multiple inheritance.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC1155, AccessControl, IERC165)
        returns (bool)
    {
        return interfaceId == type(IERC1155Receiver).interfaceId || super.supportsInterface(interfaceId);
    }
}
