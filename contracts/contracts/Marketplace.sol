// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Marketplace
/// @notice Escrowed ERC-1155 carbon-credit marketplace with a protocol fee.
contract Marketplace is ERC1155Holder, ReentrancyGuard, Ownable {
    struct Listing {
        address seller;
        uint256 projectId;
        uint256 amount;
        uint256 pricePerUnit;
        bool active;
    }

    IERC1155 public immutable credits;
    address public feeRecipient;
    uint96 public feeBps; // 1% = 100

    uint256 public nextListingId;
    mapping(uint256 => Listing) public listings;

    event Listed(
        uint256 indexed id,
        address indexed seller,
        uint256 indexed projectId,
        uint256 amount,
        uint256 pricePerUnit
    );
    event Sold(uint256 indexed id, address indexed buyer, uint256 amount, uint256 totalPaid);
    event Cancelled(uint256 indexed id);
    event FeeUpdated(uint96 newFeeBps, address newRecipient);

    error NotSeller();
    error ListingInactive();
    error NotEnoughAvailable();
    error InsufficientPayment();
    error TransferFailed();
    error InvalidFee();

    constructor(address creditsAddr, address admin, address feeRecipient_, uint96 feeBps_) Ownable(admin) {
        if (feeBps_ > 1000) revert InvalidFee(); // cap 10%
        credits = IERC1155(creditsAddr);
        feeRecipient = feeRecipient_;
        feeBps = feeBps_;
    }

    function setFee(uint96 newFeeBps, address newRecipient) external onlyOwner {
        if (newFeeBps > 1000) revert InvalidFee();
        feeBps = newFeeBps;
        feeRecipient = newRecipient;
        emit FeeUpdated(newFeeBps, newRecipient);
    }

    function list(uint256 projectId, uint256 amount, uint256 pricePerUnit) external returns (uint256 id) {
        id = nextListingId++;
        listings[id] = Listing({
            seller: msg.sender,
            projectId: projectId,
            amount: amount,
            pricePerUnit: pricePerUnit,
            active: true
        });
        credits.safeTransferFrom(msg.sender, address(this), projectId, amount, "");
        emit Listed(id, msg.sender, projectId, amount, pricePerUnit);
    }

    function cancel(uint256 id) external nonReentrant {
        Listing storage l = listings[id];
        if (!l.active) revert ListingInactive();
        if (l.seller != msg.sender) revert NotSeller();
        l.active = false;
        uint256 remaining = l.amount;
        l.amount = 0;
        credits.safeTransferFrom(address(this), msg.sender, l.projectId, remaining, "");
        emit Cancelled(id);
    }

    function buy(uint256 id, uint256 amount) external payable nonReentrant {
        Listing storage l = listings[id];
        if (!l.active) revert ListingInactive();
        if (amount == 0 || amount > l.amount) revert NotEnoughAvailable();

        uint256 total = amount * l.pricePerUnit;
        if (msg.value < total) revert InsufficientPayment();

        uint256 fee = (total * feeBps) / 10_000;
        uint256 sellerProceeds = total - fee;

        l.amount -= amount;
        if (l.amount == 0) l.active = false;

        credits.safeTransferFrom(address(this), msg.sender, l.projectId, amount, "");

        _payout(l.seller, sellerProceeds);
        if (fee > 0) _payout(feeRecipient, fee);
        if (msg.value > total) _payout(msg.sender, msg.value - total);

        emit Sold(id, msg.sender, amount, total);
    }

    function _payout(address to, uint256 value) internal {
        (bool ok, ) = to.call{value: value}("");
        if (!ok) revert TransferFailed();
    }
}
