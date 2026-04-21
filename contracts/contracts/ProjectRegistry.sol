// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

/// @title  ProjectRegistry
/// @author Rajdeep Chaudhari (Greenify)
/// @notice Source of truth for environmental projects whose offsets back
///         carbon credits minted by {CarbonCredit}.
/// @dev    Uses OpenZeppelin {AccessControl}. A verifier (oracle, auditor
///         or multisig in production) must approve a project before any
///         credits can be issued against it.
contract ProjectRegistry is AccessControl {
    /// @notice Role granted to addresses allowed to approve projects and
    ///         record issuance on behalf of {CarbonCredit}.
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    /// @notice On-chain representation of an environmental project.
    /// @param owner        Registering address (typically the project operator).
    /// @param ipfsCid      IPFS CID of the pinned metadata JSON.
    /// @param approved     Whether a verifier has approved the project.
    /// @param totalIssued  Running total of credits minted for this project.
    struct Project {
        address owner;
        string ipfsCid;
        bool approved;
        uint256 totalIssued;
    }

    /// @notice Monotonically-increasing project id, also used as the ERC-1155
    ///         tokenId for credits minted from this project.
    uint256 public nextProjectId;

    /// @dev projectId => Project struct
    mapping(uint256 => Project) private projects;

    /// @notice Emitted when a new project is registered.
    /// @param id       Project id (also the ERC-1155 tokenId).
    /// @param owner    Address that registered the project.
    /// @param ipfsCid  IPFS CID of the pinned metadata JSON.
    event ProjectRegistered(uint256 indexed id, address indexed owner, string ipfsCid);

    /// @notice Emitted when a verifier approves a project for issuance.
    /// @param id        Project id.
    /// @param verifier  Address that performed the approval.
    event ProjectApproved(uint256 indexed id, address indexed verifier);

    /// @notice Emitted whenever new credits are issued (minted) for a project.
    /// @param id      Project id.
    /// @param amount  Number of credits minted in this issuance.
    event CreditsIssued(uint256 indexed id, uint256 amount);

    /// @notice Thrown when an operation references an unregistered id.
    error ProjectNotFound(uint256 id);
    /// @notice Reserved: thrown when a non-owner attempts an owner-only action.
    error NotProjectOwner(address caller);
    /// @notice Thrown when trying to approve an already-approved project.
    error ProjectAlreadyApproved(uint256 id);
    /// @notice Thrown when trying to issue credits for an unapproved project.
    error ProjectNotApproved(uint256 id);

    /// @notice Deploy the registry and grant admin + verifier roles to `admin`.
    /// @param  admin Initial DEFAULT_ADMIN_ROLE + VERIFIER_ROLE holder.
    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(VERIFIER_ROLE, admin);
    }

    /// @notice Register a new environmental project.
    /// @dev    Anyone can register; approval is gated separately by
    ///         {VERIFIER_ROLE}.
    /// @param  ipfsCid IPFS CID of the pinned metadata JSON.
    /// @return id      Newly assigned project id.
    function registerProject(string calldata ipfsCid) external returns (uint256 id) {
        id = nextProjectId++;
        projects[id] = Project({owner: msg.sender, ipfsCid: ipfsCid, approved: false, totalIssued: 0});
        emit ProjectRegistered(id, msg.sender, ipfsCid);
    }

    /// @notice Approve a project so credits can be minted against it.
    /// @dev    Only callable by holders of {VERIFIER_ROLE}.
    /// @param  id Project id to approve.
    function approveProject(uint256 id) external onlyRole(VERIFIER_ROLE) {
        Project storage p = projects[id];
        if (p.owner == address(0)) revert ProjectNotFound(id);
        if (p.approved) revert ProjectAlreadyApproved(id);
        p.approved = true;
        emit ProjectApproved(id, msg.sender);
    }

    /// @notice Read a project's full on-chain state.
    /// @param  id Project id to query.
    /// @return The full {Project} struct.
    function getProject(uint256 id) external view returns (Project memory) {
        Project memory p = projects[id];
        if (p.owner == address(0)) revert ProjectNotFound(id);
        return p;
    }

    /// @notice Whether a project has been approved for issuance.
    /// @param  id Project id to query.
    /// @return True if approved, false otherwise.
    function isApproved(uint256 id) external view returns (bool) {
        return projects[id].approved;
    }

    /// @notice The registered owner (creator) of a project.
    /// @param  id Project id.
    /// @return Owner address, or the zero address if not registered.
    function ownerOfProject(uint256 id) external view returns (address) {
        return projects[id].owner;
    }

    /// @notice Hook used by {CarbonCredit} during minting to update issuance
    ///         accounting.
    /// @dev    The {CarbonCredit} contract must hold {VERIFIER_ROLE}; reverts
    ///         if the project is unapproved.
    /// @param  id     Project id whose issuance total should grow.
    /// @param  amount Number of credits newly minted.
    function recordIssuance(uint256 id, uint256 amount) external onlyRole(VERIFIER_ROLE) {
        Project storage p = projects[id];
        if (p.owner == address(0)) revert ProjectNotFound(id);
        if (!p.approved) revert ProjectNotApproved(id);
        p.totalIssued += amount;
        emit CreditsIssued(id, amount);
    }
}
