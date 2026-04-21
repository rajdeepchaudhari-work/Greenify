// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./ProjectRegistry.sol";

/// @title CarbonCredit
/// @notice ERC-1155 where tokenId == projectId. 1 unit == 1 tonne CO2e.
contract CarbonCredit is ERC1155, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    ProjectRegistry public immutable registry;

    event CreditsRetired(address indexed from, uint256 indexed projectId, uint256 amount);

    error ProjectNotApproved(uint256 projectId);
    error InsufficientBalance(address owner, uint256 projectId, uint256 requested, uint256 available);

    constructor(address admin, address registryAddr, string memory baseUri) ERC1155(baseUri) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        registry = ProjectRegistry(registryAddr);
    }

    function mint(address to, uint256 projectId, uint256 amount) external onlyRole(MINTER_ROLE) {
        if (!registry.isApproved(projectId)) revert ProjectNotApproved(projectId);
        _mint(to, projectId, amount, "");
        registry.recordIssuance(projectId, amount);
    }

    function retire(uint256 projectId, uint256 amount) external {
        uint256 bal = balanceOf(msg.sender, projectId);
        if (bal < amount) revert InsufficientBalance(msg.sender, projectId, amount, bal);
        _burn(msg.sender, projectId, amount);
        emit CreditsRetired(msg.sender, projectId, amount);
    }

    function setURI(string calldata newUri) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _setURI(newUri);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC1155, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
