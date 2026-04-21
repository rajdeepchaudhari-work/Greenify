// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

/// @title ProjectRegistry
/// @notice Registers environmental projects whose carbon offsets back credit mints.
contract ProjectRegistry is AccessControl {
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    struct Project {
        address owner;
        string ipfsCid;
        bool approved;
        uint256 totalIssued;
    }

    uint256 public nextProjectId;
    mapping(uint256 => Project) private projects;

    event ProjectRegistered(uint256 indexed id, address indexed owner, string ipfsCid);
    event ProjectApproved(uint256 indexed id, address indexed verifier);
    event CreditsIssued(uint256 indexed id, uint256 amount);

    error ProjectNotFound(uint256 id);
    error NotProjectOwner(address caller);
    error ProjectAlreadyApproved(uint256 id);
    error ProjectNotApproved(uint256 id);

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(VERIFIER_ROLE, admin);
    }

    function registerProject(string calldata ipfsCid) external returns (uint256 id) {
        id = nextProjectId++;
        projects[id] = Project({owner: msg.sender, ipfsCid: ipfsCid, approved: false, totalIssued: 0});
        emit ProjectRegistered(id, msg.sender, ipfsCid);
    }

    function approveProject(uint256 id) external onlyRole(VERIFIER_ROLE) {
        Project storage p = projects[id];
        if (p.owner == address(0)) revert ProjectNotFound(id);
        if (p.approved) revert ProjectAlreadyApproved(id);
        p.approved = true;
        emit ProjectApproved(id, msg.sender);
    }

    function getProject(uint256 id) external view returns (Project memory) {
        Project memory p = projects[id];
        if (p.owner == address(0)) revert ProjectNotFound(id);
        return p;
    }

    function isApproved(uint256 id) external view returns (bool) {
        return projects[id].approved;
    }

    function ownerOfProject(uint256 id) external view returns (address) {
        return projects[id].owner;
    }

    /// @dev Called by CarbonCredit on mint to update issuance accounting.
    function recordIssuance(uint256 id, uint256 amount) external onlyRole(VERIFIER_ROLE) {
        Project storage p = projects[id];
        if (p.owner == address(0)) revert ProjectNotFound(id);
        if (!p.approved) revert ProjectNotApproved(id);
        p.totalIssued += amount;
        emit CreditsIssued(id, amount);
    }
}
