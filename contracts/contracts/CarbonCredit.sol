// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./ProjectRegistry.sol";

/// @title  CarbonCredit
/// @author Rajdeep Chaudhari (Greenify)
/// @notice ERC-1155 carbon credit token. `tokenId == projectId` in
///         {ProjectRegistry}; 1 unit of any tokenId == 1 tonne of CO₂
///         equivalent offset. Credits are minted by an authorised minter
///         only for projects the registry has approved, and can be
///         permanently burned via {retire} to claim the offset.
/// @dev    ERC-1155 is chosen over ERC-20 (loses per-project provenance) and
///         ERC-721 (credits within a project are fungible) — one contract
///         holds many project batches, each fungible internally.
contract CarbonCredit is ERC1155, AccessControl {
    /// @notice Role granted to addresses allowed to call {mint}.
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    /// @notice Registry contract that gates issuance and tracks provenance.
    ProjectRegistry public immutable registry;

    /// @notice Emitted when a holder burns credits to claim the offset.
    /// @param from      Address that retired the credits.
    /// @param projectId Project whose credits were retired.
    /// @param amount    Number of credits burned.
    event CreditsRetired(address indexed from, uint256 indexed projectId, uint256 amount);

    /// @notice Thrown when minting is attempted for an unapproved project.
    error ProjectNotApproved(uint256 projectId);

    /// @notice Thrown when {retire} is called with more than the caller holds.
    /// @param owner      Holder address.
    /// @param projectId  Project whose credits the holder attempted to burn.
    /// @param requested  Amount the caller asked to retire.
    /// @param available  Amount the caller actually holds.
    error InsufficientBalance(address owner, uint256 projectId, uint256 requested, uint256 available);

    /// @notice Deploy the credit token and link it to an existing registry.
    /// @param admin        Initial admin + minter.
    /// @param registryAddr Address of a deployed {ProjectRegistry}.
    /// @param baseUri      Base URI used by ERC-1155 metadata resolution
    ///                     (e.g. "ipfs://").
    constructor(address admin, address registryAddr, string memory baseUri) ERC1155(baseUri) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        registry = ProjectRegistry(registryAddr);
    }

    /// @notice Mint `amount` credits of an approved project to `to`.
    /// @dev    Only holders of {MINTER_ROLE} may call. Reverts if the project
    ///         is not approved in the registry. Also updates registry
    ///         issuance accounting via {ProjectRegistry.recordIssuance}.
    /// @param  to        Recipient wallet.
    /// @param  projectId Project id / ERC-1155 tokenId.
    /// @param  amount    Number of credits to mint (each = 1 tonne CO₂e).
    function mint(address to, uint256 projectId, uint256 amount) external onlyRole(MINTER_ROLE) {
        if (!registry.isApproved(projectId)) revert ProjectNotApproved(projectId);
        _mint(to, projectId, amount, "");
        registry.recordIssuance(projectId, amount);
    }

    /// @notice Permanently burn the caller's credits to claim the offset.
    /// @dev    The resulting {CreditsRetired} event is the on-chain "receipt"
    ///         auditors rely on. No recycling, no relisting.
    /// @param  projectId Project whose credits are being retired.
    /// @param  amount    Number of credits to burn.
    function retire(uint256 projectId, uint256 amount) external {
        uint256 bal = balanceOf(msg.sender, projectId);
        if (bal < amount) revert InsufficientBalance(msg.sender, projectId, amount, bal);
        _burn(msg.sender, projectId, amount);
        emit CreditsRetired(msg.sender, projectId, amount);
    }

    /// @notice Update the base URI used by ERC-1155 metadata resolution.
    /// @dev    Admin-only; emits the standard {URI} event.
    /// @param  newUri New base URI (typically "ipfs://").
    function setURI(string calldata newUri) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _setURI(newUri);
    }

    /// @inheritdoc ERC1155
    function supportsInterface(bytes4 interfaceId) public view override(ERC1155, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
